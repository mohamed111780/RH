// Interface : CandidatureService
package com.PlateformRH.candidature;

import java.util.List;

public interface CandidatureService {

    void postuler(Long offreId, Candidature c);

    List<CandidatureDTO> getAll();

    List<CandidatureDTO> getByOffre(Long offreId);

    CandidatureDTO changeStatut(Long id, String statut);
}