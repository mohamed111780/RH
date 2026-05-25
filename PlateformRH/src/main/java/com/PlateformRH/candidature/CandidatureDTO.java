// Classe : CandidatureDTO
package com.PlateformRH.candidature;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidatureDTO {

    private Long id;

    private String nomCandidat;
    private String email;
    private Long employeId;
    private String matriculeEmploye;
    private String telephone;
    private String poste;
    private String departement;

    private String cv;
    private String lettreMotivation;
    

    private String statut;

    private Long offreId;
    private String titreOffre;
}
