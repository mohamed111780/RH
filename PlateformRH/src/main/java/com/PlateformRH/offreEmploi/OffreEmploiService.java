// Interface : OffreEmploiService
package com.PlateformRH.offreEmploi;

import java.util.List;

public interface OffreEmploiService {

    OffreEmploiDTO updateOffre(Long id, OffreEmploiDTO dto);

    OffreEmploiDTO getOffreById(Long id);

    List<OffreEmploiDTO> getAllOffres();

    void createOffre(OffreEmploi offre);

    void deleteOffre(Long id);

    OffreEmploiDTO cloturerOffre(Long id);
}