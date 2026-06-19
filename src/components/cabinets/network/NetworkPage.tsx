import { Network } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { IaSectionShell } from "../stubs/IaSectionShell";
import { FamilyMembersGrid } from "./FamilyMembersGrid";
import { PersonalOrgsList, PersonalExpertsList } from "./PersonalNetworkLists";

interface Props {
  cabinet: Cabinet;
  defaultInner?: string;
  onNavigateToSettings?: (subTab?: string) => void;
}

export default function NetworkPage({ cabinet, defaultInner, onNavigateToSettings }: Props) {
  return (
    <IaSectionShell
      icon={<Network className="w-6 h-6" />}
      title="Мережа"
      question="З ким я взаємодію?"
      description="Сім'я, організації, експерти і делегації — одна карта людей навколо вас. Окремий модуль FINTODO, якого немає у класичних ERP."
      defaultSubTab={defaultInner}
      subTabs={[
        {
          id: "family",
          label: "Сім'я",
          question: "Хто з родини має доступ?",
          description: "Члени родини з делегованим доступом до спільних бюджетів, документів, цілей.",
          capabilities: [],
          ready: true,
          renderContent: () => <FamilyMembersGrid cabinetId={cabinet.id} />,
        },
        {
          id: "organizations",
          label: "Організації",
          question: "З якими закладами я взаємодію?",
          description: "Стоматології, ресторани, клуби, школи, страхові — з історією платежів і підписками.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalOrgsList cabinetId={cabinet.id} />,
        },
        {
          id: "experts",
          label: "Експерти",
          question: "Кого можу залучити?",
          description: "Лікарі, юристи, бухгалтери, тренери з рейтингами та історією консультацій.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalExpertsList cabinetId={cabinet.id} />,
        },
        {
          id: "delegations",
          label: "Доступи та делегування",
          question: "Хто діє від мого імені?",
          description: "Активні delegation_contracts з КЕП — обсяг повноважень, термін, журнал дій.",
          capabilities: [
            { label: "Активні делегації", description: "Що делеговано, кому, до якої дати." },
            { label: "Журнал дій делегатів", description: "Хронологія операцій від імені вас." },
            { label: "Запити на делегування", description: "Нові запити з вибором scope." },
            { label: "Завершені / відкликані", description: "Архів з можливістю відновлення." },
          ],
        },
        {
          id: "shared-spaces",
          label: "Спільні простори",
          question: "Що у нас спільного з родиною?",
          description: "Сімейний бюджет, спільна подорож, проєкт ремонту — з прозорою історією.",
          capabilities: [
            { label: "Сімейний бюджет", description: "Спільний рахунок з доступом для дружини." },
            { label: "Подорож", description: "Спільні витрати на запланований відпочинок." },
            { label: "Проєкт ремонту", description: "Кошторис, графік, спільні документи." },
            { label: "Учасники", description: "Хто має доступ і до чого." },
          ],
        },
        {
          id: "invitations",
          label: "Запрошення",
          question: "Хто запрошує мене?",
          description: "Запрошення від родини та партнерів до спільних просторів і делегацій.",
          capabilities: [
            { label: "Нові запрошення", description: "Очікують вашого рішення." },
            { label: "Надіслані", description: "Що ви запропонували іншим." },
            { label: "Архів", description: "Прийняті та відхилені." },
          ],
        },
        {
          id: "partner-catalogs",
          label: "Каталоги партнерів",
          question: "На кого я підписаний?",
          description: "Заклади (L3 Cabinet Network Protocol) з лояльністю та оновленнями без повної делегації.",
          capabilities: [
            { label: "Мої місця", description: "Салони, готелі, ресторани, магазини з історією." },
            { label: "Підписки на оновлення", description: "Акції, нові послуги, зміни цін." },
            { label: "Відписатися", description: "Прибрати закладу доступ до ваших даних." },
          ],
        },
      ]}
      currentLocations={[
        { label: "Налаштування → Підключення", onClick: () => onNavigateToSettings?.("connections-privacy") },
      ]}
    />
  );
}
