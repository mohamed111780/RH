package com.PlateformRH.demandeConge;

import com.PlateformRH.Employe.employe;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class DemandeConge {


        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        private Long id;

        private LocalDate dateDebut;
        private LocalDate dateFin;

        @Enumerated(EnumType.STRING)
        private TypeConge type;

        @Enumerated(EnumType.STRING)
        private StatutDemande statut;

        // relation avec employé
        @ManyToOne
        @JoinColumn(name = "employe_id")
        private employe employe;
}

