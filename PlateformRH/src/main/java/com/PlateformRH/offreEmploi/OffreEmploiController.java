// Classe : OffreEmploiController
package com.PlateformRH.offreEmploi;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/offreEmploi")
public class OffreEmploiController {

    private final OffreEmploiServiceImpl offreService;

    @PostMapping
    public ResponseEntity<OffreEmploiDTO> addOffre(@RequestBody OffreEmploiDTO offre) {
        return ResponseEntity.ok(offreService.createOffre(offre));
    }

    @GetMapping
    public List<OffreEmploiDTO> getAllOffres() {
        return offreService.getAllOffres();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OffreEmploiDTO> getOffreById(@PathVariable Long id) {
        return ResponseEntity.ok(offreService.getOffreById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OffreEmploiDTO> updateOffre(
            @PathVariable Long id,
            @RequestBody OffreEmploiDTO dto) {

        return ResponseEntity.ok(offreService.updateOffre(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOffre(@PathVariable Long id) {

        offreService.deleteOffre(id);

        return ResponseEntity.ok("Offre supprimée avec succès");
    }

    // 🔥 US-30 : clôturer offre
    @PutMapping("/{id}/cloturer")
    public ResponseEntity<OffreEmploiDTO> cloturer(@PathVariable Long id) {

        return ResponseEntity.ok(offreService.cloturerOffre(id));
    }
}
