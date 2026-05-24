package com.PlateformRH.Admin;

import com.PlateformRH.Utilisateur.Role;
import com.PlateformRH.Utilisateur.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ManagerServiceImpl {

    private final ManagerRepository managerRepository;
    private final UtilisateurService utilisateurService;

    public void createManager(Manager manager) {
        if (manager.getRole() == null) {
            manager.setRole(Role.ADMIN);
        }
        utilisateurService.prepareUtilisateur(manager);
        managerRepository.save(manager);
    }

    public List<ManagerDto> getAllManagers() {
        return managerRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    public ManagerDto getManagerById(Long id) {
        Manager manager = managerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin non trouve"));

        return mapToDto(manager);
    }

    public ManagerDto updateManager(Long id, ManagerDto dto) {
        Manager manager = managerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin non trouve"));

        manager.setNom(dto.getNom());
        manager.setPrenom(dto.getPrenom());
        manager.setEmail(dto.getEmail());
        manager.setTelephone(dto.getTelephone());
        manager.setMatricule(dto.getMatricule());
        manager.setPoste(dto.getPoste());
        manager.setDepartement(dto.getDepartement());
        manager.setDateEmbauche(dto.getDateEmbauche());
        manager.setTypeContrat(dto.getTypeContrat());

        return mapToDto(managerRepository.save(manager));
    }

    private ManagerDto mapToDto(Manager manager) {
        ManagerDto dto = new ManagerDto();
        dto.setId(manager.getId());
        dto.setNom(manager.getNom());
        dto.setPrenom(manager.getPrenom());
        dto.setEmail(manager.getEmail());
        dto.setTelephone(manager.getTelephone());
        if (manager.getDateCreation() != null) {
            dto.setDateCreation(manager.getDateCreation().toString());
        }
        dto.setMatricule(manager.getMatricule());
        dto.setPoste(manager.getPoste());
        dto.setDepartement(manager.getDepartement());
        dto.setDateEmbauche(manager.getDateEmbauche());
        dto.setTypeContrat(manager.getTypeContrat());
        return dto;
    }
}
