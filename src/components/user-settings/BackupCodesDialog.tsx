import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Copy, 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface BackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  is2FAEnabled: boolean;
}

interface BackupCodeStats {
  total: number;
  used: number;
  generatedAt: string | null;
}

const BackupCodesDialog = ({ open, onOpenChange, is2FAEnabled }: BackupCodesDialogProps) => {
  const [codes, setCodes] = useState<string[]>([]);
  const [stats, setStats] = useState<BackupCodeStats>({ total: 0, used: 0, generatedAt: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);

  // Fetch stats on open
  useEffect(() => {
    if (open && is2FAEnabled) {
      fetchStats();
    }
  }, [open, is2FAEnabled]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCodes([]);
        setPassword("");
        setError(null);
        setShowConfirmRegenerate(false);
        setJustGenerated(false);
      }, 200);
    }
  }, [open]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch backup codes stats from database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизовано");

      const { data: backupCodes, error: codesError } = await supabase
        .from("user_backup_codes")
        .select("id, used_at, created_at")
        .eq("user_id", user.id);

      if (codesError) throw codesError;

      const usedCount = backupCodes?.filter(c => c.used_at !== null).length || 0;
      const total = backupCodes?.length || 0;
      const generatedAt = backupCodes?.[0]?.created_at || null;

      setStats({
        total,
        used: usedCount,
        generatedAt: generatedAt ? new Date(generatedAt).toLocaleDateString("uk-UA") : null,
      });
    } catch (err: any) {
      console.error("Error fetching backup codes stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    if (!password) {
      setError("Введіть пароль");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-backup-codes", {
        body: { password },
      });

      if (fnError) throw new Error(fnError.message || "Помилка генерації");
      if (data?.error) throw new Error(data.error);

      if (data?.codes) {
        setCodes(data.codes);
        setJustGenerated(true);
        setShowConfirmRegenerate(false);
        setPassword("");
        setStats({
          total: data.codes.length,
          used: 0,
          generatedAt: new Date().toLocaleDateString("uk-UA"),
        });
        toast.success("Нові резервні коди згенеровано");
      }
    } catch (err: any) {
      setError(err.message || "Помилка генерації кодів");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const text = codes.join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Коди скопійовано в буфер обміну");
  };

  const handleDownload = () => {
    const text = [
      "=== РЕЗЕРВНІ КОДИ 2FA ===",
      `Згенеровано: ${new Date().toLocaleString("uk-UA")}`,
      "",
      "УВАГА: Кожен код можна використати лише один раз!",
      "Зберігайте у безпечному місці.",
      "",
      "Коди:",
      ...codes.map((code, i) => `${i + 1}. ${code}`),
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-codes-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Файл завантажено");
  };

  if (!is2FAEnabled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Резервні коди
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <p className="text-sm text-muted-foreground">
              Для генерації резервних кодів спочатку увімкніть двофакторну автентифікацію (2FA).
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Закрити
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Резервні коди
          </DialogTitle>
          <DialogDescription>
            {justGenerated 
              ? "Збережіть ці коди у безпечному місці!" 
              : "Резервні коди для входу без доступу до автентифікатора"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : codes.length > 0 ? (
          // Show generated codes
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Кожен код можна використати лише один раз. Після закриття цього вікна ви більше не зможете побачити ці коди!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted/50 font-mono text-sm">
              {codes.map((code, index) => (
                <div 
                  key={index}
                  className="px-3 py-1.5 rounded bg-background border text-center"
                >
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Всього кодів: {codes.length}</span>
              <span>Створено: {stats.generatedAt}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-1.5" />
                Копіювати
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1.5" />
                Завантажити TXT
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setCodes([]);
                  setShowConfirmRegenerate(true);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Згенерувати нові
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => onOpenChange(false)}>
                Готово
              </Button>
            </div>
          </div>
        ) : showConfirmRegenerate || stats.total === 0 ? (
          // Generate/regenerate codes form
          <div className="space-y-4 py-2">
            {stats.total > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Генерація нових кодів скасує всі попередні. Переконайтеся, що ви готові замінити існуючі коди.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">
                Введіть пароль для підтвердження
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={isGenerating}
                  className="pr-10"
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isGenerating}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (stats.total > 0) {
                    setShowConfirmRegenerate(false);
                  } else {
                    onOpenChange(false);
                  }
                }}
                disabled={isGenerating}
              >
                Скасувати
              </Button>
              <Button onClick={handleGenerateCodes} disabled={isGenerating || !password}>
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Згенерувати коди
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Show stats when codes exist but not visible
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium">Резервні коди активні</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Всього кодів</p>
                  <p className="font-medium">{stats.total}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Використано</p>
                  <p className="font-medium">{stats.used} / {stats.total}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Створено</p>
                  <p className="font-medium">{stats.generatedAt || "—"}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              З міркувань безпеки ви не можете переглянути існуючі коди. Якщо ви їх загубили, згенеруйте нові.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Закрити
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowConfirmRegenerate(true)}
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Згенерувати нові
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BackupCodesDialog;