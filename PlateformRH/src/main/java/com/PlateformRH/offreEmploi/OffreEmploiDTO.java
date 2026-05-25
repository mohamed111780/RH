// Classe : OffreEmploiDTO
package com.PlateformRH.offreEmploi;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OffreEmploiDTO {

    private Long id;
    private String titre;
    private String description;
    private String type;
    private Integer candidatures;
    private String departement;
    private String niveau;
    private String contrat;
    private List<String> skills;
    private String statut;
    private LocalDateTime datePublication;
}
