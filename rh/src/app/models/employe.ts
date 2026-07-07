export interface Employe {

  id?: number;

  role?: string;

  nom: string;

  prenom: string;

  email: string;

  telephone?: string;

  dateCreation?: string;

  matricule: string;

  poste?: string;

  departement?: string;

  dateEmbauche: string;

  typeContrat: string;

  soldeConge: number;

}
export interface CreateEmploye {

  role?: string;

  nom: string;

  prenom: string;

  email: string;

  telephone?: string;

  matricule: string;

  poste?: string;

  departement?: string;

  dateEmbauche: string;

  typeContrat: string;

  soldeConge: number;

  motdepasse: string;

}
