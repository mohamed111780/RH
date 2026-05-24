import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Formation } from '../models/formation';

@Injectable({
  providedIn: 'root'
})
export class FormationService {

  private apiUrl =
    'http://localhost:8000/formation';

  constructor(
    private http: HttpClient
  ) {}

  /* =========================
     GET ALL FORMATIONS
  ========================== */

  getAllFormations():
    Observable<Formation[]> {

    return this.http.get<Formation[]>(
      this.apiUrl
    );
  }

  /* =========================
     GET FORMATION BY ID
  ========================== */

  getFormationById(
    id: number
  ): Observable<Formation> {

    return this.http.get<Formation>(
      `${this.apiUrl}/${id}`
    );
  }

  /* =========================
     CREATE FORMATION
  ========================== */

  createFormation(
    formation: Formation
  ): Observable<any> {

    return this.http.post(
      this.apiUrl,
      formation
    );
  }

  /* =========================
     UPDATE FORMATION
  ========================== */

  updateFormation(
    id: number,
    formation: Formation
  ): Observable<Formation> {

    return this.http.put<Formation>(
      `${this.apiUrl}/${id}`,
      formation
    );
  }

  /* =========================
     DELETE FORMATION
  ========================== */

  deleteFormation(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}