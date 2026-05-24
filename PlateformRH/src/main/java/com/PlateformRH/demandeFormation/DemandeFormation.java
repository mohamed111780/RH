package com.PlateformRH.demandeFormation;

import com.PlateformRH.Employe.employe;
import com.PlateformRH.Formation.formation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class DemandeFormation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String justification;

    @Enumerated(EnumType.STRING)
    private StatutDemandeFormation statut;

    // relation avec employé
    @ManyToOne
    @JoinColumn(name = "employe_id")
    private employe employe;

    // relation avec formation
    @ManyToOne
    @JoinColumn(name = "formation_id")
    private formation formation;
}