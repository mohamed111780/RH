// Interface : CandidatureRepository
package com.PlateformRH.candidature;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidatureRepository extends JpaRepository<Candidature, Long> {

    List<Candidature> findByOffreId(Long offreId);

    long countByOffreId(Long offreId);

    boolean existsByOffreIdAndEmployeId(Long offreId, Long employeId);
}
