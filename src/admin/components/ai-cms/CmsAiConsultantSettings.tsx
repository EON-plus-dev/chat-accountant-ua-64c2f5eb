import { Separator } from "@/components/ui/separator";
import CmsCoreSettings from "./CmsCoreSettings";
import AIConsultationsAdmin from "@/admin/pages/AIConsultationsAdmin";

/**
 * Налаштування публічного AI-консультанта:
 * — конфіг (system prompt, модель, ліміти, заборонені теми) через cms_settings.ai_consultant
 * — журнал розмов нижче (AIConsultationsAdmin)
 */
export default function CmsAiConsultantSettings() {
  return (
    <div className="space-y-8">
      <CmsCoreSettings
        filter="consultant"
        title="AI-консультант — конфігурація"
        description="System prompt, модель, ліміти безкоштовних повідомлень, premium-компетенції та заборонені теми. Зберігається в ключі ai_consultant."
      />
      <Separator />
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold mb-1">Історія розмов</h2>
        <p className="text-xs text-muted-foreground mb-4">Журнал звернень користувачів до публічного AI-консультанта.</p>
        <AIConsultationsAdmin />
      </div>
    </div>
  );
}
