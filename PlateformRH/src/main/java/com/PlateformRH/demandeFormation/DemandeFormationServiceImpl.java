package com.PlateformRH.demandeFormation;

import com.PlateformRH.Employe.EmployeRepository;
import com.PlateformRH.Employe.employe;
import com.PlateformRH.Formation.FormationRepository;
import com.PlateformRH.Formation.formation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class DemandeFormationServiceImpl implements DemandeFormationService {

    private final DemandeFormationRepository demandeFormationRepository;
    private final EmployeRepository employeRepository;
    private final FormationRepository formationRepository;

    // ================= CREATE =================
    @Override
    public void createDemandeFormation(DemandeFormation demandeFormation, Long employeId, Long formationId) {

        employe emp = employeRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        formation form = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation non trouvée"));

        boolean demandeActiveExiste = demandeFormationRepository
                .findByEmployeIdAndFormationId(employeId, formationId)
                .stream()
                .anyMatch(d -> d.getStatut() == StatutDemandeFormation.EN_ATTENTE
                        || d.getStatut() == StatutDemandeFormation.APPROUVEE);

        if (demandeActiveExiste) {
            throw new RuntimeException("Une demande existe deja pour cette formation");
        }

        demandeFormation.setEmploye(emp);
        demandeFormation.setFormation(form);

        demandeFormation.setStatut(StatutDemandeFormation.EN_ATTENTE);

        demandeFormationRepository.save(demandeFormation);
    }

    // ================= GET ALL =================
    @Override
    public List<DemandeFormationDTO> getAllDemandes() {
        List<DemandeFormation> demandes = demandeFormationRepository.findAll();

        return demandes.stream().map(this::mapToDto).toList();
    }

    // ================= GET BY ID =================
    @Override
    public DemandeFormationDTO getDemandeById(Long id) {

        DemandeFormation demande = demandeFormationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande de formation non trouvée"));

        return mapToDto(demande);
    }

    // ================= DELETE =================
    @Override
    public void deleteDemande(Long id) {

        if (!demandeFormationRepository.existsById(id)) {
            throw new RuntimeException("Demande de formation non trouvée");
        }

        demandeFormationRepository.deleteById(id);
    }

    // ================= UPDATE =================
    @Override
    public DemandeFormationDTO updateDemande(Long id, DemandeFormationDTO dto) {

        DemandeFormation demande = demandeFormationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande de formation non trouvée"));

        // Only allow updates if status is EN_ATTENTE
        if (demande.getStatut() != StatutDemandeFormation.EN_ATTENTE) {
            throw new RuntimeException("Seules les demandes en attente peuvent être modifiées");
        }

        demande.setJustification(dto.getJustification());

        if (dto.getStatutDemande() != null) {
            demande.setStatut(StatutDemandeFormation.valueOf(dto.getStatutDemande()));
        }

        DemandeFormation updated = demandeFormationRepository.save(demande);

        return mapToDto(updated);
    }

    // ================= GET BY STATUT =================
    @Override
    public List<DemandeFormationDTO> getDemandesByStatut(String statut) {

        try {
            StatutDemandeFormation statutEnum =
                    StatutDemandeFormation.valueOf(statut.toUpperCase());

            List<DemandeFormation> demandes =
                    demandeFormationRepository.findByStatut(statutEnum);

            return demandes.stream()
                    .map(this::mapToDto)
                    .toList();

        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide");
        }
    }

    // ================= CHANGE STATUT =================
    @Override
    public DemandeFormationDTO changeStatut(Long id, String statut) {

        DemandeFormation demande = demandeFormationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        StatutDemandeFormation newStatut =
                StatutDemandeFormation.valueOf(statut.toUpperCase());

        //  Si APPROUVEE → diminuer capacité
        if (newStatut == StatutDemandeFormation.APPROUVEE) {

            formation form = demande.getFormation();

            if (form.getCapacite() <= 0) {
                throw new RuntimeException("Plus de places disponibles !");
            }

            form.setCapacite(form.getCapacite() - 1);

            formationRepository.save(form);
        }

        demande.setStatut(newStatut);

        return mapToDto(demandeFormationRepository.save(demande));
    }

    // ================= MAPPER =================
    private DemandeFormationDTO mapToDto(DemandeFormation d) {

        DemandeFormationDTO dto = new DemandeFormationDTO();

        dto.setId(d.getId());
        dto.setJustification(d.getJustification());

        if (d.getStatut() != null) {
            dto.setStatutDemande(d.getStatut().name());
        }

        if (d.getEmploye() != null) {
            dto.setMatriculeEmploye(d.getEmploye().getMatricule());
            dto.setNomEmploye(d.getEmploye().getNom());
            dto.setPrenomEmploye(d.getEmploye().getPrenom());
        }

        if (d.getFormation() != null) {
            dto.setFormationId(d.getFormation().getId());
            dto.setTitreFormation(d.getFormation().getTitre());
        }

        return dto;
    }
    @Override
    public List<DemandeFormationDTO> getDemandesByEmployeId(Long employeId) {

        List<DemandeFormation> demandes =
                demandeFormationRepository.findByEmployeId(employeId);

        return demandes.stream().map(d -> {

            DemandeFormationDTO dto = new DemandeFormationDTO();

            dto.setId(d.getId());
            dto.setJustification(d.getJustification());
            dto.setStatutDemande(d.getStatut().name());

            dto.setMatriculeEmploye(d.getEmploye().getMatricule());
            dto.setNomEmploye(d.getEmploye().getNom());
            dto.setPrenomEmploye(d.getEmploye().getPrenom());

            dto.setFormationId(d.getFormation().getId());
            dto.setTitreFormation(d.getFormation().getTitre());

            return dto;
        }).toList();
    }
}
