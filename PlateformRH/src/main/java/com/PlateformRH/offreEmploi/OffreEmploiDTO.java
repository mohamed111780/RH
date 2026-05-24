// Classe : OffreEmploiDTO
package com.PlateformRH.offreEmploi;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OffreEmploiDTO {

    private Long id;
    private String titre;
    private String description;
    private String type;
    private String statut;
}