import { House } from "lucide-react";
import { IaSectionShell } from "../../stubs/IaSectionShell";
import type { Cabinet } from "@/types/cabinet";

interface Props { cabinet: Cabinet }

export function HomeHubPage(_: Props) {
  return (
    <IaSectionShell
      icon={<House className="w-6 h-6" />}
      title="Дім"
      question="Що в мене з домом — комуналка, ремонти, контракти?"
      description="Обʼєкти, регулярні платежі, лічильники, ремонти, побутові сервіси. AI відстежує аномалії у споживанні та нагадує про планові роботи."
      subTabs={[
        {
          id: "properties", label: "Обʼєкти",
          question: "Які приміщення я веду?",
          description: "Квартири, будинки, орендовані приміщення.",
          capabilities: [
            { label: "Власні і орендовані", description: "Адреса, площа, статус." },
            { label: "Мешканці", description: "Хто проживає / здається." },
          ],
        },
        {
          id: "utilities", label: "Комуналка",
          question: "Скільки я плачу за комуналку?",
          description: "Регулярні платежі дому з трендами витрат.",
          capabilities: [
            { label: "Платежі по постачальниках", description: "Світло, газ, вода, тепло, ОСББ." },
            { label: "Аналітика", description: "Тренди, прогноз на рік." },
          ],
        },
        {
          id: "repairs", label: "Ремонти",
          question: "Які ремонти у роботі?",
          description: "Активні ремонти з етапами, бюджетом, підрядниками.",
          capabilities: [
            { label: "Активні проєкти", description: "Етапи, бюджет, дедлайни." },
            { label: "Архів", description: "Завершені ремонти з документами." },
          ],
        },
        {
          id: "maintenance", label: "Обслуговування",
          question: "Що потрібно перевіряти регулярно?",
          description: "Планові роботи: ТО котла, сигналізація, прибирання.",
          capabilities: [
            { label: "Графік ТО", description: "Котел, кондиціонер, ліфт." },
            { label: "Підрядники", description: "Хто виконував, гарантії." },
          ],
        },
        {
          id: "payments", label: "Платежі",
          question: "Усі платежі по дому в одному місці",
          description: "Зведений ledger платежів дому з модулем Фінанси.",
          capabilities: [
            { label: "Цей місяць", description: "Що оплачено, що в черзі." },
            { label: "Автоплатежі", description: "Які активні та коли спишуть." },
          ],
        },
        {
          id: "meters", label: "Лічильники",
          question: "Які мої показники?",
          description: "Передача показників, історія.",
          capabilities: [
            { label: "Поточні показники", description: "По кожному лічильнику." },
            { label: "Аномалії", description: "AI виявляє витоки / стрибки." },
          ],
        },
        {
          id: "services", label: "Побутові сервіси",
          question: "Які регулярні сервіси я використовую?",
          description: "Прибирання, доставка води, інтернет, охорона.",
          capabilities: [
            { label: "Активні контракти", description: "Постачальник, періодичність, вартість." },
            { label: "Замовлення на разово", description: "Через модуль Замовлення." },
          ],
        },
        {
          id: "documents", label: "Документи",
          question: "Де всі документи на дім?",
          description: "Свідоцтва, договори, акти, технічна документація.",
          capabilities: [
            { label: "Правовстановлюючі", description: "Витяги з реєстру, договори." },
            { label: "Технічні", description: "Технічні паспорти, плани." },
          ],
        },
        {
          id: "ai", label: "AI-асистент дому",
          question: "Що оптимізувати у витратах на дім?",
          description: "AI аналізує платежі і пропонує економію.",
          capabilities: [
            { label: "Економія на тарифах", description: "Альтернативи у постачальників." },
            { label: "Нагадування про ТО", description: "За графіком виробника." },
          ],
        },
      ]}
    />
  );
}

export default HomeHubPage;
