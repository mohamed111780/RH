package com.PlateformRH.Employe;

import java.util.List;
import java.util.Map;

public interface EmployeService {

    employeDto updateEmploye(Long id, employeDto dto);

    employeDto getEmployeById(Long id);

    List<employeDto> getAllEmployes();

    void createEmploye(employe employe);

    void deleteEmploye(Long id);

    void prepareEmploye(employe employe);

    void delete(Long id);

    List<UtilisateurDTO> getAll();

    UtilisateurDTO update(Long id, UtilisateurDTO employe);

    List<UtilisateurDTO> getUsersByRole(String role);

    void changerMotDePasse(Long id, Map<String, String> body);

    void changerStatut(Long id);
}
