import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileJson, Shield, Clock } from "lucide-react";
import { toast } from "sonner";

const ExportDataSection = () => {
  const handleExport = () => {
    toast.success("Експорт розпочато (демо)");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Експорт даних профілю
            <Badge variant="secondary">Демо</Badge>
          </CardTitle>
          <CardDescription>
            Завантажте копію ваших персональних даних
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <FileJson className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Що включає експорт:</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Особисті дані (ім'я, контакти, налаштування)</li>
                  <li>• Налаштування сповіщень</li>
                  <li>• Журнал активності</li>
                  <li>• Список пов'язаних кабінетів</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <Shield className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Безпека даних</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Експортовані дані зашифровані та захищені паролем. 
                  Файл буде доступний для завантаження протягом 24 годин.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/30">
              <Clock className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium">Час обробки</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Підготовка експорту може зайняти до 15 хвилин залежно від обсягу даних.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Експортувати дані профілю
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportDataSection;
