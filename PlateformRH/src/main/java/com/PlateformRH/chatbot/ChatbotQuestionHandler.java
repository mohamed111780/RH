package com.PlateformRH.chatbot;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ChatbotQuestionHandler {

    private static final String[] LIST_VERBS = {
            "liste", "lister", "listez", "quelles", "quels", "quelle", "quel",
            "affiche", "afficher", "affichez", "montre", "montrer", "montrez",
            "donne", "donnez", "donner", "donnez moi", "donne moi", "donne-moi", "donnez-moi",
            "montre moi", "montrez moi", "montre-moi", "montrez-moi",
            "affiche moi", "affichez moi", "affiche-moi", "affichez-moi",
            "enumere", "enumerer", "enumerez", "cite", "citer", "citez",
            "consulte", "consulter", "consultez", "voir", "vois", "voyez",
            "parle", "parler", "parlez", "parle moi", "parlez moi", "parle-moi", "parlez-moi",
            "je veux", "je souhaite", "j aimerais", "j'aimerais",
            "qu est ce que", "qu'est-ce que", "qu est ce qu", "qu'est-ce qu",
            "c est quoi", "c'est quoi", "sont les", "est la liste", "y a t il", "y a-t-il", "il y a"
    };

    private static final String[] COUNT_WORDS = {
            "combien", "nombre", "total", "stats", "statistique", "statistiques"
    };

    private final ChatbotDataService chatbotDataService;

    public Optional<String> tryDirectAnswer(String question, ChatbotAccessLevel accessLevel) {
        return tryDirectAnswer(question, accessLevel, false);
    }

    public Optional<String> tryRelaxedDirectAnswer(String question, ChatbotAccessLevel accessLevel) {
        return tryDirectAnswer(question, accessLevel, true);
    }

    private Optional<String> tryDirectAnswer(String question, ChatbotAccessLevel accessLevel, boolean relaxed) {
        String normalized = normalize(question);
        if (normalized.isBlank()) {
            return Optional.empty();
        }

        if (!relaxed) {
            Optional<String> greeting = tryGreeting(normalized, accessLevel);
            if (greeting.isPresent()) {
                return greeting;
            }
        }

        Optional<String> denied = checkForbiddenTopic(normalized, accessLevel);
        if (denied.isPresent()) {
            return denied;
        }

        if (!relaxed && containsAny(normalized,
                "module", "modules", "fonctionnalite", "fonctionnalites", "fonction", "fonctions",
                "que fait", "a quoi sert", "comment fonctionne", "comment ca marche")) {
            return Optional.of(chatbotDataService.describePlatformModules(accessLevel));
        }

        QueryTopic topic = detectTopic(normalized);
        if (topic == QueryTopic.NONE) {
            return Optional.empty();
        }

        QueryIntent intent = detectIntent(normalized, relaxed);
        if (intent == QueryIntent.ACCESS) {
            return Optional.of(describeAccess(accessLevel));
        }

        return routeQuery(topic, intent, accessLevel, normalized);
    }

    private Optional<String> routeQuery(QueryTopic topic, QueryIntent intent, ChatbotAccessLevel accessLevel, String normalized) {
        return switch (topic) {
            case FORMATIONS -> routeFormations(intent, accessLevel);
            case OFFRES -> routeOffres(intent, accessLevel, normalized);
            case EMPLOYES -> routeEmployes(intent, accessLevel);
            case CONGES -> routeConges(intent, accessLevel, normalized);
            case CANDIDATURES -> routeCandidatures(intent, accessLevel);
            case UTILISATEURS -> routeUtilisateurs(intent, accessLevel);
            case DEMANDES_FORMATION -> routeDemandesFormation(intent, accessLevel);
            case NONE -> Optional.empty();
        };
    }

    private Optional<String> routeFormations(QueryIntent intent, ChatbotAccessLevel accessLevel) {
        return switch (intent) {
            case COUNT -> answerIfAllowed(accessLevel, ChatbotAccessLevel.EMPLOYE,
                    chatbotDataService.summarizeFormations());
            case OPEN, LIST, DESCRIBE, NONE -> answerIfAllowed(accessLevel, ChatbotAccessLevel.EMPLOYE,
                    chatbotDataService.listFormations());
            default -> Optional.empty();
        };
    }

    private Optional<String> routeOffres(QueryIntent intent, ChatbotAccessLevel accessLevel, String normalized) {
        return switch (intent) {
            case OPEN -> Optional.of(chatbotDataService.listOpenOffres(accessLevel));
            case LIST, DESCRIBE, NONE -> Optional.of(chatbotDataService.listOffres(accessLevel));
            case COUNT -> Optional.of(
                    mentions(normalized, "ouverte", "ouvertes", "ouverts")
                            ? chatbotDataService.summarizeOpenOffres(accessLevel)
                            : chatbotDataService.summarizeOffres(accessLevel));
            default -> Optional.empty();
        };
    }

    private Optional<String> routeEmployes(QueryIntent intent, ChatbotAccessLevel accessLevel) {
        return switch (intent) {
            case COUNT -> answerIfAllowed(accessLevel, ChatbotAccessLevel.FULL,
                    chatbotDataService.summarizeEmployes());
            case LIST, DESCRIBE, NONE -> answerIfAllowed(accessLevel, ChatbotAccessLevel.FULL,
                    chatbotDataService.listEmployes());
            default -> Optional.empty();
        };
    }

    private Optional<String> routeConges(QueryIntent intent, ChatbotAccessLevel accessLevel, String normalized) {
        boolean pending = mentions(normalized, "en attente", "attente", "pending", "a valider", "a traiter");

        return switch (intent) {
            case PENDING -> answerIfAllowed(accessLevel, ChatbotAccessLevel.FULL,
                    containsAny(normalized, COUNT_WORDS)
                            ? chatbotDataService.summarizePendingConges()
                            : chatbotDataService.listPendingConges());
            case LIST, OPEN, DESCRIBE, NONE -> answerIfAllowed(accessLevel, ChatbotAccessLevel.FULL,
                    chatbotDataService.listDemandesConge());
            case COUNT -> answerIfAllowed(accessLevel, ChatbotAccessLevel.FULL,
                    pending
                            ? chatbotDataService.summarizePendingConges()
                            : chatbotDataService.summarizeDemandesConge());
            default -> Optional.empty();
        };
    }

    private Optional<String> routeCandidatures(QueryIntent intent, ChatbotAccessLevel accessLevel) {
        return switch (intent) {
            case COUNT -> answerIfAllowed(accessLevel, ChatbotAccessLevel.FULL,
                    chatbotDataService.summarizeCandidatures());
            case LIST, DESCRIBE, NONE -> answerIfAllowed(accessLevel, ChatbotAccessLevel.FULL,
                    chatbotDataService.listCandidatures());
            default -> Optional.empty();
        };
    }

    private Optional<String> routeUtilisateurs(QueryIntent intent, ChatbotAccessLevel accessLevel) {
        if (intent == QueryIntent.COUNT || intent == QueryIntent.LIST || intent == QueryIntent.NONE) {
            return answerIfAllowed(accessLevel, ChatbotAccessLevel.FULL,
                    chatbotDataService.summarizeUtilisateurs());
        }
        return Optional.empty();
    }

    private Optional<String> routeDemandesFormation(QueryIntent intent, ChatbotAccessLevel accessLevel) {
        if (intent == QueryIntent.COUNT || intent == QueryIntent.LIST || intent == QueryIntent.NONE) {
            return answerIfAllowed(accessLevel, ChatbotAccessLevel.FULL,
                    chatbotDataService.summarizeDemandesFormation());
        }
        return Optional.empty();
    }

    private QueryTopic detectTopic(String normalized) {
        if (mentions(normalized, "demande formation", "demandes formation", "demandes de formation")) {
            return QueryTopic.DEMANDES_FORMATION;
        }
        if (mentions(normalized, "formation", "formations", "catalogue formation", "catalogue des formations")) {
            return QueryTopic.FORMATIONS;
        }
        if (mentions(normalized, "candidature", "candidatures", "candidat", "candidats", "matching", "kanban")) {
            return QueryTopic.CANDIDATURES;
        }
        if (mentions(normalized, "conge", "conges", "absence", "absences")) {
            return QueryTopic.CONGES;
        }
        if (mentions(normalized, "employe", "employes", "collaborateur", "collaborateurs", "matricule")) {
            return QueryTopic.EMPLOYES;
        }
        if (mentions(normalized, "utilisateur", "utilisateurs", "compte", "comptes")) {
            return QueryTopic.UTILISATEURS;
        }
        if (mentions(normalized, "offre", "offres", "emploi", "emplois", "poste", "postes", "recrutement")) {
            return QueryTopic.OFFRES;
        }
        return QueryTopic.NONE;
    }

    private QueryIntent detectIntent(String normalized, boolean relaxed) {
        if (containsAny(normalized, "acces", "autorise", "autorisee", "peux", "puis", "peut")
                && containsAny(normalized, "consulter", "voir", "acceder", "faire", "poser")) {
            return QueryIntent.ACCESS;
        }

        if (mentions(normalized, "en attente", "attente", "pending", "a valider", "a traiter")) {
            return QueryIntent.PENDING;
        }

        if (containsAny(normalized, COUNT_WORDS)) {
            return QueryIntent.COUNT;
        }

        if (mentions(normalized, "ouverte", "ouvertes", "ouverts", "publie", "publiees")
                && mentions(normalized, "offre", "offres", "emploi", "emplois", "poste", "postes")) {
            return QueryIntent.OPEN;
        }

        if (containsAny(normalized, LIST_VERBS)) {
            return QueryIntent.LIST;
        }

        if (mentions(normalized, "disponible", "disponibles", "catalogue", "propose", "proposees")) {
            return QueryIntent.LIST;
        }

        if (relaxed) {
            return QueryIntent.LIST;
        }

        return QueryIntent.NONE;
    }

    private Optional<String> tryGreeting(String normalized, ChatbotAccessLevel accessLevel) {
        if (!containsAny(normalized, "bonjour", "salut", "bonsoir", "hello", "coucou", "aide", "help")) {
            return Optional.empty();
        }

        if (normalized.length() > 80 && !containsAny(normalized, "aide", "help")) {
            return Optional.empty();
        }

        if (detectTopic(normalized) != QueryTopic.NONE) {
            return Optional.empty();
        }

        String accessHint = switch (accessLevel) {
            case FULL -> "Je peux vous renseigner sur les employes, conges, formations, offres et candidatures.";
            case EMPLOYE -> "Je peux vous renseigner sur les formations et les offres d'emploi.";
            case VISITEUR -> "Je peux vous renseigner sur les offres d'emploi externes.";
        };

        return Optional.of("Bonjour ! Je suis l'assistant RH de PlateformRH. " + accessHint
                + " Posez-moi une question precise, par exemple : \"Combien de conges en attente ?\" ou \"Donnez les formations disponibles\".");
    }

    private Optional<String> answerIfAllowed(
            ChatbotAccessLevel currentLevel,
            ChatbotAccessLevel minimumLevel,
            String answer
    ) {
        if (!isAtLeast(currentLevel, minimumLevel)) {
            return Optional.of(accessDeniedMessage(currentLevel));
        }
        return Optional.of(answer);
    }

    public Optional<String> tryAccessAnswer(String question, ChatbotAccessLevel accessLevel) {
        String normalized = normalize(question);
        if (containsAny(normalized, "acces", "autorise", "autorisee", "peux", "puis", "peut")
                && containsAny(normalized, "consulter", "voir", "acceder", "faire", "poser")) {
            return Optional.of(describeAccess(accessLevel));
        }
        return Optional.empty();
    }

    private Optional<String> checkForbiddenTopic(String normalized, ChatbotAccessLevel accessLevel) {
        if (accessLevel == ChatbotAccessLevel.FULL) {
            if (mentions(normalized, "mot de passe", "password", "token", "jwt", "secret")) {
                return Optional.of("Je ne peux pas traiter les questions liees aux mots de passe ou aux secrets de securite.");
            }
            return Optional.empty();
        }

        if (accessLevel == ChatbotAccessLevel.EMPLOYE) {
            if (mentions(normalized, "employe", "employes", "collaborateur", "collaborateurs", "utilisateur", "utilisateurs")) {
                return Optional.of("En tant qu'employe, je ne peux pas consulter les donnees des autres employes ou utilisateurs.");
            }
            if (mentions(normalized, "conge", "conges", "absence", "absences")) {
                return Optional.of("En tant qu'employe, je ne peux pas consulter les demandes de conge via ce chatbot. Utilisez votre espace personnel.");
            }
            if (mentions(normalized, "candidature", "candidatures", "kanban", "recrutement interne")) {
                return Optional.of("En tant qu'employe, je ne peux pas consulter le suivi des candidatures RH. Je peux seulement vous aider sur les formations et les offres d'emploi.");
            }
            if (mentions(normalized, "mot de passe", "password", "token", "jwt", "secret")) {
                return Optional.of("Je ne peux pas traiter les questions liees aux mots de passe ou aux secrets de securite.");
            }
        }

        if (accessLevel == ChatbotAccessLevel.VISITEUR) {
            if (mentions(normalized, "formation", "formations")) {
                return Optional.of("En tant que visiteur, je peux uniquement repondre sur les offres d'emploi externes.");
            }
            if (mentions(normalized, "employe", "employes", "utilisateur", "utilisateurs", "conge", "conges", "candidature", "candidatures")) {
                return Optional.of("En tant que visiteur, je peux uniquement repondre sur les offres d'emploi externes.");
            }
            if (mentions(normalized, "interne", "internes") && mentions(normalized, "offre", "offres")) {
                return Optional.of("Les offres internes ne sont pas accessibles aux visiteurs. Connectez-vous avec un compte employe pour les consulter.");
            }
        }

        return Optional.empty();
    }

    private String describeAccess(ChatbotAccessLevel accessLevel) {
        return switch (accessLevel) {
            case FULL -> "Votre acces RH/Admin vous permet de consulter les employes, conges, formations, offres, candidatures et statistiques de la plateforme.";
            case EMPLOYE -> "Votre acces employe vous permet de consulter les formations disponibles et les offres d'emploi internes ou externes.";
            case VISITEUR -> "Votre acces visiteur vous permet de consulter uniquement les offres d'emploi externes.";
        };
    }

    private String accessDeniedMessage(ChatbotAccessLevel accessLevel) {
        return switch (accessLevel) {
            case EMPLOYE -> "Cette information n'est pas accessible avec votre profil employe. Je peux vous aider sur les formations et les offres d'emploi.";
            case VISITEUR -> "Cette information n'est pas accessible aux visiteurs. Je peux vous aider uniquement sur les offres d'emploi externes.";
            default -> "Je ne dispose pas de cette information.";
        };
    }

    private boolean isAtLeast(ChatbotAccessLevel current, ChatbotAccessLevel minimum) {
        return current.ordinal() <= minimum.ordinal();
    }

    private boolean mentions(String text, String... keywords) {
        for (String keyword : keywords) {
            String normalizedKeyword = normalize(keyword);
            if (normalizedKeyword.contains(" ")) {
                if (text.contains(normalizedKeyword)) {
                    return true;
                }
                continue;
            }
            Pattern pattern = Pattern.compile("\\b" + Pattern.quote(normalizedKeyword) + "\\w*\\b");
            if (pattern.matcher(text).find()) {
                return true;
            }
        }
        return false;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            String normalizedKeyword = normalize(keyword);
            if (normalizedKeyword.contains(" ")) {
                if (text.contains(normalizedKeyword)) {
                    return true;
                }
            } else if (text.contains(normalizedKeyword)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value.trim().toLowerCase(), Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }

    private enum QueryTopic {
        FORMATIONS,
        OFFRES,
        EMPLOYES,
        CONGES,
        CANDIDATURES,
        UTILISATEURS,
        DEMANDES_FORMATION,
        NONE
    }

    private enum QueryIntent {
        LIST,
        COUNT,
        OPEN,
        PENDING,
        DESCRIBE,
        ACCESS,
        NONE
    }
}
