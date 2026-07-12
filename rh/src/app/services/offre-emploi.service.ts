import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OffreEmploi, OffreType } from '../models/offre-emploi';

@Injectable({
  providedIn: 'root'
})
export class OffreEmploiService {
  private apiUrl = 'http://localhost:8000/offreEmploi';

  constructor(private http: HttpClient) {}

  getAllOffres(): Observable<OffreEmploi[]> {
    return this.http.get<OffreEmploi[]>(this.apiUrl);
  }

  getOffreById(id: number): Observable<OffreEmploi> {
    return this.http.get<OffreEmploi>(`${this.apiUrl}/${id}`);
  }

  getOffresByType(type: OffreType): Observable<OffreEmploi[]> {
    return this.http.get<OffreEmploi[]>(this.apiUrl).pipe(
      map((offres) => offres.filter((offre) => offre.type === type))
    );
  }

  createOffre(offre: OffreEmploi): Observable<OffreEmploi> {
    return this.http.post<OffreEmploi>(this.apiUrl, offre);
  }

  updateOffre(id: number, offre: OffreEmploi): Observable<OffreEmploi> {
    return this.http.put<OffreEmploi>(`${this.apiUrl}/${id}`, offre);
  }

  deleteOffre(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  cloturerOffre(id: number): Observable<OffreEmploi> {
    return this.http.put<OffreEmploi>(`${this.apiUrl}/${id}/cloturer`, {});
  }
}
