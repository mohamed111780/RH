export function normalizeSkill(skill: string): string {
  return skill
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function computeMatchingScore(candidateTags: string[], offerTags: string[]): number {
  if (!offerTags?.length || !candidateTags?.length) {
    return 0;
  }

  const normalizedCandidateTags = new Set(
    candidateTags.map(normalizeSkill).filter(Boolean)
  );

  const matches = offerTags.filter((tag) =>
    normalizedCandidateTags.has(normalizeSkill(tag))
  ).length;

  return Math.round((matches * 100) / offerTags.length);
}

export function inferProfileSkills(profileText: string, offerTags: string[]): string[] {
  if (!profileText.trim() || !offerTags.length) {
    return [];
  }

  const tokens = profileText
    .split(/[\s,;/|+]+/)
    .map((token) => normalizeSkill(token))
    .filter(Boolean);

  return offerTags.filter((tag) => {
    const normalizedTag = normalizeSkill(tag);
    return tokens.some(
      (token) => token.includes(normalizedTag) || normalizedTag.includes(token)
    );
  });
}
