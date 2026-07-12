package com.PlateformRH.chatbot;

import com.PlateformRH.Employe.EmployeRepository;
import com.PlateformRH.Employe.employe;
import com.PlateformRH.Formation.FormationRepository;
import com.PlateformRH.Formation.formation;
import com.PlateformRH.Employe.Role;
import com.PlateformRH.candidature.Candidature;
import com.PlateformRH.candidature.CandidatureRepository;
import com.PlateformRH.demandeConge.DemandeConge;
import com.PlateformRH.demandeConge.DemandeCongeRepository;
import com.PlateformRH.demandeConge.StatutDemande;
import com.PlateformRH.demandeFormation.DemandeFormation;
import com.PlateformRH.demandeFormation.DemandeFormationRepository;
import com.PlateformRH.offreEmploi.OffreEmploi;
import com.PlateformRH.offreEmploi.OffreEmploiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatbotDataService {

    private static final int MAX_ROWS_PER_MODULE = 8;

    private final EmployeRepository employeRepository;
    private final FormationRepository formationRepository;
    private final DemandeCongeRepository demandeCongeRepository;
    private final DemandeFormationRepository demandeFormationRepository;
    private final OffreEmploiRepository offreEmploiRepository;
    private final CandidatureRepository candidatureRepository;

    public String buildContext(ChatbotAccessLevel accessLevel) {
        return buildContext(accessLevel, "");
    }

    public String buildContext(ChatbotAccessLevel accessLevel, String question) {
        ChatbotAccessLevel safeAccessLevel = accessLevel == null ? ChatbotAccessLevel.VISITEUR : accessLevel;

        if (safeAccessLevel == ChatbotAccessLevel.FULL) {
            return buildFullContext(question);
        }

        if (safeAccessLevel == ChatbotAccessLevel.EMPLOYE) {
            return buildEmployeContext(question);
        }

        return buildVisiteurContext(question);
    }

    public String summarizeUtilisateurs() {
        List<employe> utilisateurs = employeRepository.findAll();
        Map<Role, Long> usersByRole = utilisateurs.stream()
                .filter(user -> user.getRole() != null)
                .collect(Collectors.groupingBy(employe::getRole, Collectors.counting()));

        return "Il y a actuellement %d utilisateurs, dont %d actifs. Repartition par role: %s."
                .formatted(
                        utilisateurs.size(),
                        utilisateurs.stream().filter(employe::isEnabled).count(),
                        usersByRole
                );
    }

    public String summarizeEmployes() {
        List<employe> employes = employeRepository.findAll();
        Map<String, Long> employesByDepartement = employes.stream()
                .map(employe::getDepartement)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(departement -> departement, Collectors.counting()));

        return "Il y a actuellement %d employes enregistres. Repartition par departement: %s."
                .formatted(employes.size(), employesByDepartement);
    }

    public String listEmployes() {
        List<employe> employes = employeRepository.findAll().stream()
                .limit(MAX_ROWS_PER_MODULE)
                .toList();

        if (employes.isEmpty()) {
            return "Aucun employe n'est enregistre pour le moment.";
        }

        StringBuilder answer = new StringBuilder("Voici les employes enregistres:\n");
        employes.forEach(emp -> answer.append("- ")
                .append(emp.getPrenom()).append(" ").append(emp.getNom())
                .append(" (").append(emp.getMatricule()).append("), poste=")
                .append(emp.getPoste()).append(", departement=")
                .append(emp.getDepartement()).append('\n'));
        return answer.toString().trim();
    }

    public String summarizeFormations() {
        List<formation> formations = formationRepository.findAll();
        return formations.isEmpty()
                ? "Aucune formation n'est disponible pour le moment."
                : "Il y a actuellement %d formation(s) dans le catalogue.".formatted(formations.size());
    }

    public String listFormations() {
        List<formation> formations = formationRepository.findAll().stream()
                .sorted(Comparator.comparing(formation::getDateDebut, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(MAX_ROWS_PER_MODULE)
                .toList();

        if (formations.isEmpty()) {
            return "Aucune formation n'est disponible pour le moment.";
        }

        StringBuilder answer = new StringBuilder("Formations disponibles:\n");
        formations.forEach(item -> answer.append("- ")
                .append(item.getTitre())
                .append(" (").append(item.getTypeFormation()).append("), du ")
                .append(item.getDateDebut()).append(" au ")
                .append(item.getDateFin())
                .append(", capacite=").append(item.getCapacite()).append('\n'));
        return answer.toString().trim();
    }

    public String summarizeOffres(ChatbotAccessLevel accessLevel) {
        List<OffreEmploi> offres = filteredOffres(accessLevel);
        if (offres.isEmpty()) {
            return accessLevel == ChatbotAccessLevel.VISITEUR
                    ? "Aucune offre externe n'est disponible pour le moment."
                    : "Aucune offre d'emploi n'est disponible pour le moment.";
        }

        long ouvertes = offres.stream()
                .filter(offre -> offre.getStatut() != null && "OUVERTE".equalsIgnoreCase(offre.getStatut()))
                .count();

        if (accessLevel == ChatbotAccessLevel.VISITEUR) {
            return "Il y a %d offre(s) externe(s), dont %d ouverte(s).".formatted(offres.size(), ouvertes);
        }

        long internes = offres.stream().filter(offre -> "INTERNE".equalsIgnoreCase(String.valueOf(offre.getType()))).count();
        long externes = offres.stream().filter(offre -> "EXTERNE".equalsIgnoreCase(String.valueOf(offre.getType()))).count();
        return "Il y a %d offre(s) au total (%d interne(s), %d externe(s)), dont %d ouverte(s)."
                .formatted(offres.size(), internes, externes, ouvertes);
    }

    public String listOffres(ChatbotAccessLevel accessLevel) {
        List<OffreEmploi> offres = filteredOffres(accessLevel).stream()
                .sorted(Comparator.comparing(OffreEmploi::getDatePublication, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_ROWS_PER_MODULE)
                .toList();

        if (offres.isEmpty()) {
            return accessLevel == ChatbotAccessLevel.VISITEUR
                    ? "Aucune offre externe n'est disponible pour le moment."
                    : "Aucune offre d'emploi n'est disponible pour le moment.";
        }

        StringBuilder answer = new StringBuilder(accessLevel == ChatbotAccessLevel.VISITEUR
                ? "Offres externes disponibles:\n"
                : "Offres d'emploi disponibles:\n");

        offres.forEach(offre -> answer.append("- ")
                .append(offre.getTitre())
                .append(" (").append(offre.getType()).append("), departement=")
                .append(offre.getDepartement())
                .append(", niveau=").append(offre.getNiveau())
                .append(", statut=").append(offre.getStatut())
                .append(", competences=").append(offre.getCompetences()).append('\n'));
        return answer.toString().trim();
    }

    public String summarizeCandidatures() {
        List<Candidature> candidatures = candidatureRepository.findAll();
        if (candidatures.isEmpty()) {
            return "Aucune candidature n'est enregistree pour le moment.";
        }

        Map<Object, Long> byStatut = candidatures.stream()
                .filter(candidature -> candidature.getStatut() != null)
                .collect(Collectors.groupingBy(Candidature::getStatut, Collectors.counting()));

        return "Il y a %d candidature(s). Repartition par statut: %s."
                .formatted(candidatures.size(), byStatut);
    }

    public String listCandidatures() {
        List<Candidature> candidatures = candidatureRepository.findAll().stream()
                .limit(MAX_ROWS_PER_MODULE)
                .toList();

        if (candidatures.isEmpty()) {
            return "Aucune candidature n'est enregistree pour le moment.";
        }

        StringBuilder answer = new StringBuilder("Candidatures recentes:\n");
        candidatures.forEach(candidature -> answer.append("- ")
                .append(candidature.getNomCandidat())
                .append(", offre=")
                .append(candidature.getOffre() != null ? candidature.getOffre().getTitre() : "non renseignee")
                .append(", statut=").append(candidature.getStatut())
                .append(", score matching=")
                .append(candidature.getScoreMatching() != null ? candidature.getScoreMatching() + "%" : "non calcule")
                .append('\n'));
        return answer.toString().trim();
    }

    public String summarizeDemandesConge() {
        List<DemandeConge> demandes = demandeCongeRepository.findAll();
        if (demandes.isEmpty()) {
            return "Aucune demande de conge n'est enregistree pour le moment.";
        }

        Map<Object, Long> byStatut = demandes.stream()
                .filter(demande -> demande.getStatut() != null)
                .collect(Collectors.groupingBy(DemandeConge::getStatut, Collectors.counting()));

        return "Il y a %d demande(s) de conge. Repartition par statut: %s."
                .formatted(demandes.size(), byStatut);
    }

    public String summarizeDemandesFormation() {
        List<DemandeFormation> demandes = demandeFormationRepository.findAll();
        if (demandes.isEmpty()) {
            return "Aucune demande de formation n'est enregistree pour le moment.";
        }

        Map<Object, Long> byStatut = demandes.stream()
                .filter(demande -> demande.getStatut() != null)
                .collect(Collectors.groupingBy(DemandeFormation::getStatut, Collectors.counting()));

        return "Il y a %d demande(s) de formation. Repartition par statut: %s."
                .formatted(demandes.size(), byStatut);
    }

    public String summarizePendingConges() {
        List<DemandeConge> pending = demandeCongeRepository.findByStatut(StatutDemande.EN_ATTENTE);
        if (pending.isEmpty()) {
            return "Aucune demande de conge n'est en attente pour le moment.";
        }
        return "Il y a %d demande(s) de conge en attente de validation.".formatted(pending.size());
    }

    public String listPendingConges() {
        List<DemandeConge> pending = demandeCongeRepository.findByStatut(StatutDemande.EN_ATTENTE).stream()
                .sorted(Comparator.comparing(DemandeConge::getDateDebut, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_ROWS_PER_MODULE)
                .toList();

        if (pending.isEmpty()) {
            return "Aucune demande de conge n'est en attente pour le moment.";
        }

        StringBuilder answer = new StringBuilder("Demandes de conge en attente:\n");
        pending.forEach(demande -> answer.append("- employe=")
                .append(formatEmploye(demande.getEmploye()))
                .append(", type=").append(demande.getType())
                .append(", debut=").append(demande.getDateDebut())
                .append(", fin=").append(demande.getDateFin())
                .append('\n'));
        return answer.toString().trim();
    }

    public String listDemandesConge() {
        List<DemandeConge> demandes = demandeCongeRepository.findAll().stream()
                .sorted(Comparator.comparing(DemandeConge::getDateDebut, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_ROWS_PER_MODULE)
                .toList();

        if (demandes.isEmpty()) {
            return "Aucune demande de conge n'est enregistree pour le moment.";
        }

        StringBuilder answer = new StringBuilder("Demandes de conge recentes:\n");
        demandes.forEach(demande -> answer.append("- employe=")
                .append(formatEmploye(demande.getEmploye()))
                .append(", type=").append(demande.getType())
                .append(", statut=").append(demande.getStatut())
                .append(", debut=").append(demande.getDateDebut())
                .append(", fin=").append(demande.getDateFin())
                .append('\n'));
        return answer.toString().trim();
    }

    public String summarizeOpenOffres(ChatbotAccessLevel accessLevel) {
        List<OffreEmploi> offres = openOffres(accessLevel);
        if (offres.isEmpty()) {
            return accessLevel == ChatbotAccessLevel.VISITEUR
                    ? "Aucune offre externe ouverte n'est disponible pour le moment."
                    : "Aucune offre d'emploi ouverte n'est disponible pour le moment.";
        }
        return "Il y a %d offre(s) ouverte(s) actuellement.".formatted(offres.size());
    }

    public String listOpenOffres(ChatbotAccessLevel accessLevel) {
        List<OffreEmploi> offres = openOffres(accessLevel).stream()
                .sorted(Comparator.comparing(OffreEmploi::getDatePublication, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_ROWS_PER_MODULE)
                .toList();

        if (offres.isEmpty()) {
            return accessLevel == ChatbotAccessLevel.VISITEUR
                    ? "Aucune offre externe ouverte n'est disponible pour le moment."
                    : "Aucune offre d'emploi ouverte n'est disponible pour le moment.";
        }

        StringBuilder answer = new StringBuilder("Offres ouvertes:\n");
        offres.forEach(offre -> answer.append("- ")
                .append(offre.getTitre())
                .append(" (").append(offre.getType()).append("), departement=")
                .append(offre.getDepartement())
                .append(", niveau=").append(offre.getNiveau())
                .append(", competences=").append(offre.getCompetences())
                .append('\n'));
        return answer.toString().trim();
    }

    public String describePlatformModules(ChatbotAccessLevel accessLevel) {
        return switch (accessLevel) {
            case FULL -> """
                    PlateformRH propose les modules suivants:
                    - Utilisateurs et employes: gestion des fiches, roles, activation des comptes.
                    - Conges: demandes, validation, suivi des statuts (en attente, approuvee, refusee, annulee).
                    - Formations: catalogue et demandes de formation des employes.
                    - Offres d'emploi: offres internes et externes, publication et statut.
                    - Candidatures: suivi des candidats, score de matching IA, statuts de recrutement.
                    """;
            case EMPLOYE -> """
                    En tant qu'employe, vous pouvez consulter:
                    - Le catalogue des formations disponibles.
                    - Les offres d'emploi internes et externes.
                    Pour les conges et demandes personnelles, utilisez votre espace collaborateur.
                    """;
            case VISITEUR -> """
                    En tant que visiteur, vous pouvez consulter les offres d'emploi externes publiees sur le site.
                    Connectez-vous pour acceder aux offres internes et aux formations.
                    """;
        };
    }

    private List<OffreEmploi> openOffres(ChatbotAccessLevel accessLevel) {
        return filteredOffres(accessLevel).stream()
                .filter(offre -> offre.getStatut() != null && "OUVERTE".equalsIgnoreCase(offre.getStatut()))
                .toList();
    }

    private enum ContextTopic {
        UTILISATEURS,
        EMPLOYES,
        CONGES,
        FORMATIONS,
        DEMANDES_FORMATION,
        OFFRES,
        CANDIDATURES
    }

    private Set<ContextTopic> detectTopics(String question) {
        String normalized = normalize(question);
        if (normalized.isBlank()) {
            return EnumSet.noneOf(ContextTopic.class);
        }

        Set<ContextTopic> topics = EnumSet.noneOf(ContextTopic.class);
        if (containsAny(normalized, "utilisateur", "utilisateurs", "compte", "comptes", "admin")) {
            topics.add(ContextTopic.UTILISATEURS);
        }
        if (containsAny(normalized, "employe", "employes", "collaborateur", "collaborateurs", "matricule")) {
            topics.add(ContextTopic.EMPLOYES);
        }
        if (containsAny(normalized, "conge", "conges", "absence", "absences")) {
            topics.add(ContextTopic.CONGES);
        }
        if (containsAny(normalized, "formation", "formations", "catalogue")) {
            topics.add(ContextTopic.FORMATIONS);
        }
        if (containsAny(normalized, "demande formation", "demandes formation", "demandes de formation")) {
            topics.add(ContextTopic.DEMANDES_FORMATION);
        }
        if (containsAny(normalized, "offre", "offres", "emploi", "emplois", "poste", "postes", "recrutement")) {
            topics.add(ContextTopic.OFFRES);
        }
        if (containsAny(normalized, "candidature", "candidatures", "candidat", "candidats", "matching", "kanban")) {
            topics.add(ContextTopic.CANDIDATURES);
        }
        return topics;
    }

    private String buildFullContext(String question) {
        Set<ContextTopic> topics = detectTopics(question);
        StringBuilder context = new StringBuilder();

        context.append("""
                Application PlateformRH - assistant RH.
                Regles: repondre en francais, utiliser uniquement les donnees ci-dessous, ne jamais inventer.
                Les totaux indiques sont exacts. Ne jamais afficher mots de passe, tokens ou secrets.

                """);

        if (topics.isEmpty()) {
            appendOverviewContext(context);
            return context.toString();
        }

        if (topics.contains(ContextTopic.UTILISATEURS)) {
            appendUtilisateurContext(context);
        }
        if (topics.contains(ContextTopic.EMPLOYES)) {
            appendEmployeContext(context);
        }
        if (topics.contains(ContextTopic.FORMATIONS)) {
            appendFormationContext(context);
        }
        if (topics.contains(ContextTopic.CONGES)) {
            appendDemandeCongeContext(context);
        }
        if (topics.contains(ContextTopic.DEMANDES_FORMATION)) {
            appendDemandeFormationContext(context);
        }
        if (topics.contains(ContextTopic.OFFRES)) {
            appendOffreContext(context, false);
        }
        if (topics.contains(ContextTopic.CANDIDATURES)) {
            appendCandidatureContext(context);
        }

        return context.toString();
    }

    private void appendOverviewContext(StringBuilder context) {
        context.append("Apercu global (totaux uniquement):\n");
        appendUtilisateurContext(context);
        appendEmployeContextSummary(context);
        context.append("Formations: total=").append(formationRepository.findAll().size()).append('\n');
        context.append("Demandes de conge: total=").append(demandeCongeRepository.findAll().size())
                .append(", en attente=").append(demandeCongeRepository.findByStatut(StatutDemande.EN_ATTENTE).size())
                .append('\n');
        context.append("Demandes de formation: total=").append(demandeFormationRepository.findAll().size()).append('\n');
        context.append("Offres d'emploi: total=").append(offreEmploiRepository.findAll().size())
                .append(", ouvertes=").append(openOffres(ChatbotAccessLevel.FULL).size()).append('\n');
        context.append("Candidatures: total=").append(candidatureRepository.findAll().size()).append('\n');
    }

    private void appendEmployeContextSummary(StringBuilder context) {
        List<employe> employes = employeRepository.findAll();
        Map<String, Long> employesByDepartement = employes.stream()
                .map(employe::getDepartement)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(departement -> departement, Collectors.counting()));
        context.append("Employes: total=").append(employes.size())
                .append(", par departement=").append(employesByDepartement).append('\n');
    }

    private String buildEmployeContext(String question) {
        Set<ContextTopic> topics = detectTopics(question);
        StringBuilder context = new StringBuilder();

        context.append("""
                Application PlateformRH - acces employe.
                Regles: repondre en francais, utiliser uniquement les donnees ci-dessous.
                Acces limite aux formations et offres d'emploi.

                """);

        boolean includeFormations = topics.isEmpty() || topics.contains(ContextTopic.FORMATIONS);
        boolean includeOffres = topics.isEmpty() || topics.contains(ContextTopic.OFFRES);

        if (includeFormations) {
            appendFormationContext(context);
        }
        if (includeOffres) {
            appendOffreContext(context, false);
        }

        return context.toString();
    }

    private String buildVisiteurContext(String question) {
        StringBuilder context = new StringBuilder();

        context.append("""
                Application PlateformRH - acces visiteur.
                Regles: repondre en francais, utiliser uniquement les donnees ci-dessous.
                Acces limite aux offres d'emploi externes.

                """);

        appendOffreContext(context, true);
        return context.toString();
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(normalize(keyword))) {
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

    private List<OffreEmploi> filteredOffres(ChatbotAccessLevel accessLevel) {
        return offreEmploiRepository.findAll().stream()
                .filter(offre -> accessLevel != ChatbotAccessLevel.VISITEUR || isExternalOffer(offre))
                .toList();
    }

    private void appendUtilisateurContext(StringBuilder context) {
        List<employe> utilisateurs = employeRepository.findAll();
        Map<Role, Long> usersByRole = utilisateurs.stream()
                .filter(user -> user.getRole() != null)
                .collect(Collectors.groupingBy(employe::getRole, Collectors.counting()));

        context.append("\nUtilisateurs: total=").append(utilisateurs.size())
                .append(", actifs=").append(utilisateurs.stream().filter(employe::isEnabled).count())
                .append(", par role=").append(usersByRole).append('\n');
    }

    private void appendEmployeContext(StringBuilder context) {
        List<employe> employes = employeRepository.findAll();
        Map<String, Long> employesByDepartement = employes.stream()
                .map(employe::getDepartement)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(departement -> departement, Collectors.counting()));

        context.append("Employes: total=").append(employes.size())
                .append(", par departement=").append(employesByDepartement).append('\n');

        appendLimitedRows(context, "Exemples employes", employes.stream()
                .limit(MAX_ROWS_PER_MODULE)
                .map(emp -> "- " + emp.getPrenom() + " " + emp.getNom()
                        + ", matricule=" + emp.getMatricule()
                        + ", poste=" + emp.getPoste()
                        + ", departement=" + emp.getDepartement()
                        + ", contrat=" + emp.getTypeContrat()
                        + ", soldeConge=" + emp.getSoldeConge())
                .toList());
    }

    private void appendFormationContext(StringBuilder context) {
        List<formation> formations = formationRepository.findAll();
        context.append("Formations: total=").append(formations.size()).append('\n');

        appendLimitedRows(context, "Formations disponibles", formations.stream()
                .sorted(Comparator.comparing(formation::getDateDebut, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(MAX_ROWS_PER_MODULE)
                .map(item -> "- " + item.getTitre()
                        + ", type=" + item.getTypeFormation()
                        + ", capacite=" + item.getCapacite()
                        + ", debut=" + item.getDateDebut()
                        + ", fin=" + item.getDateFin()
                        + ", description=" + item.getDescription())
                .toList());
    }

    private void appendDemandeCongeContext(StringBuilder context) {
        List<DemandeConge> demandes = demandeCongeRepository.findAll();
        Map<Object, Long> byStatut = demandes.stream()
                .filter(demande -> demande.getStatut() != null)
                .collect(Collectors.groupingBy(DemandeConge::getStatut, Collectors.counting()));

        context.append("Demandes de conge: total=").append(demandes.size())
                .append(", par statut=").append(byStatut).append('\n');

        appendLimitedRows(context, "Demandes de conge recentes", demandes.stream()
                .sorted(Comparator.comparing(DemandeConge::getDateDebut, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_ROWS_PER_MODULE)
                .map(demande -> "- employe=" + formatEmploye(demande.getEmploye())
                        + ", type=" + demande.getType()
                        + ", statut=" + demande.getStatut()
                        + ", debut=" + demande.getDateDebut()
                        + ", fin=" + demande.getDateFin())
                .toList());
    }

    private void appendDemandeFormationContext(StringBuilder context) {
        List<DemandeFormation> demandes = demandeFormationRepository.findAll();
        Map<Object, Long> byStatut = demandes.stream()
                .filter(demande -> demande.getStatut() != null)
                .collect(Collectors.groupingBy(DemandeFormation::getStatut, Collectors.counting()));

        context.append("Demandes de formation: total=").append(demandes.size())
                .append(", par statut=").append(byStatut).append('\n');

        appendLimitedRows(context, "Demandes de formation", demandes.stream()
                .limit(MAX_ROWS_PER_MODULE)
                .map(demande -> "- employe=" + formatEmploye(demande.getEmploye())
                        + ", formation=" + formatFormation(demande.getFormation())
                        + ", statut=" + demande.getStatut()
                        + ", justification=" + demande.getJustification())
                .toList());
    }

    private void appendOffreContext(StringBuilder context, boolean externalOnly) {
        List<OffreEmploi> offres = offreEmploiRepository.findAll().stream()
                .filter(offre -> !externalOnly || isExternalOffer(offre))
                .toList();
        Map<String, Long> byStatut = offres.stream()
                .map(OffreEmploi::getStatut)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(statut -> statut, Collectors.counting()));

        context.append(externalOnly ? "Offres d'emploi externes: total=" : "Offres d'emploi: total=")
                .append(offres.size())
                .append(", par statut=").append(byStatut).append('\n');

        appendLimitedRows(context, "Offres d'emploi", offres.stream()
                .sorted(Comparator.comparing(OffreEmploi::getDatePublication, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_ROWS_PER_MODULE)
                .map(offre -> "- " + offre.getTitre()
                        + ", type=" + offre.getType()
                        + ", departement=" + offre.getDepartement()
                        + ", niveau=" + offre.getNiveau()
                        + ", contrat=" + offre.getContrat()
                        + ", statut=" + offre.getStatut()
                        + ", competences=" + offre.getCompetences())
                .toList());
    }

    private boolean isExternalOffer(OffreEmploi offre) {
        return offre.getType() != null && "EXTERNE".equalsIgnoreCase(offre.getType().trim());
    }

    private void appendCandidatureContext(StringBuilder context) {
        List<Candidature> candidatures = candidatureRepository.findAll();
        Map<Object, Long> byStatut = candidatures.stream()
                .filter(candidature -> candidature.getStatut() != null)
                .collect(Collectors.groupingBy(Candidature::getStatut, Collectors.counting()));

        context.append("Candidatures: total=").append(candidatures.size())
                .append(", par statut=").append(byStatut).append('\n');

        appendLimitedRows(context, "Candidatures", candidatures.stream()
                .limit(MAX_ROWS_PER_MODULE)
                .map(candidature -> "- candidat=" + candidature.getNomCandidat()
                        + ", poste=" + candidature.getPoste()
                        + ", departement=" + candidature.getDepartement()
                        + ", offre=" + (candidature.getOffre() != null ? candidature.getOffre().getTitre() : "non renseignee")
                        + ", statut=" + candidature.getStatut()
                        + ", score=" + candidature.getScoreMatching())
                .toList());
    }

    private void appendLimitedRows(StringBuilder context, String title, List<String> rows) {
        if (rows.isEmpty()) {
            return;
        }

        context.append(title).append(":\n");
        rows.forEach(row -> context.append(row).append('\n'));
    }

    private String formatEmploye(employe emp) {
        if (emp == null) {
            return "non renseigne";
        }
        return emp.getPrenom() + " " + emp.getNom() + " (" + emp.getMatricule() + ")";
    }

    private String formatFormation(formation item) {
        if (item == null) {
            return "non renseignee";
        }
        return item.getTitre();
    }
}
