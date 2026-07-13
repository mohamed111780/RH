import { normalizeSkill } from './matching-score.util';

export interface SkillStat {
  name: string;
  count: number;
  color: string;
}

export interface StatusStat {
  key: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
  label: string;
  count: number;
  color: string;
  pct: number;
}

const STATUS_LABELS: Record<StatusStat['key'], string> = {
  EN_ATTENTE: 'À trier',
  ACCEPTEE: 'Entretien',
  REFUSEE: 'Rejetée'
};

export function computeTopSkills(
  offres: { skills?: string[] }[],
  colors: string[],
  limit = 6
): SkillStat[] {
  const counts = new Map<string, { name: string; count: number }>();

  for (const offre of offres) {
    for (const rawSkill of offre.skills || []) {
      const skill = rawSkill.trim();
      if (!skill) continue;

      const key = normalizeSkill(skill);
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { name: skill, count: 1 });
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((item, index) => ({
      name: item.name,
      count: item.count,
      color: colors[index % colors.length]
    }));
}

export function computeCandidatureStatusStats(
  candidatures: { statut?: string }[],
  colors: Record<StatusStat['key'], string>
): StatusStat[] {
  const counts: Record<StatusStat['key'], number> = {
    EN_ATTENTE: 0,
    ACCEPTEE: 0,
    REFUSEE: 0
  };

  for (const candidature of candidatures) {
    const statut = normalizeCandidatureStatus(candidature.statut);
    counts[statut] += 1;
  }

  const total = candidatures.length;

  return (Object.keys(counts) as StatusStat['key'][]).map((key) => ({
    key,
    label: STATUS_LABELS[key],
    count: counts[key],
    color: colors[key],
    pct: total ? Math.round((counts[key] / total) * 100) : 0
  }));
}

export function computeAverageMatchingScore(
  candidatures: { scoreMatching?: number }[]
): number {
  const scores = candidatures
    .map((candidature) => candidature.scoreMatching)
    .filter((score): score is number => score != null && score > 0);

  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function normalizeCandidatureStatus(statut?: string): StatusStat['key'] {
  if (statut === 'REFUSEE') return 'REFUSEE';
  if (statut === 'ACCEPTEE') return 'ACCEPTEE';
  return 'EN_ATTENTE';
}
