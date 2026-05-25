import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Employe,CreateEmploye } from '../models/employe';



@Injectable({
  providedIn: 'root'
})
export class EmployeService {

  private apiUrl = 'http://localhost:8000/employe';

  constructor(private http: HttpClient) { }

  // CREATE
  addEmploye(
    employe: CreateEmploye
  ): Observable<void> {

    return this.http.post<void>(
      this.apiUrl,
      employe
    );
  }

  // GET ALL
  getAllEmployes(): Observable<Employe[]> {

    return this.http.get<Employe[]>(
      this.apiUrl
    );
  }

  // GET BY ID
  getEmployeById(
    id: number
  ): Observable<Employe> {

    return this.http.get<Employe>(
      `${this.apiUrl}/${id}`
    );
  }

  // UPDATE
  updateEmploye(
    id: number,
    employe: Employe
  ): Observable<Employe> {

    return this.http.put<Employe>(
      `${this.apiUrl}/${id}`,
      employe
    );
  }

  // DELETE
  deleteEmploye(
    id: number
  ): Observable<string> {

    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { responseType: 'text' }
    );
  }

  // GET SOLDES BY EMPLOYE
  getSoldesByEmploye(
    id: number
  ): Observable<any> {
    // For now, return mock data since backend might not have this endpoint
    return this.http.get(
      `${this.apiUrl}/${id}/soldes`
    );
  }

}
