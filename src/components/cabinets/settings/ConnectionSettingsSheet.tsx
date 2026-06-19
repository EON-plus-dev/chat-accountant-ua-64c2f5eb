import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  RefreshCw, 
  Clock, 
  Calendar, 
  Database, 
  Shield, 
  AlertTriangle, 
  Trash2, 
  Pause,
  Play,
  KeyRound,
  CheckCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { toast } from "sonner";
import type { DataSource, SyncFrequency } from "@/config/dataSourcesConfig";
import { syncFrequencyLabels } from "@/config/dataSourcesConfig";

interface ConnectionSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: DataSource | null;
  onDisconnect?: (connectionId: string, keepHistory: boolean) => void;
  onPauseToggle?: (connectionId: string, paused: boolean) => void;
  onSyncFrequencyChange?: (connectionId: string, frequency: SyncFrequency) => void;
  onRefreshCredentials?: (connectionId: string) => void;
}

export const ConnectionSettingsSheet = ({ 
  open, 
  onOpenChange, 
  connection,
  onDisconnect,
  onPauseToggle,
  onSyncFrequencyChange,
  onRefreshCredentials,
}: ConnectionSettingsSheetProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>(connection?.syncFrequency || "1h");
  const [keepHistoryOnDisconnect, setKeepHistoryOnDisconnect] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!connection) return null;

  const ConnectionIcon = connection.icon;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSyncing(false);
    toast.success("Синхронізацію завершено");
  };

  const handlePauseToggle = () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    onPauseToggle?.(connection.id, newPaused);
    toast.success(newPaused ? "Синхронізацію призупинено" : "Синхронізацію відновлено");
  };

  const handleSyncFrequencyChange = (value: SyncFrequency) => {
    setSyncFrequency(value);
    onSyncFrequencyChange?.(connection.id, value);
    toast.success(`Частоту синхронізації змінено на "${syncFrequencyLabels[value]}"`);
  };

  const handleRefreshCredentials = () => {
    onRefreshCredentials?.(connection.id);
    toast.info("Перенаправлення на сторінку авторизації...");
  };

  const handleDisconnect = () => {
    onDisconnect?.(connection.id, keepHistoryOnDisconnect);
    onOpenChange(false);
    toast.success(`${connection.name} відключено`);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return format(new Date(dateStr), "d MMMM yyyy, HH:mm", { locale: uk });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2.5">
              <ConnectionIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-left">{connection.name}</SheetTitle>
                {connection.status === "active" && (
                  <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Активне
                  </Badge>
                )}
                {connection.status === "error" && (
                  <Badge variant="destructive">Помилка</Badge>
                )}
                {isPaused && (
                  <Badge variant="secondary">Пауза</Badge>
                )}
              </div>
              {connection.description && (
                <SheetDescription className="text-left mt-0.5">
                  {connection.description}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 w-auto justify-start h-9">
            <TabsTrigger value="general" className="text-xs">Загальне</TabsTrigger>
            <TabsTrigger value="sync" className="text-xs">Синхронізація</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Безпека</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4">
            {/* General Tab */}
            <TabsContent value="general" className="mt-0 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Інформація про підключення
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Дата підключення</span>
                    <span className="font-medium">{formatDate(connection.createdAt)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Остання синхронізація</span>
                    <span className="font-medium">
                      {connection.lastSync 
                        ? formatDistanceToNow(new Date(connection.lastSync), { addSuffix: true, locale: uk })
                        : "—"
                      }
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Записів імпортовано</span>
                    <span className="font-medium tabular-nums">
                      {connection.recordsCount?.toLocaleString("uk-UA") || "0"}
                    </span>
                  </div>
                  {connection.dataQualityPercent !== undefined && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Відповідність</span>
                          <span className={`font-medium ${
                            connection.dataQualityPercent >= 90 ? "text-green-600" : 
                            connection.dataQualityPercent >= 70 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {connection.dataQualityPercent}%
                          </span>
                        </div>
                        <Progress value={connection.dataQualityPercent} className="h-1.5" />
                        
                        {/* Data quality issues breakdown */}
                        {connection.dataQualityIssues && connection.dataQualityIssues.length > 0 && (
                          <div className="pt-2 space-y-1.5">
                            {connection.dataQualityIssues.map((issue) => (
                              <div key={issue.type} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${issue.color}`} />
                                  <span className="text-muted-foreground">{issue.label}</span>
                                </div>
                                <span className="font-medium">{issue.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Error info if present */}
              {connection.status === "error" && connection.error && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">{connection.error}</p>
                        {connection.errorDetails && (
                          <p className="text-xs text-muted-foreground">{connection.errorDetails}</p>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={handleRefreshCredentials}
                        >
                          <KeyRound className="h-3.5 w-3.5 mr-2" />
                          Оновити доступ
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Sync Tab */}
            <TabsContent value="sync" className="mt-0 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Розклад синхронізації
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Частота оновлення</Label>
                    <Select 
                      value={syncFrequency} 
                      onValueChange={(v) => handleSyncFrequencyChange(v as SyncFrequency)}
                      disabled={isPaused}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(syncFrequencyLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Призупинити синхронізацію</Label>
                      <p className="text-xs text-muted-foreground">
                        Дані зберігаються, але оновлення не відбуваються
                      </p>
                    </div>
                    <Switch checked={isPaused} onCheckedChange={handlePauseToggle} />
                  </div>
                </CardContent>
              </Card>

              <Button 
                className="w-full" 
                onClick={handleSyncNow}
                disabled={isSyncing || isPaused}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Синхронізація...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Синхронізувати зараз
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Облікові дані
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Тип автентифікації</span>
                    <span className="font-medium">
                      {connection.auth?.type === "oauth" ? "OAuth 2.0" : 
                       connection.auth?.type === "api_key" ? "API-ключ" : 
                       connection.auth?.type === "credentials" ? "Логін/Пароль" : "—"}
                    </span>
                  </div>
                  {connection.lastCredentialsUpdate && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Останнє оновлення</span>
                        <span className="font-medium">{formatDate(connection.lastCredentialsUpdate)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleRefreshCredentials}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Оновити облікові дані
              </Button>

              {/* Danger Zone */}
              <div className="pt-4">
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Небезпечна зона
                  </h4>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Відключити інтеграцію
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Відключити {connection.name}?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>Це припинить синхронізацію даних з цим джерелом.</p>
                          
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                            <Switch 
                              id="keep-history" 
                              checked={keepHistoryOnDisconnect}
                              onCheckedChange={setKeepHistoryOnDisconnect}
                            />
                            <Label htmlFor="keep-history" className="text-sm cursor-pointer">
                              Зберегти історичні дані
                            </Label>
                          </div>
                          
                          {!keepHistoryOnDisconnect && (
                            <p className="text-destructive text-sm flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                              Усі імпортовані дані ({connection.recordsCount?.toLocaleString("uk-UA") || 0} записів) будуть видалені
                            </p>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Скасувати</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDisconnect}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Відключити
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ConnectionSettingsSheet;
