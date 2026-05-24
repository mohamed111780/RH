package com.PlateformRH.TypeCongeConfig;

import com.PlateformRH.demandeConge.TypeConge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TypeCongeConfigRepository extends JpaRepository<TypeCongeConfig, Long> {

    Optional<TypeCongeConfig> findByTypeConge(TypeConge typeConge);
}