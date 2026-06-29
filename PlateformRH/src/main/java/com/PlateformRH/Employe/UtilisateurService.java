package com.PlateformRH.Employe;

import com.PlateformRH.Employe.employe;

import java.util.List;
import java.util.Map;

public interface UtilisateurService {

    void create(employe utilisateur);
    void delete (Long id);
    List<UtilisateurDTO> getAll();

    // update utilisateur
    UtilisateurDTO update(Long id, UtilisateurDTO utilisateur);

     void prepareUtilisateur(employe utilisateur);
    List<UtilisateurDTO> getUsersByRole(String role);
    void changerMotDePasse(
            Long id,
            Map<String, String> body
    );
}
