package com.PlateformRH.demandeFormation;

import java.util.List;

public interface DemandeFormationService {

    void createDemandeFormation(DemandeFormation demandeFormation, Long employeId, Long formationId);

    List<DemandeFormationDTO> getAllDemandes();

    DemandeFormationDTO getDemandeById(Long id);

    void deleteDemande(Long id);

    DemandeFormationDTO updateDemande(Long id, DemandeFormationDTO dto);

    List<DemandeFormationDTO> getDemandesByStatut(String statut);

    List<DemandeFormationDTO> getDemandesByEmployeId(Long employeId);

    DemandeFormationDTO changeStatut(Long id, String statut);
}
