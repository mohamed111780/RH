package com.PlateformRH.demandeFormation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/formation/demande")
@RestController
@RequiredArgsConstructor
public class DemandeFormationController {

    private final DemandeFormationServiceImpl demandeFormationService;

    // ================= SPECIFIC ROUTES FIRST =================
    
    // ================= GET BY EMPLOYE =================
    @GetMapping("/employe/{employeId}")
    public ResponseEntity<List<DemandeFormationDTO>> getByEmploye(
            @PathVariable Long employeId) {

        return ResponseEntity.ok(
                demandeFormationService.getDemandesByEmployeId(employeId)
        );
    }

    // ================= GET BY STATUT =================
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<DemandeFormationDTO>> getByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(demandeFormationService.getDemandesByStatut(statut));
    }

    // ================= CHANGE STATUT =================
    @PutMapping("/{id}/statut/{statut}")
    public ResponseEntity<DemandeFormationDTO> changeStatut(
            @PathVariable Long id,
            @PathVariable String statut) {

        return ResponseEntity.ok(
                demandeFormationService.changeStatut(id, statut)
        );
    }

    // ================= GENERIC ROUTES =================

    // ================= CREATE =================
    @PostMapping("/{employeId}/{formationId}")
    public ResponseEntity<Map<String, String>> createDemande(
            @RequestBody DemandeFormation demandeFormation,
            @PathVariable Long employeId,
            @PathVariable Long formationId) {

        demandeFormationService.createDemandeFormation(demandeFormation, employeId, formationId);

        return ResponseEntity.ok(
                Map.of("message", "Demande de formation créée avec succès !")
        );
    }

    // ================= GET ALL =================
    @GetMapping
    public ResponseEntity<List<DemandeFormationDTO>> getAllDemandes() {
        return ResponseEntity.ok(demandeFormationService.getAllDemandes());
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<DemandeFormationDTO> getDemandeById(@PathVariable Long id) {
        return ResponseEntity.ok(demandeFormationService.getDemandeById(id));
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    public ResponseEntity<DemandeFormationDTO> updateDemande(
            @PathVariable Long id,
            @RequestBody DemandeFormationDTO dto) {

        return ResponseEntity.ok(demandeFormationService.updateDemande(id, dto));
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDemande(@PathVariable Long id) {
        demandeFormationService.deleteDemande(id);
        return ResponseEntity.ok("Demande de formation supprimée avec succès !");
    }
}