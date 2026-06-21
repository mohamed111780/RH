// Classe : Candidature
package com.PlateformRH.candidature;

import com.PlateformRH.offreEmploi.OffreEmploi;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Candidature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomCandidat;
    private String email;
    private Long employeId;
    private String matriculeEmploye;
    private String telephone;
    private String poste;
    private String departement;

    private String cv;
    private String lettreMotivation;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candidature_competence_tags", joinColumns = @JoinColumn(name = "candidature_id"))
    @Column(name = "tag")
    private List<String> competenceTags = new ArrayList<>();

    private Integer scoreMatching;

    @ManyToOne
    private OffreEmploi offre;

    @Enumerated(EnumType.STRING)
    private StatutCandidature statut;
}
