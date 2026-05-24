package com.PlateformRH.demandeConge;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/Conge")
@RestController
@RequiredArgsConstructor
public class DemandeCongeController {

    private final DemandeCongeServiceImpl demandeCongeService;

    @PostMapping("/{employeId}")
    public ResponseEntity<String> createDemande(@RequestBody DemandeConge demandeConge, @PathVariable  Long employeId) {
        demandeCongeService.DemandeConge(demandeConge, employeId);
        return ResponseEntity.ok("Demande de congé créée avec succès !");
    }
    @GetMapping
    public List<DemandeCongeDTO> getAllDemandes() {
        List<DemandeCongeDTO> demandes = demandeCongeService.getAllDemandes();
        return demandes;
    }
    @GetMapping("/{id}")
    public DemandeCongeDTO getDemandeById(@PathVariable Long id) {
        return demandeCongeService.getDemandeById(id);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDemande(@PathVariable Long id) {
        demandeCongeService.deleteDemande(id);
        return ResponseEntity.ok("Demande de congé supprimée avec succès !");
    }

    @PutMapping("/{id}")
    public DemandeCongeDTO updateDemande(@PathVariable Long id, @RequestBody DemandeCongeDTO dto) {
        return demandeCongeService.updateDemande(id, dto);
    }
    @GetMapping("/type/{type}")
    public List<DemandeCongeDTO> getByType(@PathVariable String type) {
        return demandeCongeService.getDemandesByType(type);
    }

    @GetMapping("/statut/{statut}")
    public List<DemandeCongeDTO> getByStatut(@PathVariable String statut) {
        return demandeCongeService.getDemandesByStatut(statut);
    }
    @PutMapping("/{id}/statut/{statut}")
    public DemandeCongeDTO changeStatut(
            @PathVariable Long id,
            @PathVariable String statut) {

        return
                demandeCongeService.changeStatut(id, statut)
        ;
    }


@GetMapping("/employeId/{employeId}")
    public List<DemandeCongeDTO> getDemandesByEmployeeId(@PathVariable Long employeId){
        return demandeCongeService.getDemandesByEmployeeId(employeId);
}

}

