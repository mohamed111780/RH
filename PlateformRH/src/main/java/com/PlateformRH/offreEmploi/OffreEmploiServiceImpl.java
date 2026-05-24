// Classe : OffreEmploiServiceImpl
package com.PlateformRH.offreEmploi;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class OffreEmploiServiceImpl implements OffreEmploiService {

    private final OffreEmploiRepository offreRepository;

    @Override
    public void createOffre(OffreEmploi offre) {

        if (offre.getStatut() == null) {
            offre.setStatut("OUVERTE");
        }

        offreRepository.save(offre);
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
        o.setStatut(dto.getStatut());

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
        dto.setStatut(o.getStatut());

        return dto;
    }
}