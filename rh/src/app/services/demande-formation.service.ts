import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  DemandeFormation,
  CreateDemandeFormation
} from '../models/demande-formation';

@Injectable({
  providedIn: 'root'
})
export class DemandeFormationService {

  private apiUrl =
    'http://localhost:8000/formation/demande';

  constructor(
    private http: HttpClient
  ) {}

  // ================= CREATE =================
  createDemande(
    employeId: number,
    formationId: number,
    demande: CreateDemandeFormation
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${employeId}/${formationId}`,
      demande
    );
  }

  // ================= GET ALL =================
  getAllDemandes():
    Observable<DemandeFormation[]> {

    return this.http.get<DemandeFormation[]>(
      this.apiUrl
    );
  }

  // ================= GET BY ID =================
  getDemandeById(
    id: number
  ): Observable<DemandeFormation> {

    return this.http.get<DemandeFormation>(
      `${this.apiUrl}/${id}`
    );
  }

  // ================= DELETE =================
  deleteDemande(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

  // ================= GET BY STATUT =================
  getByStatut(
    statut: string
  ): Observable<DemandeFormation[]> {

    return this.http.get<DemandeFormation[]>(
      `${this.apiUrl}/statut/${statut}`
    );
  }

  // ================= GET BY EMPLOYE =================
  getByEmploye(
    employeId: number
  ): Observable<DemandeFormation[]> {

    return this.http.get<DemandeFormation[]>(
      `${this.apiUrl}/employe/${employeId}`
    );
  }

  // ================= UPDATE =================
  updateDemande(
    id: number,
    demande: Pick<DemandeFormation, 'justification' | 'statutDemande'>
  ): Observable<DemandeFormation> {

    return this.http.put<DemandeFormation>(
      `${this.apiUrl}/${id}`,
      {
        justification: demande.justification,
        statutDemande: demande.statutDemande
      }
    );
  }

  // ================= CHANGE STATUT =================
  changeStatut(
    id: number,
    statut: string
  ): Observable<DemandeFormation> {

    return this.http.put<DemandeFormation>(
      `${this.apiUrl}/${id}/statut/${statut}`,
      {}
    );
  }

  // ================= ANNULER DEMANDE =================
  cancelDemande(
    id: number
  ): Observable<DemandeFormation> {

    return this.changeStatut(id, 'ANNULEE');
  }
}
