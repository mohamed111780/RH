export interface DemandeFormation {

  id?: number;

  justification: string;

  statutDemande: StatutDemandeFormation;

  matriculeEmploye: string;

  nomEmploye: string;

  prenomEmploye: string;

  formationId: number;

  titreFormation: string;
}

export interface CreateDemandeFormation {

  justification: string;
}

export type StatutDemandeFormation =
  | 'EN_ATTENTE'
  | 'APPROUVEE'
  | 'REFUSEE'
  | 'ANNULEE';
