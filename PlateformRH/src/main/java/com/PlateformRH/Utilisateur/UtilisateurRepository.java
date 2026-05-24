package com.PlateformRH.Utilisateur;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<utilisateur, Long> {

    Optional<utilisateur> findByEmail(String email);
    List<utilisateur> findByRole(Role role);
}
