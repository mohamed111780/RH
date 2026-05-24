package com.PlateformRH.Formation;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class formationDto {

    private Long id;

    private String titre;
    private String description;

    private Date dateDebut;
    private Date dateFin;

    private String typeFormation;

    private int capacite;
}