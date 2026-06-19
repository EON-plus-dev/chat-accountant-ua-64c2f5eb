import { Shield } from "lucide-react";
import { IaSectionShell } from "../../stubs/IaSectionShell";
import type { Cabinet } from "@/types/cabinet";

interface Props { cabinet: Cabinet }

export function InsuranceHubPage(_: Props) {
  return (
    <IaSectionShell
      icon={<Shield className="w-6 h-6" />}
      title="Страхування"
      question="Які мої поліси, що скоро завершуються і де прогалини?"
      description="Єдиний реєстр страхових полісів усіх типів: життя, здоровʼя, авто, нерухомість, подорожі. AI нагадує про продовження, аналізує покриття і пропонує оптимізацію."
      subTabs={[
        {
          id: "policies", label: "Поліси",
          question: "Які поліси у мене активні?",
          description: "Зведений перелік усіх активних полісів з ключовими параметрами.",
          capabilities: [
            { label: "Активні поліси", description: "Тип, страховик, сума покриття, період." },
            { label: "Чернетки та архів", description: "Запропоновані офери, минулі поліси." },
          ],
        },
        {
          id: "health", label: "Здоровʼя",
          question: "Як застраховане моє здоровʼя та родина?",
          description: "Медичне страхування, ДМС, асистанс, корпоративні програми.",
          capabilities: [
            { label: "ДМС поліси", description: "Покриття, ліміти, мережа клінік." },
            { label: "Члени родини", description: "Хто застрахований, до якого віку." },
          ],
        },
        {
          id: "property", label: "Нерухомість",
          question: "Що з захистом моїх квартири/будинку?",
          description: "Страхування нерухомості, відповідальність перед сусідами, іпотечні поліси.",
          capabilities: [
            { label: "Обʼєкти", description: "Квартира, будинок, дача, комерційна нерухомість." },
            { label: "Ризики", description: "Пожежа, залиття, крадіжка, стихії." },
          ],
        },
        {
          id: "vehicle", label: "Авто",
          question: "Як застраховані мої транспортні засоби?",
          description: "ОСЦПВ, КАСКО, GreenCard, додаткові опції.",
          capabilities: [
            { label: "ОСЦПВ і КАСКО", description: "По кожному ТЗ із датою завершення." },
            { label: "GreenCard", description: "Для виїзду за кордон." },
          ],
        },
        {
          id: "travel", label: "Подорожі",
          question: "Чи покриті мої майбутні поїздки?",
          description: "Туристичне страхування, активний відпочинок, спорт.",
          capabilities: [
            { label: "Активні поліси", description: "Країни, дати, сума покриття." },
            { label: "AI-підбір під поїздку", description: "За напрямком, активностями, віком." },
          ],
        },
        {
          id: "claims", label: "Страхові випадки",
          question: "Які виплати в роботі і які я отримав?",
          description: "Реєстрація та відстеження страхових випадків і виплат.",
          capabilities: [
            { label: "Активні випадки", description: "Статус, документи, контактна особа." },
            { label: "Історія виплат", description: "Сумарно по роках і типах." },
          ],
        },
        {
          id: "renewals", label: "Продовження",
          question: "Що скоро завершується?",
          description: "Дедлайни продовження з AI-нагадуваннями.",
          capabilities: [
            { label: "Графік 90/30/14/3 днів", description: "Автоматичні нагадування." },
            { label: "Швидке продовження", description: "В один клік через партнерів." },
          ],
        },
        {
          id: "ai", label: "AI-рекомендації",
          question: "Чого мені бракує і що оптимізувати?",
          description: "AI порівнює профіль з типовим покриттям і підсвічує прогалини.",
          capabilities: [
            { label: "Прогалини покриття", description: "Незастраховані активи, ризики." },
            { label: "Оптимізація вартості", description: "Альтернативні пропозиції з ринку." },
          ],
        },
      ]}
    />
  );
}

export default InsuranceHubPage;
