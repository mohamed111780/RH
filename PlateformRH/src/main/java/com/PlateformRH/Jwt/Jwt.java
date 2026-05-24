package com.PlateformRH.Jwt;

import com.PlateformRH.Utilisateur.utilisateur;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Jwt  {


    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    private  boolean expired=false;
    private boolean desactivated=false;
    private String value;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private utilisateur user;

}
