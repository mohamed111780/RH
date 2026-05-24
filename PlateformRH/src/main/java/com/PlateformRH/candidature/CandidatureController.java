// Classe : CandidatureController
package com.PlateformRH.candidature;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/candidature")
public class CandidatureController {

    private final CandidatureServiceImpl service;

    // US-31
    @PostMapping("/{offreId}")
    public void postuler(@PathVariable Long offreId,
                         @RequestBody Candidature c) {
        service.postuler(offreId, c);
    }

    // US-32
    @GetMapping
    public List<CandidatureDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/offre/{offreId}")
    public List<CandidatureDTO> getByOffre(@PathVariable Long offreId) {
        return service.getByOffre(offreId);
    }

    @PutMapping("/{id}/statut/{statut}")
    public ResponseEntity<CandidatureDTO> changeStatut(
            @PathVariable Long id,
            @PathVariable String statut) {

        return ResponseEntity.ok(service.changeStatut(id, statut));
    }
}