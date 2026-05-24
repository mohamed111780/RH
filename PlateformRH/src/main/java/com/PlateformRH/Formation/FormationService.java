package com.PlateformRH.Formation;

import java.util.List;

public interface FormationService {

    formationDto updateFormation(Long id, formationDto dto);
    formationDto getFormationById(Long id);
    List<formationDto> getAllFormations();

    void createFormation(formation formation);

    void deleteFormation(Long id);
}