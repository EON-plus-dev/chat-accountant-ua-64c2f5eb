/**
 * Генерація юридичного тексту делегаційного договору між салоном і майстром.
 *
 * Source of truth — `SalonMasterDelegationContract.terms`. Цей файл лише
 * перетворює структуровані `terms` у людський preview для UI (демо).
 *
 * Реальні підписи — через `kep-sign` (див. mem://architecture/kep-signing-infrastructure-uk).
 */

import type {
  SalonMasterDelegationContract,
  SalonMasterTerms,
} from "@/config/demoCabinets/salonMasterDelegations";
import { salonMasters } from "@/config/demoCabinets/salonData";

const PERIOD_LABEL: Record<"shift" | "day" | "month", string> = {
  shift: "за зміну",
  day: "за робочий день",
  month: "за календарний місяць",
};

const PAYOUT_LABEL: Record<"per_visit" | "weekly" | "monthly", string> = {
  per_visit: "після кожного візиту клієнта",
  weekly: "щотижнево (понеділок)",
  monthly: "щомісячно (до 5-го числа)",
};

const NOSHOW_LABEL: Record<string, string> = {
  client_pays: "клієнт сплачує штраф за неявку згідно з публічними правилами салону",
  salon_pays: "ризик неявки клієнта несе салон — майстру компенсується фіксована мінімальна винагорода",
  master_pays: "ризик неявки клієнта несе майстер — оренда нараховується незалежно від факту візиту",
};

export interface ContractCopy {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
  permissionsTitle: string;
  permissions: string[];
}

export function buildContractCopy(c: SalonMasterDelegationContract): ContractCopy {
  const master = salonMasters.find((m) => m.id === c.masterId);
  const masterName = master?.fullName ?? c.masterId;

  const title =
    c.contract_kind === "employment"
      ? `Трудовий договір № ${c.contract_number}`
      : `Договір про надання послуг № ${c.contract_number}`;

  const subtitle =
    c.contract_kind === "employment"
      ? `Роботодавець — Салон краси «Beauty Lab». Працівник — ${masterName}.`
      : `Замовник — Салон краси «Beauty Lab». Виконавець (ФОП) — ${masterName}.`;

  const sections: ContractCopy["sections"] = [
    {
      heading: "1. Предмет договору",
      body: subjectCopy(c.terms, c.contract_kind),
    },
    {
      heading: "2. Умови винагороди",
      body: termsCopy(c.terms),
    },
    {
      heading: "3. Доступ до інформаційної системи",
      body: accessCopy(c),
    },
    {
      heading: "4. Відповідальність за неявку клієнта",
      body: noshowCopy(c.terms),
    },
    {
      heading: "5. Строк дії та підписання",
      body: termCopy(c),
    },
  ];

  const permissions = c.granted_permissions.map(permLabel);

  return {
    title,
    subtitle,
    sections,
    permissionsTitle: "Делеговані доступи в кабінеті салону",
    permissions,
  };
}

function subjectCopy(t: SalonMasterTerms, kind: "employment" | "services"): string {
  if (kind === "employment" && t.kind === "employment") {
    return `Працівник зобовʼязується виконувати обовʼязки на посаді «${t.position}» у приміщенні салону за погодженим графіком (${t.schedule ?? "змінний"}). Роботодавець надає робоче місце, обладнання та матеріали.`;
  }
  if (t.kind === "revenue_split") {
    return "Виконавець-ФОП надає клієнтам салону послуги відповідного профілю у приміщенні Замовника. Касир салону приймає оплату, веде касовий облік (ПРРО) і утримує частку Замовника.";
  }
  if (t.kind === "workspace_rental") {
    return "Замовник передає Виконавцю в строкове користування робоче місце для самостійного надання послуг власним клієнтам Виконавця. Розрахунки з клієнтом проводить Виконавець у власному ПРРО / на власний рахунок.";
  }
  return "Гібридна модель: за записами салону діє схема відсотка від чека (через касу салону); за прямими записами клієнтів Виконавця — модель оренди робочого місця.";
}

function termsCopy(t: SalonMasterTerms): string {
  switch (t.kind) {
    case "employment":
      return `Посадовий оклад — ${formatUah(t.salary_uah)}/міс. Робоче місце: ${(t.workstation_ids ?? []).join(", ") || "за графіком"}. Премії та доплати — згідно з внутрішнім положенням про оплату праці.`;
    case "revenue_split":
      return `Виконавцю належить ${t.commission_pct}% від суми чека за виконану послугу. Виплата — ${PAYOUT_LABEL[t.payout_period]}. Решта (${100 - t.commission_pct}%) утримується Замовником як винагорода за організацію клієнтського потоку, оренду місця, матеріали та облік.`;
    case "workspace_rental":
      return `Орендна плата — ${formatUah(t.rent_amount)} ${PERIOD_LABEL[t.rent_period]}. Робочі місця: ${t.workstation_ids.join(", ")}. Виконавець утримує 100% доходу від наданих ним послуг.`;
    case "hybrid":
      return `Комбінована модель: за салонними записами — комісія ${t.commission_pct}% Виконавцю; за прямими записами Виконавця — оренда ${formatUah(t.rent_amount)} ${PERIOD_LABEL[t.rent_period]}. Робочі місця: ${t.workstation_ids.join(", ")}.`;
  }
}

function accessCopy(c: SalonMasterDelegationContract): string {
  const payer =
    c.billing_payer === "cabinet_owner"
      ? "AI-операції майстра у робочому контексті оплачуються з гаманця Замовника"
      : "AI-операції майстра оплачуються з власного гаманця Виконавця";
  return `Замовник делегує Виконавцю обмежені доступи в Лoвable-кабінеті салону (див. перелік нижче). Доступи активні лише на час дії цього договору і миттєво відкликаються при його розірванні. ${payer}.`;
}

function noshowCopy(t: SalonMasterTerms): string {
  const policy =
    t.kind === "revenue_split" || t.kind === "workspace_rental" ? t.noshow_policy : undefined;
  if (!policy) return "Не врегульовано окремо — застосовуються загальні правила салону.";
  return NOSHOW_LABEL[policy] ?? "Не врегульовано окремо.";
}

function termCopy(c: SalonMasterDelegationContract): string {
  const from = new Date(c.valid_from).toLocaleDateString("uk-UA");
  const until = c.valid_until
    ? `до ${new Date(c.valid_until).toLocaleDateString("uk-UA")}`
    : "безстроково з правом одностороннього розірвання за 14 днів";
  const signed = c.signed_at
    ? `Підписано КЕП ${new Date(c.signed_at).toLocaleDateString("uk-UA")}.`
    : "Очікує підписання КЕП обох сторін.";
  return `Договір діє з ${from} ${until}. ${signed}`;
}

function permLabel(p: string): string {
  switch (p) {
    case "bookings:read_own":
      return "Перегляд власних записів у календарі салону";
    case "schedule:read_own":
      return "Перегляд власного графіку та змін";
    case "clients:read_during_visit":
      return "Контакт клієнта — лише на час візиту (підтягується з картки запису)";
    case "workstation:book":
      return "Самостійне бронювання робочого місця для власних клієнтів";
    case "invoices:read_own":
      return "Перегляд інвойсів за оренду робочого місця";
    default:
      return p;
  }
}

function formatUah(v: number): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(v);
}
