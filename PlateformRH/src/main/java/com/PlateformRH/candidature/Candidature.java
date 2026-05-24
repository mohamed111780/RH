// Classe : Candidature
package com.PlateformRH.candidature;

import com.PlateformRH.offreEmploi.OffreEmploi;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomCandidat;
    private String email;

    private String cv;
    private String lettreMotivation;

    @ManyToOne
    private OffreEmploi offre;

    @Enumerated(EnumType.STRING)
    private

    StatutCandidature statut;
}