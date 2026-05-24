package com.PlateformRH.Employe;

import java.util.List;

public interface EmployeService {


    employeDto updateEmploye(Long id, employeDto dto);
    employeDto getEmployeById(Long id);
    List<employeDto> getAllEmployes();

    void createEmploye(employe Employe);

    void deleteEmploye(Long id);


}
