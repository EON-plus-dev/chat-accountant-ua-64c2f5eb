import { INSTITUTION_PROFILES, type FullInstitutionProfile } from '../data/institutionProfiles';
import { CATALOG_CATEGORIES, type CatalogCategory } from '../data/catalog';
import { LAWS, type LawEntry } from '../data/laws';
import { GRANTS, type GrantEntry } from '../data/grants';
import { KVED_ENTRIES, type KvedEntry } from '../data/kved';

const DAY_NAMES_UK = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', "п'ятниця", 'субота'];

// ── Utilities ──

function getCurrentDaySchedule(workingHours: { weekdays?: string; saturday?: string; sunday?: string; lunch?: string }, is247?: boolean): string {
  if (is247) return '✅ Працює цілодобово';
  const day = new Date().getDay();
  if (day === 0) return workingHours.sunday ? `Неділя: ${workingHours.sunday}` : '🔴 Сьогодні — вихідний (неділя)';
  if (day === 6) return workingHours.saturday ? `Субота: ${workingHours.saturday}` : '🔴 Сьогодні — вихідний (субота)';
  return workingHours.weekdays ? `Сьогодні: ${workingHours.weekdays}${workingHours.lunch ? ` (обід ${workingHours.lunch})` : ''}` : 'Графік невідомий';
}

// ── Institutions ──

function buildInstitutionKB(profiles: FullInstitutionProfile[]): string {
  return profiles
    .filter(p => p.documentChecklists?.length || p.onlineServices?.length || p.commonMistakes?.length)
    .map(p => {
      const lines: string[] = [`### ${p.name} (${p.legalName})`];
      lines.push(`Оцінка FINTODO: ${p.ratings.fintodo.overall}/100`);

      // Support
      const s = p.contacts.support;
      if (s.is247) lines.push('Підтримка: цілодобово');
      else if (s.workingHours) lines.push(`Підтримка: ${s.workingHours}`);
      if (s.freePhone) lines.push(`Телефон: ${s.freePhone}`);

      // Branches
      if (p.branches.totalCount === 0) {
        lines.push('Відділень немає — повністю онлайн');
      } else {
        lines.push(`Відділення: ${p.branches.totalCount}+ по Україні`);
        const branch = p.branches.branchList[0];
        if (branch) {
          const schedule = getCurrentDaySchedule(branch.workingHours);
          lines.push(`Графік відділень: пн-пт ${branch.workingHours.weekdays || '?'}${branch.workingHours.saturday ? `, сб ${branch.workingHours.saturday}` : ''}`);
          lines.push(schedule);
          if (branch.address) lines.push(`📍 ${branch.name}: ${branch.address}`);
        }
      }

      // Checklists
      if (p.documentChecklists?.length) {
        for (const c of p.documentChecklists) {
          const docs = c.requiredDocs.filter(d => !d.isOptional).map(d => d.name + (d.note ? ` (${d.note})` : '')).join(' + ');
          const online = c.canDoOnline ? `онлайн${c.onlineUrl ? ` ${c.onlineUrl}` : ''}` : 'ТІЛЬКИ офлайн';
          lines.push(`- ${c.scenario} [${c.forAudience}]: ${docs || 'без документів'} → ${c.timeToComplete}, ${online}`);
          for (const w of c.warnings) lines.push(`  ⚠️ ${w}`);
          for (const t of c.tips) lines.push(`  💡 ${t}`);
        }
      }

      // Online / Offline
      if (p.onlineServices?.length) lines.push(`Онлайн: ${p.onlineServices.join(', ')}`);
      if (p.offlineRequirements?.length) lines.push(`Тільки офлайн: ${p.offlineRequirements.join(', ')}`);

      // Mistakes
      if (p.commonMistakes?.length) {
        for (const m of p.commonMistakes) lines.push(`⚠️ ${m}`);
      }

      // Links
      if (p.aiUsefulLinks?.length) {
        const internal = p.aiUsefulLinks.filter(l => l.isInternal);
        if (internal.length) lines.push(internal.map(l => `[${l.label}](${l.url})`).join(' | '));
      }

      return lines.join('\n');
    }).join('\n\n');
}

// ── Catalog ──

function buildCatalogKB(categories: CatalogCategory[]): string {
  return categories.flatMap(cat =>
    cat.types.map(t =>
      `[${t.name}] Коли: ${t.whenYouNeedIt.slice(0, 3).join(' | ')} | Підготувати: ${t.whatToPrepare.slice(0, 3).join(', ')}${t.legalBasis ? ` | Основа: ${t.legalBasis}` : ''} | /dovidnyky/${cat.slug}/${t.slug}`
    )
  ).join('\n');
}

// ── Laws ──

function buildLawsKB(laws: LawEntry[]): string {
  return laws.map(l =>
    `[${l.shortName}] ${l.fullName}\nНорми: ${l.keyPoints.slice(0, 3).join(' | ')}\nЗміни: ${l.recentChanges.slice(0, 2).map(c => `${c.date}: ${c.change}`).join(' | ')}\n/dovidnyky/zakony/${l.slug} | ${l.officialUrl}`
  ).join('\n\n');
}

// ── Grants ──

function buildGrantsKB(grants: GrantEntry[]): string {
  const active = grants.filter(g => g.isOpen && g.status === 'active');
  if (!active.length) return 'Наразі немає активних грантів.';
  return active.map(g =>
    `[${g.name}] від ${g.organization}\nСума: ${g.amount}${g.amountNote ? ` (${g.amountNote})` : ''} | Дедлайн: ${g.deadline}\nВимоги: ${g.requirements.slice(0, 3).join(' | ')}\nКроки: ${g.steps.slice(0, 3).join(' → ')}\nДокументи: ${g.documents.join(', ')}\n/dovidnyky/granty/${g.slug} | ${g.applicationUrl || g.websiteUrl}`
  ).join('\n\n');
}

// ── KVED ──

function buildKvedKB(entries: KvedEntry[]): string {
  return entries.map(k =>
    `[КВЕД ${k.code}] ${k.name} | Групи ФОП: ${k.fopGroups.join(',')} | ${k.requiresLicense ? `Ліцензія: ${k.licenseInfo || 'ПОТРІБНА'}` : 'Без ліцензії'} | ${k.taxNotes}`
  ).join('\n');
}

// ── Main export ──

export function buildFullKnowledgeBase(): string {
  const now = new Date();
  const dayName = DAY_NAMES_UK[now.getDay()];
  const dateStr = now.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  return `## БАЗА ЗНАНЬ FINTODO
Дата: ${dayName}, ${dateStr}, ${timeStr}

### УСТАНОВИ І СЕРВІСИ
${buildInstitutionKB(INSTITUTION_PROFILES)}

### ТИПИ УСТАНОВ — КОЛИ ЗВЕРТАТИСЬ
${buildCatalogKB(CATALOG_CATEGORIES)}

### ЗАКОНОДАВСТВО
${buildLawsKB(LAWS)}

### АКТИВНІ ГРАНТИ
${buildGrantsKB(GRANTS)}

### КВЕД
${buildKvedKB(KVED_ENTRIES)}
`;
}
