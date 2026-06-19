import { FileText } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { IaSectionShell } from "../stubs/IaSectionShell";
import { PersonalDocumentsCategory } from "./PersonalDocumentsCategory";

interface Props {
  cabinet: Cabinet;
  defaultInner?: string;
  onNavigateToOperations?: (subTab?: string) => void;
}

export default function DocumentsHubPage({ cabinet, defaultInner, onNavigateToOperations }: Props) {
  return (
    <IaSectionShell
      icon={<FileText className="w-6 h-6" />}
      title="Документи"
      question="Де всі мої документи?"
      description="Усі особисті документи: паспорт, Дія, податкові, майнові, договори, страхування, медицина, архів. Один контекст замість десятка папок."
      defaultSubTab={defaultInner}
      subTabs={[
        {
          id: "personal",
          label: "Особисті",
          question: "Паспорт, ID, водійське?",
          description: "Базові документи особи: ID-картка, закордонний паспорт, ІПН.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalDocumentsCategory cabinetId={cabinet.id} category="personal" />,
        },
        {
          id: "diia",
          label: "Дія",
          question: "Що в моєму Дія-гаманці?",
          description: "Документи, доступні через застосунок «Дія».",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalDocumentsCategory cabinetId={cabinet.id} category="diia" />,
        },
        {
          id: "tax",
          label: "Податкові",
          question: "Що в податковому досьє?",
          description: "Декларації про доходи, витяги, повідомлення ДПС.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalDocumentsCategory cabinetId={cabinet.id} category="tax" />,
        },
        {
          id: "property",
          label: "Майнові",
          question: "Що підтверджує моє майно?",
          description: "Свідоцтва на нерухомість і авто, технічні паспорти.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalDocumentsCategory cabinetId={cabinet.id} category="property" />,
        },
        {
          id: "contracts",
          label: "Договори",
          question: "Які в мене активні угоди?",
          description: "Договори з другою стороною — оренда, послуги, додаткові угоди.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalDocumentsCategory cabinetId={cabinet.id} category="contracts" />,
        },
        {
          id: "insurance",
          label: "Страхування",
          question: "Які поліси активні?",
          description: "ДМС, авто, майно — з датами дії і покриттям.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalDocumentsCategory cabinetId={cabinet.id} category="insurance" />,
        },
        {
          id: "medical",
          label: "Медичні",
          question: "Що в моїй медичній історії?",
          description: "Виписки, аналізи, рецепти, висновки лікарів.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalDocumentsCategory cabinetId={cabinet.id} category="medical" />,
        },
        {
          id: "archive",
          label: "Архів",
          question: "Старі документи?",
          description: "Те, що вже не діє, але потрібно зберегти.",
          capabilities: [],
          ready: true,
          renderContent: () => <PersonalDocumentsCategory cabinetId={cabinet.id} category="archive" />,
        },
        {
          id: "ai",
          label: "AI Documents",
          question: "Що мені каже AI про документи?",
          description: "AI-розбір, узагальнення, екстракція полів, перевірка ризиків.",
          capabilities: [
            { label: "Розбір документа", description: "Структуровані поля з PDF/фото." },
            { label: "Ризики", description: "Що може бути проблемним у договорі." },
            { label: "Порівняння версій", description: "Що змінилося між редакціями." },
            { label: "Запитати AI", description: "Чат з документом." },
          ],
        },
      ]}
      currentLocations={[
        { label: "Управління → Документи", onClick: () => onNavigateToOperations?.("documents") },
      ]}
    />
  );
}
