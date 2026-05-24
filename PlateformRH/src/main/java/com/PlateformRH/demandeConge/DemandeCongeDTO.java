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
    private String TypeConge;
    private String StatutDemande;
    private String MatriculeEmploye;
    private String nomEmploye;
    private String prenomEmploye;



}
