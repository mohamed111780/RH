package com.PlateformRH.demandeConge;

import com.PlateformRH.Employe.EmployeRepository;
import com.PlateformRH.Employe.employe;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandeCongeServiceImpl implements DemandeCongeService {

    private final DemandeCongeRepository demandeCongeRepository;

    private final EmployeRepository employeRepository;
    @Override
    public void DemandeConge(DemandeConge demandeConge, Long employeId) {
        if (demandeConge.getDateDebut() == null || demandeConge.getDateFin() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les dates de debut et de fin sont obligatoires");
        }
        if (demandeConge.getType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le type de conge est obligatoire");
        }
        if (demandeConge.getDateFin().isBefore(demandeConge.getDateDebut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin doit etre apres la date de debut");
        }

        //  Vérifier employé
        employe emp = employeRepository.findById(employeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employe non trouve"));

        //  Calculer nombre de jours demandés
        long nbJours = ChronoUnit.DAYS.between(
                demandeConge.getDateDebut(),
                demandeConge.getDateFin()
        ) + 1;

        // Vérifier solde
        if (nbJours > emp.getSoldeConge()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solde de conge insuffisant");
        }

        // ⃣ Initialiser statut
        demandeConge.setStatut(StatutDemande.EN_ATTENTE);

        //  Lier employé
        demandeConge.setEmploye(emp);

        //  Sauvegarder
        demandeCongeRepository.save(demandeConge);
    }
    @Override
    public List<DemandeCongeDTO> getAllDemandes() {
        List<DemandeConge> demandes = demandeCongeRepository.findAll();

        return demandes.stream().map(this::mapToDto).toList();
    }

    // Mapper DemandeConge vers DemandeCongeDTO
    private DemandeCongeDTO mapToDto(DemandeConge demande) {
        DemandeCongeDTO dto = new DemandeCongeDTO();
        dto.setId(demande.getId());
        dto.setDebut(demande.getDateDebut());
        dto.setFin(demande.getDateFin());
        if (demande.getType() != null) {
            dto.setTypeConge(demande.getType().name());
        }
        if (demande.getStatut() != null) {
            dto.setStatutDemande(demande.getStatut().name());
        }
        if (demande.getEmploye() != null) {
            dto.setMatriculeEmploye(demande.getEmploye().getMatricule());
            dto.setNomEmploye(demande.getEmploye().getNom());
            dto.setPrenomEmploye(demande.getEmploye().getPrenom());
        }
        return dto;
    }
    @Override
    public DemandeCongeDTO getDemandeById(Long id) {
        DemandeConge demande = demandeCongeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande de conge non trouvee"));
        return mapToDto(demande);
    }
    @Override
    public void deleteDemande(Long id) {
        if (!demandeCongeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande de conge non trouvee");
        }
        demandeCongeRepository.deleteById(id);
    }
    @Override
    public DemandeCongeDTO updateDemande(Long id, DemandeCongeDTO dto) {
        DemandeConge demande = demandeCongeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande de conge non trouvee"));

        if (dto.getDebut() == null || dto.getFin() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les dates de debut et de fin sont obligatoires");
        }
        if (dto.getFin().isBefore(dto.getDebut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin doit etre apres la date de debut");
        }

        // Mise à jour des champs
        demande.setDateDebut(dto.getDebut());
        demande.setDateFin(dto.getFin());
        if (dto.getTypeConge() != null) {
            demande.setType(TypeConge.valueOf(dto.getTypeConge()));
        }
        if (dto.getStatutDemande() != null) {
            demande.setStatut(StatutDemande.valueOf(dto.getStatutDemande()));
        }

        // Sauvegarder les modifications
        DemandeConge updated = demandeCongeRepository.save(demande);
        return mapToDto(updated);
    }


    @Override
    public List<DemandeCongeDTO> getDemandesByType(String type) {

        // convertir String → Enum
        TypeConge typeConge = TypeConge.valueOf(type);

        List<DemandeConge> demandes = demandeCongeRepository.findByType(typeConge);

        return demandes.stream()
                .map(this::mapToDto)
                .toList();
    }
    public List<DemandeCongeDTO> getDemandesByStatut(String statut) {

        try {
            // convertir String → Enum
            StatutDemande statutDemande = StatutDemande.valueOf(statut.toUpperCase());

            List<DemandeConge> demandes = demandeCongeRepository.findByStatut(statutDemande);

            return demandes.stream()
                    .map(this::mapToDto)
                    .toList();

        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide");
        }
    }
    @Override
    public DemandeCongeDTO changeStatut(Long id, String statut) {

        // récupérer la demande
        DemandeConge demande = demandeCongeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande non trouvee"));

        // convertir String → Enum (sans try/catch)
        try {
            StatutDemande newStatut = StatutDemande.valueOf(statut.toUpperCase());

            // changer le statut
            demande.setStatut(newStatut);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide");
        }

        // sauvegarder
        return mapToDto(demandeCongeRepository.save(demande));
    }

    @Override
    public List<DemandeCongeDTO> getDemandesByEmployeeId(Long employeId){
        List<DemandeConge> demandes =
                demandeCongeRepository.findByEmployeId(employeId);
        return demandes.stream()
                .map(this::mapToDto)
                .toList();

    }
}


