package com.PlateformRH.Admin;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class ManagerDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String dateCreation;
    private String matricule;
    private String poste;
    private String departement;
    private Date dateEmbauche;
    private String typeContrat;
}
