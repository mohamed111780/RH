export interface DemandeConge {

  id?: number;

  debut: string;

  fin: string;

  typeConge: TypeConge;

  statutDemande: StatutDemande;

  matriculeEmploye: string;

  nomEmploye: string;

  prenomEmploye: string;

}
export interface CreateDemandeConge {

  dateDebut: string;

  dateFin: string;

  type: TypeConge;

}
export type StatutDemande = 'EN_ATTENTE' | 'APPROUVE' | 'REFUSEE' | 'ANNULE';
export type TypeConge     = 'PAYE' | 'MALADIE' | 'SANS_SOLDE' | 'EXCEPTIONNEL' | 'MATERNITE';




export interface SoldeConges {
  PAYE: number;
  MALADIE: number;
  SANS_SOLDE: number;
  EXCEPTIONNEL: number;
  MATERNITE: number;
}

export const TYPE_LABELS: Record<TypeConge, string> = {
  PAYE:        'Congé payé',
  MALADIE:     'Congé maladie',
  SANS_SOLDE:  'Sans solde',
  EXCEPTIONNEL:'Congé exceptionnel',
  MATERNITE:   'Maternité / Paternité',
};

export const SOLDES_MAX: Record<TypeConge, number> = {
  PAYE: 30, MALADIE: 10, SANS_SOLDE: 999, EXCEPTIONNEL: 5, MATERNITE: 60,
};