/**
 * CrmModule — універсальна точка входу для CRM у будь-якому кабінеті.
 *
 * Адаптер:
 *   1. Resolve-ить capability через `resolveCrmCapability(cabinet)`.
 *   2. Обирає preset (saas / b2b_trade / bureau / personal).
 *   3. Якщо preset === "saas" — рендерить існуючий `CrmSection`
 *      (повний UI з демо-даними Fintodo) — backward compatible.
 *   4. Для інших пресетів — стаб з підказкою «Дані-демо для цього preset
 *      ще не підключено», щоб модуль рендерився без падінь у всіх кабінетах.
 *
 * Подальші фази (1–4 плану) поступово замінять CrmSection на повноцінний
 * універсальний UI з drill-stack, mobile-swipe канбаном, health-score тощо.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { resolveCrmCapability, resolveTasksCapability } from "../capability";
import { getCrmPreset } from "./config/crmPresets";
import { getTasksPreset } from "../tasks/config/tasksPresets";
import CrmSection from "@/components/cabinets/crm/CrmSection";
import CrmPipelineBoard from "./components/CrmPipelineBoard";

interface CrmModuleProps {
  cabinet: Cabinet | null | undefined;
  memberCount?: number;
}

const CrmModule = ({ cabinet, memberCount }: CrmModuleProps) => {
  const cap = resolveCrmCapability(cabinet);
  const tasksCap = resolveTasksCapability(cabinet, { memberCount });

  if (!cap.enabled || !cabinet) {
    return (
      <div className="px-4 md:px-6">
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="text-sm font-medium">CRM недоступний для цього типу кабінету</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Активуйте capability «saas_business» або зверніться до власника.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const preset = getCrmPreset(cap.presetId);
  const tasksPreset = getTasksPreset(tasksCap.presetId);

  // SaaS — повна імплементація (поточний CrmSection)
  if (preset.id === "saas") {
    return <CrmSection />;
  }

  // Універсальний Pipeline Board — для b2b_trade / bureau / personal та інших пресетів
  return (
    <div className="px-4 md:px-6 space-y-4 min-w-0 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">{preset.terminology.moduleTitle}</h2>
          <p className="text-sm text-muted-foreground">{preset.terminology.moduleSubtitle}</p>
        </div>
        <Badge variant="outline" className="text-[10px] w-fit">Preset: {preset.id}</Badge>
      </div>

      <CrmPipelineBoard cabinetId={cabinet.id} preset={preset} tasksPreset={tasksPreset} />
    </div>
  );
};

export default CrmModule;

