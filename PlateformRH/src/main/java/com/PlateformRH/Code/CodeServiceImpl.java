package com.PlateformRH.Code;

import com.PlateformRH.Utilisateur.UtilisateurRepository;
import com.PlateformRH.Utilisateur.UtilisateurServiceImpl;
import com.PlateformRH.Utilisateur.utilisateur;
import com.PlateformRH.config.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;

import static java.time.temporal.ChronoUnit.MINUTES;

@Service
@RequiredArgsConstructor
public class CodeServiceImpl implements CodeService{
    private final CodeRepository codeRepository;
    private final EmailService emailService;
    private final UtilisateurServiceImpl utilisateurService;
    private  final PasswordEncoder passwordEncoder;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public void codeActivation(String username){
        utilisateur utilisateur= utilisateurService.loadUserByUsername(username);

        if (utilisateur == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        Code code = new Code();
        code.setUtilisateur(utilisateur);

        // Définir les instants d'activation et d'expiration
        Instant activation = Instant.now();
        code.setActivation(activation);
        Instant expiration = activation.plus(10, MINUTES);
        code.setExpiration(expiration);

        // Générer un code de validation aléatoire à 6 chiffres
        Random random = new Random();
        String codeOTP = String.format("%06d", random.nextInt(999999));
        code.setCode(codeOTP);

        // Enregistrer l'objet code
        codeRepository.save(code);

        // Envoyer le mail
        String subject = "Code de Réinitialisation de mot de passe";
        String body = "Votre code : " + code.getCode() + " — il expire dans  10 minutes.";
        emailService.sendSimpleEmail(utilisateur.getEmail(), subject, body);



    }

    //1er etape
    @Override
    public void demandeMotDePasse(Map<String, String> parametres){

        //"email":"khmiletthanen@gmail.com"
        codeActivation(parametres.get("email"));

    }
    //2eme etape
    @Override
    public Map<String, String> validationCode(Map<String, String> parametres){

        String email = parametres.get("email");
        String code = parametres.get("code");

        Code validation = codeRepository.findByCode(code);
        utilisateur utilisateur = validation.getUtilisateur();
        if (validation == null || Instant.now().isAfter(validation.getExpiration())) {

            Map<String, String> response = Map.of("message", "Invalid Code");
            return ResponseEntity.badRequest().body(response).getBody();
        }
        if (!utilisateur.getEmail().equals(email)) {

            Map<String, String> response = Map.of("message", "Email incorrect");
            return ResponseEntity.badRequest().body(response).getBody();
        }
        Map<String, String> response = Map.of("message", "Code correct et valide. Vous pouvez changer votre mot de passe.");
        return ResponseEntity.ok().body(response).getBody();

    }

    //3eme etape
    @Override
    public void changePassword(Map<String, String> parametres){
        // Extraire les paramètres
        String email = parametres.get("email");
        String password = parametres.get("password");
        // Charger l'utilisateur par email
        utilisateur utilisateur=utilisateurService.loadUserByUsername(email);

        // Mettre à jour le mot de passe si fourni
        if (password != null && !password.isEmpty()) {
            String hashedPassword = passwordEncoder.encode(password);
            utilisateur.setMotdepasse(hashedPassword);
            utilisateurRepository.save(utilisateur);}
    }
}
