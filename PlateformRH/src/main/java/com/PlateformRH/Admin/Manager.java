package com.PlateformRH.Admin;

import com.PlateformRH.Utilisateur.utilisateur;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
public class Manager extends utilisateur {
    private String matricule;
    private String poste;
    private String departement;
    private Date dateEmbauche;
    private String typeContrat;
}
