package com.PlateformRH.demandeFormation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DemandeFormationDTO {

    private long id;

    private String justification;

    private String statutDemande;

    private String matriculeEmploye;
    private String nomEmploye;
    private String prenomEmploye;

    private Long formationId;
    private String titreFormation;
}