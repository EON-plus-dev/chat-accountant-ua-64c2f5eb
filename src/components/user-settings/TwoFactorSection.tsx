import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Key,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import BackupCodesDialog from "./BackupCodesDialog";
import { supabase } from "@/integrations/supabase/client";

interface TwoFactorSectionProps {
  className?: string;
}

type TwoFactorMethod = "totp" | "sms" | "email" | null;

interface TwoFactorSettings {
  isEnabled: boolean;
  method: TwoFactorMethod;
  backupCodesGeneratedAt: string | null;
}

const TwoFactorSection = ({ className }: TwoFactorSectionProps) => {
  const [settings, setSettings] = useState<TwoFactorSettings>({
    isEnabled: false,
    method: null,
    backupCodesGeneratedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_2fa_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching 2FA settings:", error);
        return;
      }

      if (data) {
        setSettings({
          isEnabled: data.is_enabled,
          method: data.method as TwoFactorMethod,
          backupCodesGeneratedAt: data.backup_codes_generated_at,
        });
      }
    } catch (err) {
      console.error("Error fetching 2FA settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    setIsToggling(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Не авторизовано");

      if (enabled) {
        // Create or update settings with default TOTP method
        const { error } = await supabase
          .from("user_2fa_settings")
          .upsert({
            user_id: user.id,
            is_enabled: true,
            method: "totp",
            enabled_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (error) throw error;

        setSettings(prev => ({
          ...prev,
          isEnabled: true,
          method: "totp",
        }));
        toast.success("Двофакторну автентифікацію увімкнено (демо)");
      } else {
        // Disable 2FA
        const { error } = await supabase
          .from("user_2fa_settings")
          .update({
            is_enabled: false,
            method: null,
            enabled_at: null,
          })
          .eq("user_id", user.id);

        if (error) throw error;

        setSettings(prev => ({
          ...prev,
          isEnabled: false,
          method: null,
        }));
        toast.success("Двофакторну автентифікацію вимкнено");
      }
    } catch (err: any) {
      console.error("Error toggling 2FA:", err);
      toast.error(err.message || "Помилка зміни налаштувань");
    } finally {
      setIsToggling(false);
    }
  };

  const getMethodIcon = (method: TwoFactorMethod) => {
    switch (method) {
      case "totp":
        return <Smartphone className="w-4 h-4" />;
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getMethodName = (method: TwoFactorMethod) => {
    switch (method) {
      case "totp":
        return "Додаток автентифікації";
      case "sms":
        return "SMS";
      case "email":
        return "Email";
      default:
        return "Не налаштовано";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-3">
          <div className="flex items-center gap-3 animate-pulse">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardContent className="py-3">
          <div className="space-y-3">
            {/* Main toggle row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Двофакторна автентифікація</span>
                    {settings.isEnabled && (
                      <Badge variant="default" size="sm" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                        Увімкнено
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {settings.isEnabled 
                      ? `Метод: ${getMethodName(settings.method)}`
                      : "Додатковий захист акаунту"
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.isEnabled}
                onCheckedChange={handleToggle2FA}
                disabled={isToggling}
              />
            </div>

            {/* Additional controls when enabled */}
            {settings.isEnabled && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowBackupCodes(true)}
                >
                  <Key className="w-3.5 h-3.5 mr-1.5" />
                  Резервні коди
                  {!settings.backupCodesGeneratedAt && (
                    <Badge variant="destructive" size="sm" className="ml-1.5">
                      !
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => toast.info("Зміна методу 2FA (демо)")}
                >
                  {getMethodIcon(settings.method)}
                  <span className="ml-1.5">Змінити метод</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <BackupCodesDialog
        open={showBackupCodes}
        onOpenChange={setShowBackupCodes}
        is2FAEnabled={settings.isEnabled}
      />
    </>
  );
};

export default TwoFactorSection;