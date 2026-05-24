package com.PlateformRH.TypeCongeConfig;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/TypeCongeConfig")
public class TypeCongeConfigController {
    private final TypeCongeConfigServiceImlp typeCongeConfigService;

    // Ajouter ou modifier
    @PostMapping
    public ResponseEntity<TypeCongeConfigDTO> save(@RequestBody TypeCongeConfigDTO dto) {
        return ResponseEntity.ok(typeCongeConfigService.saveOrUpdate(dto));
    }

    // Voir toutes les configurations
    @GetMapping
    public ResponseEntity<List<TypeCongeConfigDTO>> getAll() {
        return ResponseEntity.ok(typeCongeConfigService.getAllConfigs());
    }


}
