package com.PlateformRH.Code;

import java.util.Map;

public interface CodeService {
    //creation de code avec verification si l'utilisateur existe
    void codeActivation(String username);

    //exemple : "email" : "khmileth@gmail.com"
    void demandeMotDePasse(Map<String, String> parametres);

    // verification de code s'il est correct ou non, s'il est expiré ou non
    // format de données: {"email": "khmiletthanen@gmail.com",
    //                    "code":"999999"}
    Map<String, String> validationCode(Map<String, String> parametres);

void changePassword(Map<String, String> parametres);
}
