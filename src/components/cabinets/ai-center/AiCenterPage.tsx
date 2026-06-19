import { Bot } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { IaSectionShell } from "../stubs/IaSectionShell";
import { PersonalAgentsGrid } from "./PersonalAgentsGrid";

interface Props {
  cabinet: Cabinet;
  defaultInner?: string;
  onNavigateToSettings?: (subTab?: string) => void;
}

export default function AiCenterPage({ cabinet, defaultInner, onNavigateToSettings }: Props) {
  const aiSettings = { label: "Параметри AI →", onClick: () => onNavigateToSettings?.("ai-settings") };
  return (
    <IaSectionShell
      icon={<Bot className="w-6 h-6" />}
      title="AI-центр"
      question="Що AI робить для мене?"
      description="Прозорість і контроль над усіма AI-агентами, що працюють у вашому кабінеті — Personal Assistant, Budget, Savings, Health, Family."
      defaultSubTab={defaultInner}
      subTabs={[
        {
          id: "agents",
          label: "Агенти",
          question: "Які AI працюють на мене?",
          description: "5 спеціалізованих агентів з власною компетенцією і межами повноважень.",
          capabilities: [],
          ready: true,
          renderContent: () => (
            <PersonalAgentsGrid cabinetId={cabinet.id} onConfigure={() => onNavigateToSettings?.("ai-settings")} />
          ),
          footerLink: aiSettings,
        },
        {
          id: "workflows",
          label: "Workflow",
          question: "Які процеси автоматизовано?",
          description: "Активні ProcessTemplate з тригерами та кроками. Усе йде через єдиний workflow-engine.",
          capabilities: [
            { label: "Підготовка декларації", description: "Збір документів, валідація, чернетка для підпису." },
            { label: "Оформлення страховки", description: "Збір даних, порівняння, оплата." },
            { label: "Планування подорожі", description: "Документи, страховка, бронювання, бюджет." },
            { label: "Створити свій", description: "Конструктор з тригерами і кроками." },
          ],
          footerLink: aiSettings,
        },
        {
          id: "rules",
          label: "Правила",
          question: "Які межі дій AI?",
          description: "IF → THEN: auto-sign rules, бюджетні ліміти, conditional actions, nudges.",
          capabilities: [
            { label: "Auto-sign", description: "Що AI підписує без вас (з reviewer)." },
            { label: "Ліміти платежів", description: "Понадлімітні платежі — на ваше підтвердження." },
            { label: "Якщо баланс < 20 000 ₴", description: "Попередити мене заздалегідь." },
            { label: "Nudges", description: "Коли AI має нагадувати, а коли — мовчати." },
          ],
          footerLink: aiSettings,
        },
        {
          id: "auto-actions",
          label: "Автоматичні дії",
          question: "Що AI зробив без мене?",
          description: "Хронологія auto-dій з можливістю відкату — повна прозорість того, що сталося.",
          capabilities: [
            { label: "Сьогодні", description: "Дії за останні 24 год." },
            { label: "За тиждень", description: "Огляд + AI-summary найважливішого." },
            { label: "Відкат", description: "Скасувати дію, якщо це ще можливо." },
            { label: "Експорт", description: "PDF-звіт для бухгалтера." },
          ],
          footerLink: aiSettings,
        },
        {
          id: "monitoring",
          label: "Моніторинг",
          question: "Чи все в порядку з AI?",
          description: "Аномалії, спроби виходу за межі дозволів, помилки моделей, перевитрата кредитів.",
          capabilities: [
            { label: "Аномалії", description: "Незвичні дії або patterns." },
            { label: "Перевитрата кредитів", description: "Сповіщення при наближенні до ліміту." },
            { label: "Помилки моделей", description: "Що впало і чому." },
            { label: "Безпека", description: "Спроби несанкціонованого доступу." },
          ],
          footerLink: aiSettings,
        },
        {
          id: "recommendations",
          label: "Рекомендації",
          question: "Що AI пропонує?",
          description: "Персональні поради з фінансів, здоров'я, покупок, підписок і подорожей.",
          capabilities: [
            { label: "Фінанси", description: "Куди перевести депозит, що скоротити." },
            { label: "Здоров'я", description: "Час планового візиту, продовжити поліс." },
            { label: "Магазин", description: "Знайшли дешевше у партнера." },
            { label: "Подорожі", description: "Найкращий час для перельоту й готелю." },
          ],
          footerLink: aiSettings,
        },
        {
          id: "safe-mode",
          label: "Safe Mode",
          question: "Як швидко зупинити все?",
          description: "Одна кнопка «Зупини всіх AI-агентів» з повним аудит-логом і м'яким перезапуском.",
          capabilities: [
            { label: "Зупинити все", description: "Pause усіх workflow-інстансів." },
            { label: "Зупинити вибіркові", description: "Тільки конкретного агента або правило." },
            { label: "Аудит-лог", description: "Що було зупинено, ким, коли." },
            { label: "Поступовий запуск", description: "Включення з підтвердженням кожного кроку." },
          ],
          footerLink: aiSettings,
        },
      ]}
      currentLocations={[
        { label: "Налаштування → AI-налаштування", onClick: () => onNavigateToSettings?.("ai-settings") },
      ]}
    />
  );
}
