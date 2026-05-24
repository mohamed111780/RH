package com.PlateformRH.Employe;

import com.PlateformRH.Utilisateur.Role;
import com.PlateformRH.Utilisateur.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class EmployeServiceImpl implements EmployeService{

    private final EmployeRepository employeRepository;
    private final UtilisateurService utilisateurService;



    @Override
    public void createEmploye(employe employe) {
        if (employe.getRole() == null) {
            employe.setRole(Role.EMPLOYE); // ou tout autre rôle par défaut
        }
        utilisateurService.prepareUtilisateur(employe);
      employeRepository.save(employe);

    }

    @Override
    public void deleteEmploye(Long id) {

        if (!employeRepository.existsById(id)) {
            throw new RuntimeException("Employé non trouvé");
        }

        employeRepository.deleteById(id);
    }

@Override
public List<employeDto> getAllEmployes() {

    return employeRepository.findAll()
            .stream()
            .map(this::mapToDto)
            .toList();
}
@Override
public employeDto getEmployeById(Long id) {

    employe employe = employeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

    return mapToDto(employe);
}



@Override
public employeDto updateEmploye(Long id, employeDto dto) {
    // Vérifier si l'employé existe
    employe e = employeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

    // Mettre à jour les champs
    e.setNom(dto.getNom());
    e.setPrenom(dto.getPrenom());
    e.setEmail(dto.getEmail());
    e.setTelephone(dto.getTelephone());
    e.setMatricule(dto.getMatricule());
    e.setPoste(dto.getPoste());
    e.setDepartement(dto.getDepartement());
    e.setDateEmbauche(dto.getDateEmbauche());
    if (dto.getTypeContrat() != null) {
        e.setTypeContrat(TypeContrat.valueOf(dto.getTypeContrat()));
    }
    e.setSoldeConge(dto.getSoldeConge());

    // Sauvegarder les modifications
    employe updated = employeRepository.save(e);

    // Retourner le DTO
    return mapToDto(updated);
}


    private employeDto mapToDto(employe e) {

        employeDto dto = new employeDto();

        dto.setId(e.getId());
        dto.setNom(e.getNom());
        dto.setPrenom(e.getPrenom());
        dto.setEmail(e.getEmail());
        dto.setTelephone(e.getTelephone());

        if (e.getDateCreation() != null) {
            dto.setDateCreation(e.getDateCreation().toString());
        }

        dto.setMatricule(e.getMatricule());
        dto.setPoste(e.getPoste());
        dto.setDepartement(e.getDepartement());
        dto.setDateEmbauche(e.getDateEmbauche());

        if (e.getTypeContrat() != null) {
            dto.setTypeContrat(e.getTypeContrat().name());
        }

        dto.setSoldeConge(e.getSoldeConge());

        return dto;
    }

}
