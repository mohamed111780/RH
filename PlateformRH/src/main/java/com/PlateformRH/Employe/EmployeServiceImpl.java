package com.PlateformRH.Employe;

import com.PlateformRH.Jwt.JwtRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class EmployeServiceImpl implements EmployeService, UserDetailsService {

    private final EmployeRepository employeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtRepository jwtRepository;

    @Override
    public void prepareEmploye(employe employe) {
        if (employeRepository.findByEmail(employe.getEmail()).isPresent()) {
            throw new RuntimeException("email existe");
        }

        employe.setMotdepasse(passwordEncoder.encode(employe.getMotdepasse()));
        employe.setDateCreation(new Date());
    }

    @Override
    public void createEmploye(employe employe) {
        if (employe.getRole() == null) {
            employe.setRole(Role.EMPLOYE);
        }
        prepareEmploye(employe);
        employeRepository.save(employe);
    }

    @Transactional
    @Override
    public void deleteEmploye(Long id) {
        delete(id);
    }

    @Transactional
    @Override
    public void delete(Long id) {
        employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        jwtRepository.deleteByUserId(id);
        employeRepository.delete(employe);
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
        employe e = employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        e.setNom(dto.getNom());
        e.setPrenom(dto.getPrenom());
        e.setEmail(dto.getEmail());
        e.setTelephone(dto.getTelephone());
        e.setMatricule(dto.getMatricule());
        e.setPoste(dto.getPoste());
        e.setDepartement(dto.getDepartement());
        e.setDateEmbauche(dto.getDateEmbauche());
        if (dto.getRole() != null && !dto.getRole().isBlank()) {
            e.setRole(Role.valueOf(dto.getRole().trim().toUpperCase()));
        }
        if (dto.getTypeContrat() != null) {
            e.setTypeContrat(TypeContrat.valueOf(dto.getTypeContrat()));
        }
        e.setSoldeConge(dto.getSoldeConge());

        return mapToDto(employeRepository.save(e));
    }

    @Override
    public List<UtilisateurDTO> getAll() {
        return employeRepository.findAll()
                .stream()
                .map(this::mapToUtilisateurDto)
                .toList();
    }

    @Override
    public UtilisateurDTO update(Long id, UtilisateurDTO dto) {
        employe existingEmploye = employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

        existingEmploye.setNom(dto.getNom());
        existingEmploye.setPrenom(dto.getPrenom());
        existingEmploye.setEmail(dto.getEmail());
        existingEmploye.setTelephone(dto.getTelephone());

        return mapToUtilisateurDto(employeRepository.save(existingEmploye));
    }

    @Override
    public employe loadUserByUsername(String username) throws UsernameNotFoundException {
        return employeRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Aucun employé avec cet email"));
    }

    @Override
    public List<UtilisateurDTO> getUsersByRole(String role) {
        return employeRepository.findByRole(Role.valueOf(role))
                .stream()
                .map(this::mapToUtilisateurDto)
                .toList();
    }

    @Override
    public void changerMotDePasse(Long id, Map<String, String> body) {
        String ancienMotDePasse = body.get("ancienMotDePasse");
        String nouveauMotDePasse = body.get("nouveauMotDePasse");

        employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé introuvable"));

        if (!passwordEncoder.matches(ancienMotDePasse, employe.getPassword())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }

        employe.setMotdepasse(passwordEncoder.encode(nouveauMotDePasse));
        employeRepository.save(employe);
    }

    @Transactional
    @Override
    public void changerStatut(Long id) {
        employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé introuvable"));

        employe.setActif(!employe.isActif());
        employeRepository.save(employe);
    }

    public UtilisateurDTO mapToUtilisateurDto(employe employe) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(employe.getId());
        dto.setNom(employe.getNom());
        dto.setPrenom(employe.getPrenom());
        dto.setEmail(employe.getEmail());
        dto.setTelephone(employe.getTelephone());
        dto.setDateCreation(String.valueOf(employe.getDateCreation()));
        dto.setRole(String.valueOf(employe.getRole()));
        return dto;
    }

    private employeDto mapToDto(employe e) {
        employeDto dto = new employeDto();

        dto.setId(e.getId());
        if (e.getRole() != null) {
            dto.setRole(e.getRole().name());
        }
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
