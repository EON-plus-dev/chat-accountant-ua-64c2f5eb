/**
 * actionExecutor — виконання `propose_action` від AI.
 *
 * Підтримує 5 типів дій:
 * - reminder / calendar_event → user_events + user_reminders (in-app)
 * - payment_slip → поки що тільки створює нагадування про платіж (повна платіжка — окремий flow)
 * - tax_report → нагадування про звіт
 * - expense_log → нагадування про логування
 *
 * Повертає { ok, message } для toast.
 */
import { supabase } from "@/integrations/supabase/client";
import type { ProposeActionArgs } from "./aiToolSchemas";

export interface ExecuteResult {
  ok: boolean;
  message: string;
  eventId?: string;
}

const TITLE_PREFIX: Record<ProposeActionArgs["type"], string> = {
  payment_slip: "💳 Платіж",
  reminder: "🔔",
  calendar_event: "📅",
  tax_report: "📄 Звіт",
  expense_log: "🧾 Витрата",
};

/**
 * Виконати дію, запропоновану AI. Створює user_event + reminder в БД.
 */
export async function executeProposedAction(
  action: ProposeActionArgs,
  cabinetId: string
): Promise<ExecuteResult> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) {
    return { ok: false, message: "Потрібен вхід для створення дії" };
  }

  // Визначаємо коли подія має статись
  const eventAt = action.dueDate
    ? new Date(action.dueDate)
    : new Date(Date.now() + 24 * 60 * 60 * 1000); // за замовчуванням +1 день

  // Перевірка валідності дати
  if (Number.isNaN(eventAt.getTime())) {
    return { ok: false, message: "Невалідна дата дії" };
  }

  // Формуємо title з префіксом для зручної ідентифікації в календарі
  const prefix = TITLE_PREFIX[action.type] ?? "";
  const title = prefix ? `${prefix} ${action.title}`.trim() : action.title;

  // Опис — додаємо суму, якщо вказана
  const descParts: string[] = [];
  if (action.description) descParts.push(action.description);
  if (action.amount !== undefined) {
    descParts.push(`Сума: ${action.amount.toLocaleString("uk-UA")} ₴`);
  }
  const description = descParts.join(" • ") || null;

  // Створення події
  const { data: created, error: evErr } = await supabase
    .from("user_events")
    .insert({
      user_id: uid,
      cabinet_id: cabinetId,
      title,
      description,
      event_at: eventAt.toISOString(),
      source: "ai" as const,
    })
    .select()
    .single();

  if (evErr || !created) {
    console.error("executeProposedAction insert event:", evErr);
    return { ok: false, message: "Не вдалося створити подію" };
  }

  // Розклад нагадувань — за день і в день події (якщо вони ще в майбутньому)
  const now = Date.now();
  const eventTime = eventAt.getTime();
  const remindersToInsert = [
    { offsetDays: 1 },
    { offsetDays: 0 },
  ]
    .map(({ offsetDays }) => ({
      event_id: created.id,
      user_id: uid,
      remind_at: new Date(eventTime - offsetDays * 86_400_000).toISOString(),
      channel: "in-app" as const,
    }))
    .filter((r) => new Date(r.remind_at).getTime() > now);

  if (remindersToInsert.length > 0) {
    await supabase.from("user_reminders").insert(remindersToInsert);
  }

  const dateStr = eventAt.toLocaleDateString("uk-UA");
  return {
    ok: true,
    eventId: created.id,
    message: `Створено: ${action.title} • ${dateStr}`,
  };
}
