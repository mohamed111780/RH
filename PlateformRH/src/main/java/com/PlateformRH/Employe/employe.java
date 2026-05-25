package com.PlateformRH.Employe;

import com.PlateformRH.Utilisateur.utilisateur;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
public class employe extends utilisateur {
    private String Matricule;
    private String poste;
    private String departement;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date DateEmbauche;
    @Enumerated (EnumType.STRING)
    private TypeContrat typeContrat;
    private int soldeConge;


}
