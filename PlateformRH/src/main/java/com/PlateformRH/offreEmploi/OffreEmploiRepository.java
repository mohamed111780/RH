// Interface : OffreEmploiRepository
package com.PlateformRH.offreEmploi;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OffreEmploiRepository extends JpaRepository<OffreEmploi, Long> {
}