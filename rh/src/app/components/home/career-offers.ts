import { OffreEmploi } from '../../models/offre-emploi';

export interface CareerOffer extends OffreEmploi {
  company: string;
  location: string;
}

export const CAREER_OFFERS: CareerOffer[] = [
  {
    id: 1,
    titre: 'Chargé·e de Recrutement Digital',
    description: 'Vous pilotez le sourcing et la sélection des talents digitaux, organisez les entretiens et améliorez l’expérience candidat.',
    type: 'EXTERNE',
    candidatures: 14,
    departement: 'Recrutement',
    niveau: 'Mid',
    contrat: 'CDI',
    skills: ['Sourcing', 'ATS', 'Communication', 'LinkedIn'],
    statut: 'OUVERTE',
    datePublication: '18 mai 2026',
    company: 'TalentMatch',
    location: 'Tunis, Tunisie'
  },
  {
    id: 2,
    titre: 'Business Analyst RH',
    description: 'Analyser les données RH, concevoir des rapports et accompagner les managers dans leurs décisions stratégiques.',
    type: 'EXTERNE',
    candidatures: 27,
    departement: 'Analyse',
    niveau: 'Senior',
    contrat: 'CDI',
    skills: ['Power BI', 'Reporting', 'RH', 'SQL'],
    statut: 'OUVERTE',
    datePublication: '12 mai 2026',
    company: 'Sofrecom',
    location: 'Tunis, Tunisie'
  },
  {
    id: 3,
    titre: 'Développeur Full Stack',
    description: 'Développez les modules RH, améliorez l’interface utilisateur et collaborez avec les équipes produit pour délivrer un logiciel hautement performant.',
    type: 'EXTERNE',
    candidatures: 41,
    departement: 'Développement',
    niveau: 'Junior',
    contrat: 'CDI',
    skills: ['Angular', 'Spring Boot', 'REST', 'Git'],
    statut: 'OUVERTE',
    datePublication: '22 mai 2026',
    company: 'Ooredoo',
    location: 'Sousse, Tunisie'
  }
];
