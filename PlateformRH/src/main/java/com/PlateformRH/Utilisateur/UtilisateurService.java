package com.PlateformRH.Utilisateur;

import java.util.List;
import java.util.Map;

public interface UtilisateurService {

    void create (utilisateur utilisateur);
    void delete (Long id);
    List<UtilisateurDTO> getAll();

    // update utilisateur
    UtilisateurDTO update(Long id, UtilisateurDTO utilisateur);

     void prepareUtilisateur(utilisateur utilisateur);
    List<UtilisateurDTO> getUsersByRole(String role);
    void changerMotDePasse(
            Long id,
            Map<String, String> body
    );
}

