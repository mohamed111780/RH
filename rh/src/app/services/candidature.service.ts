import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Candidature } from '../models/candidature';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private apiUrl = 'http://localhost:8000/candidature';

  constructor(private http: HttpClient) {}

  postuler(offreId: number, candidature: Candidature): Observable<void> {
    return this.http.post(
      `${this.apiUrl}/${offreId}`,
      candidature,
      { responseType: 'text' }
    ).pipe(map(() => void 0));
  }

  getAll(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.apiUrl);
  }

  getByOffre(offreId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/offre/${offreId}`);
  }

  changeStatut(id: number, statut: string): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.apiUrl}/${id}/statut/${statut}`, {});
  }
}
