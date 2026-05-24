export interface OffreEmploi {
  id?: number;
  titre: string;
  description: string;
  niveau: string;
  skills: string[];
  statut: OffreStatut;
}

export type OffreStatut = 'OUVERTE' | 'CLOTURÉE' | 'BROUILLON';
