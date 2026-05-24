package com.PlateformRH.demandeConge;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface DemandeCongeRepository extends JpaRepository<DemandeConge,Long> {
    List<DemandeConge> findByType(TypeConge type);
    List<DemandeConge> findByStatut(StatutDemande statut) ;
    List<DemandeConge> findByEmployeId(Long employeId);


}
