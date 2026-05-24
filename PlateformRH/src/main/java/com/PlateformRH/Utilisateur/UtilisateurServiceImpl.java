package com.PlateformRH.Utilisateur;

import com.PlateformRH.Jwt.JwtRepository;
import com.PlateformRH.Jwt.JwtService;
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
public class UtilisateurServiceImpl implements UserDetailsService, UtilisateurService {

    private  final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtRepository jwtRepository;

    @Override
    public void prepareUtilisateur(utilisateur utilisateur) {

        if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) {
            throw new RuntimeException("email existe");
        }

        String hashedPassword = passwordEncoder.encode(utilisateur.getMotdepasse());
        utilisateur.setMotdepasse(hashedPassword);

        utilisateur.setDateCreation(new Date());
    }

    @Override
    public void create(utilisateur utilisateur) {
      this.prepareUtilisateur(utilisateur);
      // ajouter le role
         utilisateurRepository.save(utilisateur);

    }

    @Transactional
    @Override
    public  void delete (Long id){
        utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("aucun utilisateur ayant cet id"));
        jwtRepository.deleteByUserId(id);
        utilisateurRepository.delete(user);
    }


    @Override
    public List<UtilisateurDTO> getAll(){

       return utilisateurRepository.findAll()
               .stream()
               .map(this::UserToDto)
               .toList();


    }


    public UtilisateurDTO UserToDto (utilisateur utilisateur) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(utilisateur.getId());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setEmail(utilisateur.getEmail());
        dto.setTelephone(utilisateur.getTelephone());
        dto.setDateCreation(String.valueOf(utilisateur.getDateCreation()));
        dto.setRole(String.valueOf(utilisateur.getRole()));
        return dto;
    }

    // update
    @Override
    public UtilisateurDTO update(Long id, UtilisateurDTO newUser) {

        utilisateur existingUser = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        //  update les champs
        existingUser.setNom(newUser.getNom());
        existingUser.setPrenom(newUser.getPrenom());
        existingUser.setEmail(newUser.getEmail());
        existingUser.setTelephone(newUser.getTelephone());

         utilisateurRepository.save(existingUser);
        return this.UserToDto(existingUser);
    }

    @Override
    public utilisateur loadUserByUsername(String username) throws UsernameNotFoundException {
        return this.utilisateurRepository
                .findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("No user matches this ID"));
    }
    public List<UtilisateurDTO> getUsersByRole(String role) {

        List<utilisateur> users = utilisateurRepository.findByRole(Role.valueOf(role));

        return users.stream()
                .map(this::UserToDto)
                .toList();
    }

    @Override
    public void changerMotDePasse(
            Long id,
            Map<String, String> body
    ) {

        String ancienMotDePasse =
                body.get("ancienMotDePasse");

        String nouveauMotDePasse =
                body.get("nouveauMotDePasse");

       utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employé introuvable"
                        ));

        // Vérification ancien mot de passe
        if (!passwordEncoder.matches(
                ancienMotDePasse,
                utilisateur.getPassword()
        )) {

            throw new RuntimeException(
                    "Ancien mot de passe incorrect"
            );
        }

        // Mise à jour nouveau mot de passe
        utilisateur.setMotdepasse(
                passwordEncoder.encode(
                        nouveauMotDePasse
                )
        );

        utilisateurRepository.save(utilisateur);
    }
    @Transactional
    public void changerStatut(Long id) {
        utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setActif(!user.isActif()); // toggle ON/OFF

        utilisateurRepository.save(user);
    }
}





