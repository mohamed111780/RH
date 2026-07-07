import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DemandeConge, CreateDemandeConge, StatutDemande } from '../models/demande-conge';

@Injectable({
  providedIn: 'root'
})
export class DemandeCongeService {

  private apiUrl = 'http://localhost:8000/Conge';

  constructor(private http: HttpClient) { }

  // CREATE — backend returns plain text, not JSON
  createDemande(
    employeId: number,
    demande: CreateDemandeConge
  ): Observable<void> {

    return this.http.post(
      `${this.apiUrl}/${employeId}`,
      demande,
      { responseType: 'text' }
    ).pipe(map(() => void 0));
  }

  // GET ALL
  getAllDemandes(): Observable<DemandeConge[]> {

    return this.http.get<DemandeConge[]>(
      this.apiUrl
    );
  }

  // GET BY ID
  getDemandeById(
    id: number
  ): Observable<DemandeConge> {

    return this.http.get<DemandeConge>(
      `${this.apiUrl}/${id}`
    );
  }

  // DELETE — backend returns plain text, not JSON
  deleteDemande(
    id: number
  ): Observable<void> {

    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { responseType: 'text' }
    ).pipe(map(() => void 0));
  }

  // UPDATE
  updateDemande(
    id: number,
    demande: DemandeConge
  ): Observable<DemandeConge> {

    return this.http.put<DemandeConge>(
      `${this.apiUrl}/${id}`,
      demande
    );
  }

  // GET BY TYPE
  getByType(
    type: string
  ): Observable<DemandeConge[]> {

    return this.http.get<DemandeConge[]>(
      `${this.apiUrl}/type/${type}`
    );
  }

  // GET BY STATUT
  getByStatut(
    statut: string
  ): Observable<DemandeConge[]> {

    return this.http.get<DemandeConge[]>(
      `${this.apiUrl}/statut/${statut}`
    );
  }

  // CHANGE STATUT
  changeStatut(
    id: number,
    statut: StatutDemande
  ): Observable<DemandeConge> {

    return this.http.put<DemandeConge>(
      `${this.apiUrl}/${id}/statut/${statut}`,
      {}
    );
  }

  // GET demandes BY EMPLOYEE ID
  getDemandesByEmployeeId(
    employeId: number
  ): Observable<DemandeConge[]> {

    return this.http.get<DemandeConge[]>(
      `${this.apiUrl}/employeId/${employeId}`
    );
  }

}
