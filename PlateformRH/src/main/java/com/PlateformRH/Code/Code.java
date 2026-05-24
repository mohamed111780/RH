package com.PlateformRH.Code;

import com.PlateformRH.Utilisateur.utilisateur;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Code {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private  Long id;
    private Instant expiration;
    private Instant activation;
    private String code;
    @ManyToOne(cascade= CascadeType.ALL)
    private utilisateur utilisateur;
}
