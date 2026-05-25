package com.PlateformRH.Employe;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date DateEmbauche;
    private String typeContrat;
    private int soldeConge;
}
