export interface UpdateProfileRequest {

  nom: string;

  prenom: string;

  email: string;

  telephone?: string;

}

export interface Utilisateur {

  id?: number;

  nom: string;

  prenom: string;

  email: string;

  telephone?: string;

  dateCreation?: string;

  role: string;

}
