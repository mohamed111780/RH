package com.PlateformRH.Formation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/formation")
public class FormationController {

    private final FormationServiceImpl formationService;

    @PostMapping
    public void addFormation(@RequestBody formation Formation) {
        formationService.createFormation(Formation);
    }

    @GetMapping
    public List<formationDto> getAllFormations() {
        return formationService.getAllFormations();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFormation(@PathVariable Long id) {

        formationService.deleteFormation(id);

        return ResponseEntity.ok("Formation supprimée avec succès");
    }

    @GetMapping("/{id}")
    public ResponseEntity<formationDto> getFormationById(@PathVariable Long id) {

        formationDto formation = formationService.getFormationById(id);

        return ResponseEntity.ok(formation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<formationDto> updateFormation(
            @PathVariable Long id,
            @RequestBody formationDto dto) {

        formationDto updated = formationService.updateFormation(id, dto);
        return ResponseEntity.ok(updated);
    }
}