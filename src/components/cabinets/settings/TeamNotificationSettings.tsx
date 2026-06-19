import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserPlus, 
  UserCheck,
  ShieldCheck,
  ArrowRightLeft,
  Bell,
  Loader2
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { 
  defaultTeamNotificationSettings,
  type TeamNotificationSetting,
  getTeamNotificationCategoryLabel
} from "@/config/teamNotificationsConfig";
import { useCabinetNotificationPreferences } from "@/hooks/useCabinetNotificationPreferences";
import { toast } from "sonner";

interface TeamNotificationSettingsProps {
  cabinet: Cabinet;
}

export const TeamNotificationSettings = ({ cabinet }: TeamNotificationSettingsProps) => {
  const { settings, loading, saving, toggle } = useCabinetNotificationPreferences(cabinet.id);

  const handleToggle = async (id: TeamNotificationSetting["id"]) => {
    const r = await toggle(id);
    if (r.error) toast.error("Не вдалося зберегти");
  };

  const getEventIcon = (id: string) => {
    switch (id) {
      case "member_invited": return <UserPlus className="h-4 w-4 text-muted-foreground" />;
      case "member_joined": return <UserCheck className="h-4 w-4 text-muted-foreground" />;
      case "role_changed":
      case "permissions_updated": return <ShieldCheck className="h-4 w-4 text-muted-foreground" />;
      case "delegation_created":
      case "delegation_started":
      case "delegation_ending":
      case "delegation_revoked": return <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Group config by category (config is the source of truth for ordering & labels)
  const settingsByCategory = defaultTeamNotificationSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, TeamNotificationSetting[]>);

  const categories = Object.keys(settingsByCategory) as TeamNotificationSetting["category"][];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Сповіщення про зміни в команді</CardTitle>
          </div>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
        <CardDescription className="text-xs">
          Налаштуйте, про які події цього кабінету отримувати сповіщення. Канали доставки (email/telegram/push) керуються окремо в Налаштуваннях профілю → Сповіщення.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {getTeamNotificationCategoryLabel(category)}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-3 space-y-2">
                {settingsByCategory[category].map((setting) => (
                  <div 
                    key={setting.id}
                    className="flex items-center justify-between p-2.5 rounded-md border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {getEventIcon(setting.id)}
                      <div>
                        <span className="text-sm">{setting.label}</span>
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={settings[setting.id] ?? setting.enabled}
                      onCheckedChange={() => handleToggle(setting.id)}
                      disabled={saving}
                    />
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamNotificationSettings;
