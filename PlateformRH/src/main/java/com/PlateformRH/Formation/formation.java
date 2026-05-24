package com.PlateformRH.Formation;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
public class formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;

    private Date dateDebut;
    private Date dateFin;

    @Enumerated(EnumType.STRING)
    private TypeFormation typeFormation;

    private int capacite;
}