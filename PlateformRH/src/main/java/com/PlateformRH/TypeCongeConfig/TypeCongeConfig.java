package com.PlateformRH.TypeCongeConfig;

import com.PlateformRH.demandeConge.TypeConge;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TypeCongeConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TypeConge typeConge;

    private int plafondAnnuel; // nombre de jours max par an
}
