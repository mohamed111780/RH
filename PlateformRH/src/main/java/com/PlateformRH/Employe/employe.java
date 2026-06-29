package com.PlateformRH.Employe;

import com.PlateformRH.Employe.Role;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public class employe implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String motdepasse;
    private Date dateCreation;
    private boolean isActif = true;
    @Enumerated(EnumType.STRING)
    private Role role;

    private String Matricule;
    private String poste;
    private String departement;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date DateEmbauche;
    @Enumerated (EnumType.STRING)
    private TypeContrat typeContrat;
    private int soldeConge;

    @Override
    public String getPassword() {
        return this.motdepasse;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return this.isActif;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + this.role));
    }

    @Override
    public boolean isEnabled() {
        return this.isActif;
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.isActif;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return this.isActif;
    }

}
