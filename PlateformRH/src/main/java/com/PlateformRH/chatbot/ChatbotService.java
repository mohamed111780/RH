package com.PlateformRH.chatbot;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private static final String UNKNOWN_ANSWER =
            "Je ne dispose pas de cette information dans les donnees actuellement disponibles.";

    private final ChatbotDataService chatbotDataService;
    private final ChatbotQuestionHandler chatbotQuestionHandler;
    private final OllamaClient ollamaClient;

    public String ask(String question, ChatbotAccessLevel accessLevel) {
        String cleanQuestion = question == null ? "" : question.trim();
        if (cleanQuestion.isBlank()) {
            return "Veuillez poser une question.";
        }

        ChatbotAccessLevel safeAccessLevel = accessLevel == null ? ChatbotAccessLevel.VISITEUR : accessLevel;

        Optional<String> directAnswer = chatbotQuestionHandler.tryDirectAnswer(cleanQuestion, safeAccessLevel);
        if (directAnswer.isPresent()) {
            return directAnswer.get();
        }

        Optional<String> accessAnswer = chatbotQuestionHandler.tryAccessAnswer(cleanQuestion, safeAccessLevel);
        if (accessAnswer.isPresent()) {
            return accessAnswer.get();
        }

        String context = chatbotDataService.buildContext(safeAccessLevel, cleanQuestion);
        String prompt = buildPrompt(context, cleanQuestion, safeAccessLevel);

        try {
            String llmAnswer = ollamaClient.generate(prompt);
            String sanitized = sanitizeAnswer(llmAnswer);

            if (isUnknownAnswer(sanitized)) {
                Optional<String> relaxedAnswer = chatbotQuestionHandler.tryRelaxedDirectAnswer(cleanQuestion, safeAccessLevel);
                if (relaxedAnswer.isPresent()) {
                    return relaxedAnswer.get();
                }
            }

            return sanitized;
        } catch (Exception ex) {
            Optional<String> relaxedAnswer = chatbotQuestionHandler.tryRelaxedDirectAnswer(cleanQuestion, safeAccessLevel);
            if (relaxedAnswer.isPresent()) {
                return relaxedAnswer.get();
            }
            return fallbackAnswer(safeAccessLevel);
        }
    }

    private String buildPrompt(String context, String question, ChatbotAccessLevel accessLevel) {
        return """
                Tu es l'assistant RH de l'application PlateformRH.
                Niveau d'acces actuel: %s

                REGLES STRICTES:
                1. Reponds uniquement en francais.
                2. Utilise exclusivement les informations du bloc "Donnees disponibles".
                3. Si l'information demandee n'est pas presente dans les donnees, reponds exactement: "%s"
                4. Ne jamais inventer de chiffres, noms, dates, fonctionnalites, statuts ou modules.
                5. Ne jamais mentionner mots de passe, tokens JWT, codes de verification ou secrets.
                6. Reponds de facon complete mais concise. Pour les listes, inclus tous les elements fournis dans les donnees.
                7. Cite les chiffres exacts tels qu'ils apparaissent dans les donnees.
                8. Si la question depasse le niveau d'acces, indique clairement la limite du profil.
                9. Si les donnees contiennent une liste ou un total correspondant a la question, reponds avec ces elements.

                Donnees disponibles:
                %s

                Question utilisateur:
                %s

                Reponse fondee uniquement sur les donnees:
                """.formatted(accessLevel.name(), UNKNOWN_ANSWER, context, question);
    }

    private String sanitizeAnswer(String answer) {
        if (answer == null || answer.isBlank()) {
            return UNKNOWN_ANSWER;
        }

        String cleaned = answer.trim();
        String lower = cleaned.toLowerCase();

        if (lower.contains("password") || lower.contains("mot de passe") || lower.contains("jwt") || lower.contains("token")) {
            return "Je ne peux pas repondre aux questions liees aux secrets ou a la securite.";
        }

        return cleaned;
    }

    private boolean isUnknownAnswer(String answer) {
        if (answer == null || answer.isBlank()) {
            return true;
        }
        String normalized = answer.toLowerCase();
        return normalized.contains("je ne dispose pas")
                || normalized.contains("pas presente dans les donnees")
                || normalized.contains("pas disponible");
    }

    private String fallbackAnswer(ChatbotAccessLevel accessLevel) {
        return switch (accessLevel) {
            case FULL -> "Je n'ai pas pu generer une reponse detaillee. Reformulez votre question ou verifiez qu'Ollama est demarre (ollama pull llama3.2:3b).";
            case EMPLOYE -> "Je peux repondre sur les formations et les offres d'emploi. Essayez par exemple : \"Donnez les formations disponibles\" ou \"Combien d'offres ouvertes ?\".";
            case VISITEUR -> "Je peux repondre sur les offres d'emploi externes. Essayez par exemple : \"Donnez les offres disponibles\".";
        };
    }
}
