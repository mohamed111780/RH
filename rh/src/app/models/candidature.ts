export interface Candidature {
  id?: number;
  nomCandidat: string;
  email: string;
  employeId?: number;
  matriculeEmploye?: string;
  telephone?: string;
  poste?: string;
  departement?: string;
  cv?: string;
  lettreMotivation?: string;
  statut?: string;
  offreId?: number;
  titreOffre?: string;
}
