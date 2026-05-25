export interface OffreEmploi {
  id?: number;
  titre: string;
  description: string;
  type: OffreType;
  candidatures?: number;
  departement: string;
  niveau: string;
  contrat: string;
  skills: string[];
  statut: OffreStatut;
  datePublication?: string;
}

export type OffreType = 'INTERNE' | 'EXTERNE';
export type OffreStatut = 'OUVERTE' | 'FERMEE' | 'BROUILLON';
