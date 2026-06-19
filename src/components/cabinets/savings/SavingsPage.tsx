import { PiggyBank } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { IaSectionShell } from "../stubs/IaSectionShell";
import { PersonalGoalsList } from "./PersonalGoalsList";
import { InvestmentPortfolioPage } from "../investments";
import PropertyRegistryInner from "./PropertyRegistryInner";

interface Props {
  cabinet: Cabinet;
  defaultInner?: string;
  onNavigateToOperations?: (subTab?: string) => void;
  onGoToRegistry?: () => void;
}

export default function SavingsPage({ cabinet, defaultInner, onNavigateToOperations, onGoToRegistry }: Props) {
  return (
    <IaSectionShell
      icon={<PiggyBank className="w-6 h-6" />}
      title="Заощадження"
      question="Як я рухаюсь до своїх цілей?"
      description="Цілі, резервний фонд, інвестиції, пенсія, дитячі накопичення і майно як актив — єдина картина руху до фінансової свободи."
      defaultSubTab={defaultInner}
      subTabs={[
        {
          id: "goals",
          label: "Цілі",
          question: "Що я хочу досягти?",
          description: "Особисті фінансові цілі з прогресом і AI-планом досягнення.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalGoalsList cabinetId={cabinet.id} />,
        },
        {
          id: "reserve",
          label: "Резервний фонд",
          question: "На скільки місяців у мене подушка?",
          description: "Безпечний поріг = 6 міс. ваших витрат. Зараз покриває 3,2 міс. — нижче норми.",
          capabilities: [
            { label: "Поточний резерв", description: "95 000 ₴ — на 3 короткі місяці." },
            { label: "Цільовий резерв", description: "180 000 ₴ для 6 міс. безпеки." },
            { label: "Авто-поповнення", description: "Налаштувати щотижневе списання на резерв." },
            { label: "Депозит/накопичувальна", description: "Де тримати, щоб не з'їдала інфляція." },
          ],
        },
        {
          id: "investments",
          label: "Інвестиції",
          question: "Як працює мій портфель?",
          description: "Акції, ETF, крипто з multi-lot FIFO P&L і ROC-коректуванням бази.",
          capabilities: [],
          ready: true,
          renderContent: () => <InvestmentPortfolioPage cabinet={cabinet} />,
        },
        {
          id: "property",
          label: "Майно як актив",
          question: "Яке в мене майно і скільки воно коштує?",
          description: "Нерухомість, авто, ділянки — як частина капіталу і джерело податкових подій.",
          capabilities: [],
          ready: true,
          renderContent: () => <PropertyRegistryInner onGoToRegistry={onGoToRegistry} />,
          footerLink: { label: "Перейти до реєстру майна →", onClick: () => onNavigateToOperations?.("property") },
        },
        {
          id: "pension",
          label: "Пенсійний капітал",
          question: "Що буде на пенсії?",
          description: "Прогноз пенсії з урахуванням ЄСВ, недержавних фондів і власних накопичень.",
          capabilities: [
            { label: "Прогноз ПФУ", description: "Очікувана державна пенсія за стажем." },
            { label: "Недержавні фонди", description: "Внески, дохідність, прогноз." },
            { label: "Власний капітал", description: "Інвестиційний портфель як пенсійний." },
            { label: "Цільовий вік", description: "Коли я можу не працювати." },
          ],
        },
        {
          id: "children",
          label: "Дитячі накопичення",
          question: "Що я відкладаю дітям?",
          description: "Освіта, перше житло, стартовий капітал — окремий бюджет з power of compounding.",
          capabilities: [
            { label: "Освіта Софії", description: "250 000 ₴ до 2030 — виконано 15%." },
            { label: "Освіта Артема", description: "Запланувати ціль для другої дитини." },
            { label: "Стартовий капітал", description: "Подарунок на 18-річчя." },
            { label: "Авто-внески", description: "Щомісячне списання з зарплати." },
          ],
        },
        {
          id: "plan",
          label: "Фінансовий план",
          question: "Як виглядає мій довгостроковий план?",
          description: "5-10 річний фін-план з ключовими подіями: житло, освіта, пенсія, спадщина.",
          capabilities: [
            { label: "Хронологія", description: "Великі цілі по роках." },
            { label: "Розподіл активів", description: "Депозити / OVDP / акції / нерухомість." },
            { label: "Сценарії", description: "Базовий / оптимістичний / захист від ризиків." },
            { label: "Зустріч з консультантом", description: "Експерт переглядає план щороку." },
          ],
        },
        {
          id: "ai-planner",
          label: "AI Savings Planner",
          question: "Що пропонує AI?",
          description: "Конкретні дії з очікуваним ефектом: ребалансування, переказ, скорочення витрат.",
          capabilities: [
            { label: "AI-рекомендації", description: "Топ-3 дії на цей місяць." },
            { label: "What-if", description: "+5000 / +10000 / -витрати на каву." },
            { label: "Ризик-профіль", description: "Консервативний / збалансований / агресивний." },
            { label: "Календар внесків", description: "Авто-нагадування і авто-перекази." },
          ],
        },
      ]}
      currentLocations={[
        { label: "Управління → Інвестиції", onClick: () => onNavigateToOperations?.("investments") },
      ]}
    />
  );
}
