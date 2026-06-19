import { Heart } from "lucide-react";
import { IaSectionShell } from "../../stubs/IaSectionShell";
import type { Cabinet } from "@/types/cabinet";

interface Props { cabinet: Cabinet }

export function HealthHubPage(_: Props) {
  return (
    <IaSectionShell
      icon={<Heart className="w-6 h-6" />}
      title="Здоровʼя"
      question="Як я почуваюсь, що по чекапах і ризиках?"
      description="Медична картка, лікарі, аналізи, ліки, фізична та ментальна форма. Усі дані шифруються і ніколи не використовуються для AI-навчання."
      subTabs={[
        {
          id: "records", label: "Медкартка",
          question: "Які діагнози і висновки лікарів я маю?",
          description: "Хронологія діагнозів, виписок, висновків.",
          capabilities: [
            { label: "Діагнози", description: "Активні, хронічні, в анамнезі." },
            { label: "Виписки і висновки", description: "Сканкопії, OCR, AI-розпізнавання." },
          ],
        },
        {
          id: "doctors", label: "Лікарі",
          question: "Хто мої лікарі і як з ними звʼязатись?",
          description: "База лікарів з історією візитів та контактами.",
          capabilities: [
            { label: "Сімейний лікар і фахівці", description: "Спеціальність, клініка, контакти." },
            { label: "Рейтинг і нотатки", description: "Особисті враження від візитів." },
          ],
        },
        {
          id: "appointments", label: "Візити",
          question: "Які візити заплановані?",
          description: "Заплановані та минулі візити з нотатками.",
          capabilities: [
            { label: "Заплановані", description: "Дата, лікар, клініка, мета." },
            { label: "Історія візитів", description: "Висновки, призначення." },
          ],
        },
        {
          id: "analyses", label: "Аналізи",
          question: "Як змінюються мої показники у часі?",
          description: "Лабораторні аналізи з трендами по ключових маркерах.",
          capabilities: [
            { label: "Тренди показників", description: "Графіки за роками." },
            { label: "PDF з лабораторій", description: "Імпорт, OCR, парсинг." },
          ],
        },
        {
          id: "medications", label: "Ліки",
          question: "Що я приймаю зараз і за яким графіком?",
          description: "Активні препарати, нагадування, історія.",
          capabilities: [
            { label: "Активні препарати", description: "Дозування, графік, тривалість." },
            { label: "Нагадування", description: "Push у час прийому." },
          ],
        },
        {
          id: "insurance", label: "Страхування",
          question: "Яке у мене медичне покриття?",
          description: "Посилання на ДМС-поліси з модуля Страхування.",
          capabilities: [
            { label: "Поточні поліси", description: "Покриття, ліміти, мережа клінік." },
            { label: "Звернення", description: "Як скористатись полісом." },
          ],
        },
        {
          id: "fitness", label: "Фітнес",
          question: "Як моя фізична активність?",
          description: "Тренування, абонементи, цілі.",
          capabilities: [
            { label: "Активність", description: "Інтеграція з Apple Health / Google Fit." },
            { label: "Абонементи", description: "Спортзал, басейн, секції." },
          ],
        },
        {
          id: "mental", label: "Ментальне здоровʼя",
          question: "Як мій настрій і стрес?",
          description: "Терапія, медитація, моніторинг настрою.",
          capabilities: [
            { label: "Сесії з терапевтом", description: "Графік, нотатки." },
            { label: "Mood tracking", description: "Тренди настрою і тригерів." },
          ],
        },
        {
          id: "ai", label: "AI-асистент здоровʼя",
          question: "Що мені варто перевірити цього року?",
          description: "AI формує план чекапів за віком, статтю та анамнезом.",
          capabilities: [
            { label: "Рекомендовані обстеження", description: "Скринінги за віком і профілем." },
            { label: "Фактори ризику", description: "На що звернути увагу зараз." },
          ],
        },
      ]}
    />
  );
}

export default HealthHubPage;
