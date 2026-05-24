package com.PlateformRH.demandeFormation;

import com.PlateformRH.Employe.employe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandeFormationRepository extends JpaRepository<DemandeFormation, Long> {
    List<DemandeFormation> findByStatut(StatutDemandeFormation statut);

    List<DemandeFormation> findByEmployeId(Long employeId);

    List<DemandeFormation> findByFormationId(Long formationId);
    List<DemandeFormation> findByEmploye(employe employe);
    List<DemandeFormation> findByEmployeIdAndFormationId(Long employeId, Long formationId);

}

