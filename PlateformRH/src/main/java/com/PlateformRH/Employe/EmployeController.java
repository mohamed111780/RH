package com.PlateformRH.Employe;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/employe")
public class EmployeController {
    private final EmployeServiceImpl employeService;

    @PostMapping
    public void addEmploye (@RequestBody  employe Employe){
        employeService.createEmploye(Employe);
    }

    @GetMapping
    public List<employeDto> getAllEmployes() {
        return employeService.getAllEmployes();
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmploye(@PathVariable Long id) {

        employeService.deleteEmploye(id);

        return ResponseEntity.ok("Employé supprimé avec succès");
    }
    @GetMapping("/{id}")
    public ResponseEntity<employeDto> getEmployeById(@PathVariable Long id) {

        employeDto employe = employeService.getEmployeById(id);

        return ResponseEntity.ok(employe);
    }
    @PutMapping("/{id}")
    public ResponseEntity<employeDto> updateEmploye(@PathVariable Long id, @RequestBody employeDto dto) {
        employeDto updated = employeService.updateEmploye(id, dto);
        return ResponseEntity.ok(updated);
    }







}
