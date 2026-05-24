package com.PlateformRH.Utilisateur;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Type;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Inheritance (strategy = InheritanceType.JOINED)
public class utilisateur implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String motdepasse;
    private Date dateCreation;
    private boolean isActif=true;
    @Enumerated(EnumType.STRING)
    private Role role;

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
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_"+this.role));
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
