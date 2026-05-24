// Classe : CandidatureServiceImpl
package com.PlateformRH.candidature;

import com.PlateformRH.offreEmploi.OffreEmploi;
import com.PlateformRH.offreEmploi.OffreEmploiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class CandidatureServiceImpl implements CandidatureService {

    private final CandidatureRepository repo;
    private final OffreEmploiRepository offreRepo;

    @Override
    public void postuler(Long offreId, Candidature c) {

        OffreEmploi offre = offreRepo.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));

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
        dto.setCv(c.getCv());
        dto.setLettreMotivation(c.getLettreMotivation());

        if (c.getStatut() != null) {
            dto.setStatut(c.getStatut().name());
        }

        if (c.getOffre() != null) {
            dto.setOffreId(c.getOffre().getId());
            dto.setTitreOffre(c.getOffre().getTitre());
        }

        return dto;
    }
}