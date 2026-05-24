export interface Formation {

  id?: number;

  titre: string;

  description: string;

  dateDebut: string;

  dateFin: string;

  typeFormation: string;

  capacite: number;
}

export interface DemandeFormation {

  id?: number;

  employeId: number;

  formationId: number;

  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REFUSE';
}
