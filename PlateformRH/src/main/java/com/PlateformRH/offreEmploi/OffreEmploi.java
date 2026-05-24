// Classe : OffreEmploi
package com.PlateformRH.offreEmploi;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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

    private String statut; // OUVERTE / FERMEE
}