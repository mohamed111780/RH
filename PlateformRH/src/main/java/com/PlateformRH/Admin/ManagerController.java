package com.PlateformRH.Admin;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ManagerController {

    private final ManagerServiceImpl managerService;

    @PostMapping
    public void addAdmin(@RequestBody Manager manager) {
        managerService.createManager(manager);
    }

    @GetMapping
    public List<ManagerDto> getAllAdmins() {
        return managerService.getAllManagers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ManagerDto> getAdminById(@PathVariable Long id) {
        return ResponseEntity.ok(managerService.getManagerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ManagerDto> updateAdmin(@PathVariable Long id, @RequestBody ManagerDto dto) {
        return ResponseEntity.ok(managerService.updateManager(id, dto));
    }
}
