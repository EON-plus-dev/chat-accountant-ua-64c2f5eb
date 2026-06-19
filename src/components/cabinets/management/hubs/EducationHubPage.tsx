import { GraduationCap } from "lucide-react";
import { IaSectionShell } from "../../stubs/IaSectionShell";
import type { Cabinet } from "@/types/cabinet";

interface Props { cabinet: Cabinet }

export function EducationHubPage(_: Props) {
  return (
    <IaSectionShell
      icon={<GraduationCap className="w-6 h-6" />}
      title="Освіта"
      question="Чого я навчаюсь, що попереду і як рости швидше?"
      description="Освітні програми, курси, завдання, сертифікати та персональний навчальний план. Освітні організації можуть мати власні кабінети — ви отримуєте розклад, завдання та документи безпосередньо."
      subTabs={[
        {
          id: "programs", label: "Програми",
          question: "У які навчальні програми я зарахований?",
          description: "Довгострокові програми (магістратура, MBA, bootcamp).",
          capabilities: [
            { label: "Активні програми", description: "Організація, спеціальність, період." },
            { label: "Завершені", description: "Архів програм з документами." },
          ],
        },
        {
          id: "courses", label: "Курси",
          question: "Які курси я зараз проходжу?",
          description: "Короткі курси з прогресом та дедлайнами.",
          capabilities: [
            { label: "Активні курси", description: "Прогрес, найближчі модулі." },
            { label: "Бажані / wishlist", description: "Курси, які планую купити." },
          ],
        },
        {
          id: "assignments", label: "Завдання",
          question: "Що мені треба здати?",
          description: "Завдання від усіх освітніх організацій в одному списку.",
          capabilities: [
            { label: "Дедлайни", description: "Сортовано за датою." },
            { label: "Здані / на оцінюванні", description: "Статус по кожному." },
          ],
        },
        {
          id: "certificates", label: "Сертифікати",
          question: "Що я підтвердив документально?",
          description: "Отримані сертифікати, дипломи, акредитації.",
          capabilities: [
            { label: "Активні сертифікати", description: "Видавник, дата, термін дії." },
            { label: "Експорт у CV", description: "Виділити для резюме / LinkedIn." },
          ],
        },
        {
          id: "grades", label: "Оцінки",
          question: "Які мої академічні результати?",
          description: "Оцінки по курсах та програмах.",
          capabilities: [
            { label: "Поточний семестр", description: "GPA, оцінки за модулі." },
            { label: "Транскрипт", description: "Усі оцінки за весь час." },
          ],
        },
        {
          id: "schedule", label: "Розклад",
          question: "Які заняття у мене сьогодні / цього тижня?",
          description: "Webinars, mentor-sessions, лекції від усіх організацій.",
          capabilities: [
            { label: "Тиждень / місяць", description: "Календарний вигляд." },
            { label: "Інтеграція з Подіями", description: "Уроки відображаються у Календарі." },
          ],
        },
        {
          id: "skills", label: "Навички",
          question: "Які навички я підтвердив і чого ще не вистачає?",
          description: "Skill map: поточний рівень vs цільовий.",
          capabilities: [
            { label: "Soft / Hard skills", description: "Рівень, підтвердження курсами/сертифікатами." },
            { label: "Цільовий профіль", description: "Що потрібно для наступної ролі." },
          ],
        },
        {
          id: "ai", label: "AI-наставник",
          question: "Що навчати далі, щоб дійти до цілі?",
          description: "AI формує план з огляду на карʼєру, ринок і ваш темп.",
          capabilities: [
            { label: "Рекомендовані курси", description: "Під цілі та поточні навички." },
            { label: "Бюджет і час", description: "Скільки ресурсів потрібно." },
          ],
        },
      ]}
    />
  );
}

export default EducationHubPage;
