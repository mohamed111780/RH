export interface UtilisateurDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateCreation: string;
  role: string;
}
export interface LoginRequest {
  username: string;   // ⚠️ IMPORTANT (backend utilise username, pas email)
  password: string;
}
export interface LoginResponse {
  utilisateur: UtilisateurDTO;
  accessToken: string;
  refreshToken: string;
}
export interface ResetPasswordRequest {
  email: string;
}

export interface ValidateCodeRequest {
  email: string;
  code: string;
}


export interface ChangePasswordRequest {
  email: string;
  password: string;
}

export interface ApiResponse {
  message: string;
}
export interface ChangePassword {

  ancienMotDePasse: string;

  nouveauMotDePasse: string;

}
export interface ChangePasswordRequestt {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}
