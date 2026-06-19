/**
 * Сторінка повного перегляду перевірки ДПС.
 *
 * Маршрут: /audits/:auditId
 *
 * Використовується як «escape page» з drill-стека:
 * коли користувач відкрив `AuditDrillView` як sheet поверх іншого екрана
 * (платіж, контрагент, AttentionInbox дашборду) і натиснув «Відкрити повну сторінку».
 *
 * Рендерить існуючий `AuditDetailsView` всередині layout з `BackTrailBar`,
 * щоб зберегти контекст «звідки прийшов».
 */

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BackTrailBar } from "@/components/shared/BackTrailBar";
import { AuditDetailsView } from "@/components/cabinets/audits/AuditDetailsView";
import { demoAudits } from "@/config/taxAuditsConfig";

export default function AuditDetailPage() {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const audit = useMemo(
    () => demoAudits.find((a) => a.id === auditId),
    [auditId],
  );

  if (!audit) {
    return (
      <div className="container max-w-4xl mx-auto py-8 space-y-4">
        <BackTrailBar />
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Перевірка з ID <code>{auditId}</code> не знайдена.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-4 md:py-6 space-y-3">
      <BackTrailBar />
      <AuditDetailsView audit={audit} onBack={() => navigate(-1)} />
    </div>
  );
}
