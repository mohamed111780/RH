package com.PlateformRH.Utilisateur;

import com.PlateformRH.Code.CodeServiceImpl;
import com.PlateformRH.Jwt.Authentification;
import com.PlateformRH.Jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/utilisateurs")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurServiceImpl utilisateurService;
    private  final CodeServiceImpl codeService;
    private final JwtService jwtService;

    // ✅ CREATE (inscription / ajout employé)
   @PostMapping
    public void create(@RequestBody utilisateur utilisateur) {
         utilisateurService.create(utilisateur);
    }

    // ✅ GET BY ID


    // ✅ GET ALL (liste employés)
    @GetMapping
    public List<UtilisateurDTO> getAll() {
        return utilisateurService.getAll();
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        utilisateurService.delete(id);
    }

    // ✅ UPDATE
   @PutMapping("/{id}")
    public UtilisateurDTO update(@PathVariable Long id,
                                 @RequestBody UtilisateurDTO utilisateur) {
        return utilisateurService.update(id, utilisateur);
    }
    @PostMapping(path="/demande-mot-de-passe")
    public ResponseEntity<Map<String, String>> requestNewPassword(
            @RequestBody Map<String, String> parametres) {

        System.out.println("✅ Controller atteint avec : " + parametres);

        try {
            codeService.demandeMotDePasse(parametres);
        } catch (Exception e) {
            System.out.println("❌ Exception dans codeService : " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("message", "Votre code est envoyé par email"));
    }

    // validation code
    @PostMapping("/validate-code")
    public ResponseEntity<Map<String, String>> validationCode(@RequestBody Map<String, String> parametres) {

        Map<String, String> response = codeService.validationCode(parametres);
        return ResponseEntity.ok(response);
    }

    //nouveau mot de passe:
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> parametres) {

        codeService.changePassword(parametres);

        Map<String, String> response = Map.of(
                "message", "Mot de passe changé avec succès"
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Authentification authentification) {


       
        utilisateur utilisateur = utilisateurService.loadUserByUsername(authentification.username());
        UtilisateurDTO utilisateurDTO= utilisateurService.UserToDto(utilisateur);
        Map<String, String> tokens = jwtService.generate(utilisateur.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", tokens.get("accessToken"));
        response.put("refreshToken", tokens.get("refreshToken"));
        response.put("utilisateur", utilisateurDTO);

        return response;


    }
    @GetMapping("/role/{role}")
    public  List<UtilisateurDTO> getUsersByRole(@PathVariable String role) {

      return utilisateurService.getUsersByRole(role);
    }
    @PostMapping("/logout")
    public void logout(){
       jwtService.deconnexion();
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<String> changerMotDePasse(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {

        utilisateurService.changerMotDePasse(id, body);

        return ResponseEntity.ok(
                "Mot de passe modifié avec succès"
        );
    }
    @PutMapping("/{id}/toggle-statut")
    public ResponseEntity<Void> changerStatut(@PathVariable Long id) {
        utilisateurService.changerStatut(id);
        return ResponseEntity.ok().build();
    }

}