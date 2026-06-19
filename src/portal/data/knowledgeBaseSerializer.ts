import { INSTITUTION_PROFILES } from './institutionProfiles';

const DAY_NAMES_UK = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', "п'ятниця", 'субота'];

function formatWorkingHours(profile: typeof INSTITUTION_PROFILES[0]): string {
  const support = profile.contacts.support;
  if (support.is247) return 'Підтримка: цілодобово';

  return `Підтримка: ${support.workingHours}`;
}

function formatChecklists(checklists: NonNullable<typeof INSTITUTION_PROFILES[0]['documentChecklists']>): string {
  return checklists.map(c => {
    const docs = c.requiredDocs
      .filter(d => !d.isOptional)
      .map(d => d.name + (d.note ? ` (${d.note})` : ''))
      .join(' + ');
    const online = c.canDoOnline ? 'онлайн' : 'ТІЛЬКИ офлайн';
    const warns = c.warnings.length ? c.warnings.map(w => `  ⚠️ ${w}`).join('\n') : '';
    return `- ${c.scenario} [${c.forAudience}]: ${docs || 'без документів'} → ${c.timeToComplete}, ${online}${warns ? '\n' + warns : ''}`;
  }).join('\n');
}

export function serializeKnowledgeBase(): string {
  const now = new Date();
  const dayName = DAY_NAMES_UK[now.getDay()];
  const dateStr = now.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

  const sections: string[] = [
    `## БАЗА ЗНАНЬ ПОРТАЛУ FINTODO`,
    `Сьогодні: ${dayName}, ${dateStr}`,
    '',
  ];

  for (const p of INSTITUTION_PROFILES) {
    // Skip profiles without KB data
    if (!p.documentChecklists?.length && !p.onlineServices?.length && !p.commonMistakes?.length) continue;

    const lines: string[] = [`### ${p.name}`];

    // Support hours
    lines.push(formatWorkingHours(p));
    if (p.contacts.support.freePhone) lines.push(`Телефон: ${p.contacts.support.freePhone}`);

    // Branches summary
    if (p.branches.totalCount === 0) {
      lines.push('Відділень немає — повністю онлайн');
    } else {
      lines.push(`Відділення: ${p.branches.totalCount}+ по Україні`);
      const branch = p.branches.branchList[0];
      if (branch) {
        lines.push(`Графік відділень: пн-пт ${branch.workingHours.weekdays}${branch.workingHours.saturday ? `, сб ${branch.workingHours.saturday}` : ''}`);
      }
    }

    // Checklists
    if (p.documentChecklists?.length) {
      lines.push(formatChecklists(p.documentChecklists));
    }

    // Online services
    if (p.onlineServices?.length) {
      lines.push(`Онлайн: ${p.onlineServices.join(', ')}`);
    }

    // Common mistakes
    if (p.commonMistakes?.length) {
      for (const m of p.commonMistakes) {
        lines.push(`⚠️ ${m}`);
      }
    }

    // Links
    if (p.aiUsefulLinks?.length) {
      const internalLinks = p.aiUsefulLinks.filter(l => l.isInternal);
      if (internalLinks.length) {
        lines.push(internalLinks.map(l => `[${l.label}](${l.url})`).join(' | '));
      }
    }

    sections.push(lines.join('\n'));
    sections.push('');
  }

  return sections.join('\n');
}
