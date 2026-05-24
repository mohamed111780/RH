import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateProfileRequest } from '../../models/utilisateur';
import { UtilisateurDTO } from '../../models/auth.model';
import { ChangePasswordRequestt, ChangePassword, LoginRequest, LoginResponse, ResetPasswordRequest, ValidateCodeRequest, ChangePasswordRequest, ApiResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private apiUrl = 'http://localhost:8000/utilisateurs';
  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data);
  }

  saveSession(response: LoginResponse) {
    console.log('💾 [AuthService] saveSession - response:', response);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.utilisateur));
    localStorage.setItem('userId', response.utilisateur.id.toString());
    console.log('💾 [AuthService] Utilisateur sauvegardé:', response.utilisateur);
  }

  updateStoredUser(user: UtilisateurDTO) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', user.id.toString());
  }

  logout(): Observable<any> {

  return this.http.post(
    `${this.apiUrl}/logout`,
    {}
  );
}
clearSession() {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  }
  getUser(): UtilisateurDTO | null {
    const userStr = localStorage.getItem('user');
    console.log('💾 [AuthService] getUser - userStr:', userStr);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UtilisateurDTO;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken');
    console.log('💾 [AuthService] isLoggedIn - token:', token ? 'présent' : 'absent');
    return !!token;
  }

  getUserRole(): string | null {
    const user = this.getUser();
    console.log('💾 [AuthService] getUserRole - user:', user);
    return user?.role || null;
  }

  // ===== RESET PASSWORD =====

// 1️⃣ Envoyer email
// Dans auth.service.ts
requestPasswordReset(data: ResetPasswordRequest): Observable<any> {
  console.log('📤 RESET PASSWORD:', data);

  return this.http.post(
    `${this.apiUrl}/demande-mot-de-passe`,data
   
  );
}

// 2️⃣ Vérifier code
validateResetCode(data: ValidateCodeRequest): Observable<ApiResponse> {
  return this.http.post<ApiResponse>(
    `${this.apiUrl}/validate-code`,
    data
  );
}

// 3️⃣ Changer mot de passe
changePassword(data: ChangePasswordRequest): Observable<ApiResponse> {
  return this.http.post<ApiResponse>(
    `${this.apiUrl}/change-password`,
    data
  );
}
ChangePassword(
  id: number,
  passwords: ChangePassword
) {

  return this.http.put(
    `${this.apiUrl}/${id}/change-password`,
    passwords,
    { responseType: 'text' }
  );

}
updateUser(id: number, user: UpdateProfileRequest): Observable<any> {
  return this.http.put(
    `${this.apiUrl}/${id}`,
    user
  );
}


ChangePasswordd(
  id: number,
  data: ChangePasswordRequestt
): Observable<string> {

  return this.http.put(
    `${this.apiUrl}/${id}/change-password`,
    data,
    { responseType: 'text' }
  );
}

}
