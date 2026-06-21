// Classe : CandidatureServiceImpl
package com.PlateformRH.candidature;

import com.PlateformRH.offreEmploi.OffreEmploi;
import com.PlateformRH.offreEmploi.OffreEmploiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class CandidatureServiceImpl implements CandidatureService {

    private final CandidatureRepository repo;
    private final OffreEmploiRepository offreRepo;

    @Override
    public void postuler(Long offreId, Candidature c) {

        OffreEmploi offre = offreRepo.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));

        if (c.getEmployeId() != null && repo.existsByOffreIdAndEmployeId(offreId, c.getEmployeId())) {
            throw new RuntimeException("Vous avez deja postule a cette offre");
        }
        if (c.getEmployeId() == null && c.getEmail() != null && repo.existsByOffreIdAndEmailIgnoreCase(offreId, c.getEmail())) {
            throw new RuntimeException("Vous avez deja postule a cette offre avec cet email");
        }

        List<String> candidateTags = normalizeTags(c.getCompetenceTags());
        c.setCompetenceTags(candidateTags);
        c.setScoreMatching(computeScore(candidateTags, splitSkills(offre.getCompetences())));

        c.setOffre(offre);
        c.setStatut(StatutCandidature.EN_ATTENTE);

        repo.save(c);
    }

    @Override
    public List<CandidatureDTO> getAll() {
        return repo.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<CandidatureDTO> getByOffre(Long offreId) {
        return repo.findByOffreId(offreId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public CandidatureDTO changeStatut(Long id, String statut) {

        Candidature c = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));

        c.setStatut(StatutCandidature.valueOf(statut.toUpperCase()));

        return mapToDto(repo.save(c));
    }

    private CandidatureDTO mapToDto(Candidature c) {

        CandidatureDTO dto = new CandidatureDTO();

        dto.setId(c.getId());
        dto.setNomCandidat(c.getNomCandidat());
        dto.setEmail(c.getEmail());
        dto.setEmployeId(c.getEmployeId());
        dto.setMatriculeEmploye(c.getMatriculeEmploye());
        dto.setTelephone(c.getTelephone());
        dto.setPoste(c.getPoste());
        dto.setDepartement(c.getDepartement());
        dto.setCv(c.getCv());
        dto.setLettreMotivation(c.getLettreMotivation());
        dto.setCompetenceTags(normalizeTags(c.getCompetenceTags()));
        dto.setScoreMatching(c.getScoreMatching());

        if (c.getStatut() != null) {
            dto.setStatut(c.getStatut().name());
        }

        if (c.getOffre() != null) {
            dto.setOffreId(c.getOffre().getId());
            dto.setTitreOffre(c.getOffre().getTitre());
        }

        return dto;
    }

    private List<String> splitSkills(String competences) {
        if (competences == null || competences.isBlank()) {
            return new ArrayList<>();
        }

        return Arrays.stream(competences.split(","))
                .map(String::trim)
                .filter(skill -> !skill.isBlank())
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private List<String> normalizeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return new ArrayList<>();
        }

        return tags.stream()
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private int computeScore(List<String> candidateTags, List<String> offerTags) {
        if (offerTags == null || offerTags.isEmpty() || candidateTags == null || candidateTags.isEmpty()) {
            return 0;
        }

        Set<String> normalizedCandidateTags = candidateTags.stream()
                .map(this::normalizeForMatching)
                .collect(Collectors.toSet());

        long matches = offerTags.stream()
                .map(this::normalizeForMatching)
                .filter(normalizedCandidateTags::contains)
                .count();

        return (int) Math.round((matches * 100.0) / offerTags.size());
    }

    private String normalizeForMatching(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value.trim().toLowerCase(), Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }
}
