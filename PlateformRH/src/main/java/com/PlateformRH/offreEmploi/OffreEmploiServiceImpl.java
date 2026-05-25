// Classe : OffreEmploiServiceImpl
package com.PlateformRH.offreEmploi;

import com.PlateformRH.candidature.CandidatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class OffreEmploiServiceImpl implements OffreEmploiService {

    private final OffreEmploiRepository offreRepository;
    private final CandidatureRepository candidatureRepository;

    @Override
    public OffreEmploiDTO createOffre(OffreEmploiDTO dto) {
        OffreEmploi offre = new OffreEmploi();
        applyDtoToEntity(dto, offre);

        if (offre.getStatut() == null || offre.getStatut().isBlank()) {
            offre.setStatut("OUVERTE");
        }
        if (offre.getDatePublication() == null) {
            offre.setDatePublication(LocalDateTime.now());
        }

        return mapToDto(offreRepository.save(offre));
    }

    @Override
    public void deleteOffre(Long id) {

        if (!offreRepository.existsById(id)) {
            throw new RuntimeException("Offre non trouvée");
        }

        offreRepository.deleteById(id);
    }

    @Override
    public List<OffreEmploiDTO> getAllOffres() {

        return offreRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public OffreEmploiDTO getOffreById(Long id) {

        OffreEmploi offre = offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));

        return mapToDto(offre);
    }

    @Override
    public OffreEmploiDTO updateOffre(Long id, OffreEmploiDTO dto) {

        OffreEmploi o = offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));

        o.setTitre(dto.getTitre());
        o.setDescription(dto.getDescription());
        o.setType(dto.getType());
        o.setDepartement(dto.getDepartement());
        o.setNiveau(dto.getNiveau());
        o.setContrat(dto.getContrat());
        o.setCompetences(joinSkills(dto.getSkills()));
        o.setStatut(dto.getStatut());
        if (dto.getDatePublication() != null) {
            o.setDatePublication(dto.getDatePublication());
        }

        return mapToDto(offreRepository.save(o));
    }

    // 🔥 clôturer offre (US-30)
    @Override
    public OffreEmploiDTO cloturerOffre(Long id) {

        OffreEmploi offre = offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));

        offre.setStatut("FERMEE");

        return mapToDto(offreRepository.save(offre));
    }

    private OffreEmploiDTO mapToDto(OffreEmploi o) {

        OffreEmploiDTO dto = new OffreEmploiDTO();

        dto.setId(o.getId());
        dto.setTitre(o.getTitre());
        dto.setDescription(o.getDescription());
        dto.setType(o.getType());
        dto.setCandidatures(Math.toIntExact(candidatureRepository.countByOffreId(o.getId())));
        dto.setDepartement(o.getDepartement());
        dto.setNiveau(o.getNiveau());
        dto.setContrat(o.getContrat());
        dto.setSkills(splitSkills(o.getCompetences()));
        dto.setStatut(o.getStatut());
        dto.setDatePublication(o.getDatePublication());

        return dto;
    }

    private void applyDtoToEntity(OffreEmploiDTO dto, OffreEmploi offre) {
        offre.setTitre(dto.getTitre());
        offre.setDescription(dto.getDescription());
        offre.setType(dto.getType());
        offre.setDepartement(dto.getDepartement());
        offre.setNiveau(dto.getNiveau());
        offre.setContrat(dto.getContrat());
        offre.setCompetences(joinSkills(dto.getSkills()));
        offre.setStatut(dto.getStatut());
        offre.setDatePublication(dto.getDatePublication());
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

    private String joinSkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return "";
        }

        return skills.stream()
                .map(String::trim)
                .filter(skill -> !skill.isBlank())
                .collect(Collectors.joining(","));
    }
}
