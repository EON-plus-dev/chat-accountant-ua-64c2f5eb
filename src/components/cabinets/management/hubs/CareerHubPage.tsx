import { Briefcase } from "lucide-react";
import { IaSectionShell } from "../../stubs/IaSectionShell";
import type { Cabinet } from "@/types/cabinet";

interface Props { cabinet: Cabinet }

export function CareerHubPage(_: Props) {
  return (
    <IaSectionShell
      icon={<Briefcase className="w-6 h-6" />}
      title="Карʼєра"
      question="Де я в карʼєрі та куди рухаюся далі?"
      description="Поточні робочі контракти, відкриті можливості, цілі по доходу та грейду. Організації можуть публікувати вакансії напряму в платформу — ви бачите підбірку під свій профіль."
      subTabs={[
        {
          id: "vacancies", label: "Вакансії",
          question: "Які пропозиції мені підходять?",
          description: "AI-підбір вакансій від організацій з мережі.",
          capabilities: [
            { label: "Активні вакансії", description: "Метч за навичками та цілями." },
            { label: "Збережені", description: "Вакансії, до яких хочу повернутись." },
          ],
        },
        {
          id: "applications", label: "Відгуки",
          question: "На що я відгукнувся і що в роботі?",
          description: "Pipeline відгуків з усіма стадіями.",
          capabilities: [
            { label: "По стадіях", description: "Надіслано, на розгляді, відмова, оффер." },
            { label: "Архів", description: "Завершені відгуки з висновками." },
          ],
        },
        {
          id: "interviews", label: "Співбесіди",
          question: "Які співбесіди заплановані?",
          description: "Календар співбесід та нотатки після них.",
          capabilities: [
            { label: "Заплановані", description: "Дата, формат, інтервʼюер." },
            { label: "Нотатки", description: "Питання, відповіді, висновки." },
          ],
        },
        {
          id: "resume", label: "Резюме",
          question: "Яке моє актуальне резюме?",
          description: "Версіонована база резюме з AI-адаптацією під вакансію.",
          capabilities: [
            { label: "Версії резюме", description: "Master + варіанти під ролі." },
            { label: "AI-генератор cover letter", description: "Під конкретну вакансію." },
          ],
        },
        {
          id: "portfolio", label: "Портфоліо",
          question: "Що показати роботодавцю?",
          description: "Проєкти, кейси, рекомендації.",
          capabilities: [
            { label: "Проєкти", description: "Опис, роль, результат, артефакти." },
            { label: "Рекомендації", description: "Від колег і керівників." },
          ],
        },
        {
          id: "plan", label: "Карʼєрний план",
          question: "Куди я хочу прийти за 1–3 роки?",
          description: "Цілі по грейду, доходу, ролі. План дій від AI.",
          capabilities: [
            { label: "Цілі та KPI", description: "Дохід, грейд, область, географія." },
            { label: "Дії на квартал", description: "Конкретні кроки." },
          ],
        },
        {
          id: "skills", label: "Навички",
          question: "Які мої сильні сторони і прогалини?",
          description: "Skill map, синхронізована з модулем Освіта.",
          capabilities: [
            { label: "Поточний рівень", description: "Soft + hard skills." },
            { label: "Що качати", description: "З огляду на ринок і цілі." },
          ],
        },
        {
          id: "ai", label: "AI-коуч",
          question: "Що зробити цього тижня для росту?",
          description: "AI аналізує ваш профіль і дає тижневі поради.",
          capabilities: [
            { label: "Поради тижня", description: "3–5 конкретних дій." },
            { label: "Бенчмарк ринку", description: "Як ваша компенсація відносно ринку." },
          ],
        },
      ]}
    />
  );
}

export default CareerHubPage;
