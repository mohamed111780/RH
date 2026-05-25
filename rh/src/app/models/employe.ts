export interface Employe {

  id?: number;

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
