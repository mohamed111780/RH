package com.PlateformRH.chatbot;

import com.PlateformRH.Employe.EmployeRepository;
import com.PlateformRH.Employe.employe;
import com.PlateformRH.Formation.FormationRepository;
import com.PlateformRH.Formation.formation;
import com.PlateformRH.Utilisateur.Role;
import com.PlateformRH.Utilisateur.UtilisateurRepository;
import com.PlateformRH.Utilisateur.utilisateur;
import com.PlateformRH.candidature.Candidature;
import com.PlateformRH.candidature.CandidatureRepository;
import com.PlateformRH.demandeConge.DemandeConge;
import com.PlateformRH.demandeConge.DemandeCongeRepository;
import com.PlateformRH.demandeFormation.DemandeFormation;
import com.PlateformRH.demandeFormation.DemandeFormationRepository;
import com.PlateformRH.offreEmploi.OffreEmploi;
import com.PlateformRH.offreEmploi.OffreEmploiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatbotDataService {

    private static final int MAX_ROWS_PER_MODULE = 8;

    private final UtilisateurRepository utilisateurRepository;
    private final EmployeRepository employeRepository;
    private final FormationRepository formationRepository;
    private final DemandeCongeRepository demandeCongeRepository;
    private final DemandeFormationRepository demandeFormationRepository;
    private final OffreEmploiRepository offreEmploiRepository;
    private final CandidatureRepository candidatureRepository;

    public String buildContext(ChatbotAccessLevel accessLevel) {
        ChatbotAccessLevel safeAccessLevel = accessLevel == null ? ChatbotAccessLevel.VISITEUR : accessLevel;

        if (safeAccessLevel == ChatbotAccessLevel.FULL) {
            return buildFullContext();
        }

        if (safeAccessLevel == ChatbotAccessLevel.EMPLOYE) {
            return buildEmployeContext();
        }

        return buildVisiteurContext();
    }

    private String buildFullContext() {
        StringBuilder context = new StringBuilder();

        context.append("""
                Application PlateformRH - modules developpes:
                - Utilisateurs: creation, liste, modification, suppression, activation/desactivation, recherche par role, login JWT, logout, changement et reinitialisation du mot de passe par code email.
                - Employes: gestion des fiches employes avec matricule, poste, departement, date d'embauche, type de contrat et solde de conge.
                - Conges: demandes de conge par employe, type de conge, dates de debut/fin et statut de traitement.
                - Formations: catalogue des formations avec titre, description, dates, type et capacite.
                - Demandes de formation: demandes liees a un employe et a une formation avec justification et statut.
                - Offres d'emploi: offres internes/externes avec titre, competences, departement, niveau, contrat, statut et date de publication.
                - Candidatures: candidatures internes/externes liees aux offres, statut, tags de competences et score de matching.

                Regles importantes:
                - Repondre en francais.
                - Utiliser uniquement le contexte fourni.
                - Ne jamais afficher les mots de passe, tokens JWT, codes de verification ou secrets de configuration.
                - Si la question demande une action non disponible dans les modules, dire clairement que ce n'est pas encore implemente.

                Apercu actuel de la base:
                """);

        appendUtilisateurContext(context);
        appendEmployeContext(context);
        appendFormationContext(context);
        appendDemandeCongeContext(context);
        appendDemandeFormationContext(context);
        appendOffreContext(context, false);
        appendCandidatureContext(context);

        return context.toString();
    }

    private String buildEmployeContext() {
        StringBuilder context = new StringBuilder();

        context.append("""
                Application PlateformRH - acces employe:
                - L'employe peut poser des questions uniquement sur les formations disponibles et les offres d'emploi internes ou externes.

                Regles importantes:
                - Repondre en francais.
                - Utiliser uniquement le contexte fourni.
                - Ne pas afficher les donnees des autres employes, les utilisateurs, les conges, les demandes internes RH, les candidatures, les mots de passe, tokens JWT, codes ou secrets.
                - Si la question concerne une information hors formations ou offres d'emploi, dire clairement que l'acces employe ne permet pas de consulter cette information.

                Apercu autorise de la base:
                """);

        appendFormationContext(context);
        appendOffreContext(context, false);

        return context.toString();
    }

    private String buildVisiteurContext() {
        StringBuilder context = new StringBuilder();

        context.append("""
                Application PlateformRH - acces visiteur:
                - Le visiteur du site peut poser des questions uniquement sur les offres d'emploi externes.

                Regles importantes:
                - Repondre en francais.
                - Utiliser uniquement le contexte fourni.
                - Ne pas afficher les offres internes, les formations, les utilisateurs, les employes, les conges, les demandes, les candidatures, les mots de passe, tokens JWT, codes ou secrets.
                - Si la question concerne une information hors offres externes, dire clairement que l'acces visiteur ne permet pas de consulter cette information.

                Apercu autorise de la base:
                """);

        appendOffreContext(context, true);

        return context.toString();
    }

    private void appendUtilisateurContext(StringBuilder context) {
        List<utilisateur> utilisateurs = utilisateurRepository.findAll();
        Map<Role, Long> usersByRole = utilisateurs.stream()
                .filter(user -> user.getRole() != null)
                .collect(Collectors.groupingBy(utilisateur::getRole, Collectors.counting()));

        context.append("\nUtilisateurs: total=").append(utilisateurs.size())
                .append(", actifs=").append(utilisateurs.stream().filter(utilisateur::isEnabled).count())
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
