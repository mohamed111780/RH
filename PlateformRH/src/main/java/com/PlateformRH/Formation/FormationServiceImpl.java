package com.PlateformRH.Formation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class FormationServiceImpl implements FormationService {

    private final FormationRepository formationRepository;

    @Override
    public void createFormation(formation formation) {
        formationRepository.save(formation);
    }

    @Override
    public void deleteFormation(Long id) {

        if (!formationRepository.existsById(id)) {
            throw new RuntimeException("Formation non trouvée");
        }

        formationRepository.deleteById(id);
    }

    @Override
    public List<formationDto> getAllFormations() {

        return formationRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public formationDto getFormationById(Long id) {

        formation f = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));

        return mapToDto(f);
    }

    @Override
    public formationDto updateFormation(Long id, formationDto dto) {

        formation f = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));

        // Mise à jour des champs
        f.setTitre(dto.getTitre());
        f.setDescription(dto.getDescription());
        f.setDateDebut(dto.getDateDebut());
        f.setDateFin(dto.getDateFin());

        if (dto.getTypeFormation() != null) {
            f.setTypeFormation(TypeFormation.valueOf(dto.getTypeFormation()));
        }

        f.setCapacite(dto.getCapacite());

        formation updated = formationRepository.save(f);

        return mapToDto(updated);
    }

    private formationDto mapToDto(formation f) {

        formationDto dto = new formationDto();

        dto.setId(f.getId());
        dto.setTitre(f.getTitre());
        dto.setDescription(f.getDescription());
        dto.setDateDebut(f.getDateDebut());
        dto.setDateFin(f.getDateFin());

        if (f.getTypeFormation() != null) {
            dto.setTypeFormation(f.getTypeFormation().name());
        }

        dto.setCapacite(f.getCapacite());

        return dto;
    }
}