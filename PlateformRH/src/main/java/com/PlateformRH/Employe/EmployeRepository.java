package com.PlateformRH.Employe;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeRepository extends JpaRepository<employe, Long> {

    Optional<employe> findByEmail(String email);

    List<employe> findByRole(Role role);
}
