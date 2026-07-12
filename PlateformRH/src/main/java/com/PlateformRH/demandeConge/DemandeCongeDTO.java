package com.PlateformRH.demandeConge;

import lombok.Getter;
import lombok.Setter;

import javax.xml.crypto.Data;
import java.time.LocalDate;
import java.util.Date;
@Getter
@Setter
public class DemandeCongeDTO {
    private long id;
    private LocalDate debut;
    private LocalDate fin;
    private String typeConge;
    private String statutDemande;
    private String matriculeEmploye;
    private String nomEmploye;
    private String prenomEmploye;



}
