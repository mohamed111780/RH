package com.PlateformRH.demandeConge;

import java.util.List;

public interface DemandeCongeService {

    void DemandeConge (DemandeConge demandeConge, Long employeId);


    List<DemandeCongeDTO> getAllDemandes();

    DemandeCongeDTO getDemandeById(Long id);
    void deleteDemande(Long id);
    DemandeCongeDTO updateDemande(Long id, DemandeCongeDTO dto);

    List<DemandeCongeDTO> getDemandesByType(String type);
    List<DemandeCongeDTO> getDemandesByStatut(String statut);
    DemandeCongeDTO changeStatut(Long id, String statut) ;
    List<DemandeCongeDTO> getDemandesByEmployeeId(Long employeId);
}



