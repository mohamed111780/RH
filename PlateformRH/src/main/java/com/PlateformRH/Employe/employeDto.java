package com.PlateformRH.Employe;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class employeDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String dateCreation;
    private String Matricule;
    private String poste;
    private String departement;
    private Date DateEmbauche;
    private String typeContrat;
    private int soldeConge;
}
