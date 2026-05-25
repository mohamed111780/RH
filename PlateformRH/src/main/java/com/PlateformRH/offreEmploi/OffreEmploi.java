// Classe : OffreEmploi
package com.PlateformRH.offreEmploi;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class OffreEmploi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(length = 1000)
    private String description;

    private String type; // INTERNE / EXTERNE

    private Integer candidatures;

    @Column(name = "competences", length = 2000)
    private String competences;

    private String departement;

    private String niveau;

    private String contrat;

    private String statut; // OUVERTE / FERMEE

    @Column(name = "date_publication")
    private LocalDateTime datePublication;
}
