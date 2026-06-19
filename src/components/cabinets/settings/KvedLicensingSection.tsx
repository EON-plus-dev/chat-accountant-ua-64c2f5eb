import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Briefcase, 
  AlertTriangle, 
  CheckCircle, 
  FileWarning,
  Bot,
  Info,
  Lock,
  Sparkles,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { getKvedsForCabinet } from "@/config/settingsConfig";
import { RegistrySyncBadge, RegistrySyncBanner } from "@/components/shared";
import { KvedApplicationDialog } from "./KvedApplicationDialog";

interface KvedLicensingSectionProps {
  cabinet: Cabinet;
}

// Demo licenses
const demoLicenses = [
  { id: "1", name: "Ліцензія на IT-послуги", status: "not_required" as const, reason: "Не потребує ліцензування" },
  { id: "2", name: "Дозвіл на обробку персональних даних", status: "check" as const, reason: "Рекомендуємо перевірити" },
];

export const KvedLicensingSection = ({ cabinet }: KvedLicensingSectionProps) => {
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const kveds = getKvedsForCabinet(cabinet);
  const mainKved = kveds.find(k => k.isMain);
  
  // Dynamic compliance signals based on actual KVEDs
  const complianceSignals = [
    { 
      id: "1", 
      type: "warning" as const, 
      message: "Виявлено 2 операції, які можуть не відповідати зареєстрованим КВЕДам", 
      details: `Рекомендуємо перевірити операції на відповідність КВЕД ${mainKved?.code || "основному"}` 
    },
    { 
      id: "2", 
      type: "info" as const, 
      message: `КВЕД ${mainKved?.code || ""} є основним видом діяльності`, 
      details: "85% доходів відповідає цьому коду" 
    },
  ];
  
  // Registry sync status (simulated for demo)
  const isRegistryVerified = true;
  const lastSyncDate = cabinet.registrySync?.edr?.lastSync ?? new Date().toISOString();

  if (cabinet.type === "individual") {
    return (
      <Card className="hover:shadow-md transition-all">
        <CardContent className="p-8 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            КВЕДи не застосовуються для фізичних осіб
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* KVEDs List - Read-only from EDR */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Коди КВЕД</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <RegistrySyncBadge source="edr" lastSync={lastSyncDate} variant="compact" />
              {isRegistryVerified && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
          <CardDescription>
            Зареєстровані види економічної діяльності
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Registry sync banner */}
          {isRegistryVerified && (
            <RegistrySyncBanner 
              sources={['edr']} 
              lastSync={lastSyncDate}
              variant="compact"
            />
          )}
          
          {/* KVED list - read-only */}
          <div className="space-y-2">
            {kveds.map((kved) => (
              <div 
                key={kved.code}
                className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={kved.isMain ? "default" : "secondary"} className="font-mono tabular-nums">
                    {kved.code}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{kved.name}</p>
                    {kved.isMain && (
                      <p className="text-xs text-muted-foreground">Основний вид діяльності</p>
                    )}
                  </div>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground/60" />
              </div>
            ))}
          </div>
          
          {/* Info about KVED changes */}
          <Alert className="border-muted bg-muted/30">
            <Info className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-sm text-muted-foreground">
              КВЕДи реєструються через держреєстраторів. Для зміни видів діяльності необхідно 
              подати заяву до ЄДР. Система допоможе підготувати необхідні документи.
            </AlertDescription>
          </Alert>
          
          {/* Initiate application button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsApplicationDialogOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ініціювати додавання КВЕД
          </Button>
        </CardContent>
      </Card>

      {/* AI Check Button */}
      <Card className="hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">AI-перевірка відповідності</p>
                <p className="text-sm text-muted-foreground">
                  Аналіз операцій на відповідність зареєстрованим КВЕДам
                </p>
              </div>
            </div>
            <Button>
              Перевірити
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Signals */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle className="text-base">Сигнали відповідності</CardTitle>
          </div>
          <CardDescription>
            Автоматичні перевірки операцій на відповідність КВЕДам
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {complianceSignals.map((signal) => (
            <div 
              key={signal.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                signal.type === "warning" ? "border-warning bg-warning/5" : "border-border"
              }`}
            >
              {signal.type === "warning" ? (
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium">{signal.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{signal.details}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Licenses */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Ліцензії та дозволи</CardTitle>
          </div>
          <CardDescription>
            Перелік потенційно необхідних дозволів на основі КВЕДів
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {demoLicenses.map((license) => (
            <div 
              key={license.id}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-all"
            >
              <div className="flex items-center gap-3">
                {license.status === "not_required" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <FileWarning className="h-5 w-5 text-warning" />
                )}
                <div>
                  <p className="text-sm font-medium">{license.name}</p>
                  <p className="text-xs text-muted-foreground">{license.reason}</p>
                </div>
              </div>
              <Badge variant={license.status === "not_required" ? "secondary" : "outline"}>
                {license.status === "not_required" ? "Не потрібно" : "Перевірити"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* FOP Group KVED Matrix */}
      {cabinet.type === "fop-group" && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-base">Зведена КВЕД-матриця групи</CardTitle>
            <CardDescription>
              Перегляд КВЕДів усіх ФОП у групі
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-4">
              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Зведена матриця КВЕДів для 3 ФОП у групі</p>
              <Button variant="outline" className="mt-4">
                Переглянути детально
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* KVED Application Dialog */}
      <KvedApplicationDialog 
        cabinet={cabinet}
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
      />
    </div>
  );
};
