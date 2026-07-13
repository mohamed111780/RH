export interface ActivityItem {
  color: string;
  message: string;
  time: string;
}

interface ActivityEvent {
  timestamp: number;
  color: string;
  message: string;
}

export interface ActivityFeedInput {
  offres?: {
    titre: string;
    statut?: string;
    datePublication?: string;
  }[];
  candidatures?: {
    id?: number;
    nomCandidat: string;
    titreOffre?: string;
    statut?: string;
    scoreMatching?: number;
  }[];
  leaveRequests?: {
    id?: number;
    prenomEmploye?: string;
    nomEmploye?: string;
    statutDemande?: string;
    debut?: string;
  }[];
  employees?: {
    prenom?: string;
    nom?: string;
    departement?: string;
    dateEmbauche?: string;
    dateCreation?: string;
  }[];
  formations?: {
    titre: string;
    dateDebut?: string;
  }[];
}

const ACTIVITY_COLORS = {
  offre: 'var(--accent)',
  candidature: 'var(--accent6)',
  score: 'var(--accent4)',
  entretien: 'var(--accent3)',
  conge: 'var(--accent4)',
  employe: 'var(--accent3)',
  formation: 'var(--accent2)',
  closed: 'var(--accent5)'
};

export function buildActivityFeed(input: ActivityFeedInput, limit = 6): ActivityItem[] {
  const events: ActivityEvent[] = [];

  for (const offre of input.offres || []) {
    const timestamp = parseTimestamp(offre.datePublication);
    if (!timestamp) continue;

    if (offre.statut === 'FERMEE') {
      events.push({
        timestamp,
        color: ACTIVITY_COLORS.closed,
        message: `Offre cloturee : <strong>${escapeHtml(offre.titre)}</strong>`
      });
      continue;
    }

    events.push({
      timestamp,
      color: ACTIVITY_COLORS.offre,
      message: `Nouvelle offre publiee : <strong>${escapeHtml(offre.titre)}</strong>`
    });
  }

  for (const candidature of input.candidatures || []) {
    const timestamp = (candidature.id ?? 0) * 1000;
    const name = escapeHtml(candidature.nomCandidat || 'Candidat');
    const offre = escapeHtml(candidature.titreOffre || 'une offre');

    if (candidature.statut === 'ACCEPTEE') {
      events.push({
        timestamp,
        color: ACTIVITY_COLORS.entretien,
        message: `<strong>${name}</strong> passe en entretien pour <strong>${offre}</strong>`
      });
      continue;
    }

    if ((candidature.scoreMatching ?? 0) >= 75) {
      events.push({
        timestamp,
        color: ACTIVITY_COLORS.score,
        message: `Score matching <strong>${candidature.scoreMatching}%</strong> pour <strong>${name}</strong>`
      });
      continue;
    }

    events.push({
      timestamp,
      color: ACTIVITY_COLORS.candidature,
      message: `Candidature de <strong>${name}</strong> pour <strong>${offre}</strong>`
    });
  }

  for (const request of input.leaveRequests || []) {
    const timestamp = parseTimestamp(request.debut) || (request.id ?? 0) * 1000;
    const name = escapeHtml(`${request.prenomEmploye || ''} ${request.nomEmploye || ''}`.trim() || 'Employe');

    if (request.statutDemande === 'EN_ATTENTE') {
      events.push({
        timestamp,
        color: ACTIVITY_COLORS.conge,
        message: `Demande de conge de <strong>${name}</strong> en attente`
      });
      continue;
    }

    if (request.statutDemande === 'APPROUVEE') {
      events.push({
        timestamp,
        color: ACTIVITY_COLORS.employe,
        message: `Conge approuve pour <strong>${name}</strong>`
      });
    }
  }

  for (const employee of input.employees || []) {
    const timestamp = parseTimestamp(employee.dateEmbauche || employee.dateCreation);
    if (!timestamp) continue;

    const name = escapeHtml(`${employee.prenom || ''} ${employee.nom || ''}`.trim() || 'Employe');
    const dept = escapeHtml(employee.departement || 'equipe');

    events.push({
      timestamp,
      color: ACTIVITY_COLORS.employe,
      message: `<strong>${name}</strong> a rejoint <strong>${dept}</strong>`
    });
  }

  for (const formation of input.formations || []) {
    const timestamp = parseTimestamp(formation.dateDebut);
    if (!timestamp) continue;

    events.push({
      timestamp,
      color: ACTIVITY_COLORS.formation,
      message: `Formation <strong>${escapeHtml(formation.titre)}</strong> programmee`
    });
  }

  return events
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map((event) => ({
      color: event.color,
      message: event.message,
      time: formatRelativeTime(event.timestamp)
    }));
}

function parseTimestamp(value?: string): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Recemment';

  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return 'Bientot';

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "A l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;

  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short'
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
