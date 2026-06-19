import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Smartphone, Monitor, Globe, LogOut, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { demoSessions, demoSecurityLog } from "@/config/userSettingsConfig";
import TwoFactorSection from "./TwoFactorSection";

const SecuritySection = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Паролі не співпадають");
      return;
    }
    toast.success("Пароль оновлено (демо)");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleEndSession = (sessionId: string) => {
    toast.success("Сесію завершено (демо)");
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes("iPhone") || device.includes("Android")) {
      return <Smartphone className="w-3.5 h-3.5" />;
    }
    return <Monitor className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-4">
      {/* Change Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Зміна пароля
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs">Поточний пароль</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                className="h-9 pr-10"
                type={showCurrentPassword ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs">Новий пароль</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  className="h-9 pr-10"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs">Повторіть пароль</Label>
              <Input
                id="confirmPassword"
                className="h-9"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              />
            </div>
          </div>

          <Button 
            size="sm"
            onClick={handlePasswordChange}
            disabled={!passwords.current || !passwords.new || !passwords.confirm}
          >
            Оновити пароль
          </Button>
        </CardContent>
      </Card>

      {/* 2FA - Now using dedicated component */}
      <TwoFactorSection />

      {/* Active Sessions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Сесії
            <Badge variant="secondary" size="sm">Демо</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {demoSessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-2.5 rounded-md border bg-muted/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium truncate">{session.device}</p>
                      {session.isCurrent && (
                        <Badge variant="default" size="sm">Поточна</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Globe className="w-2.5 h-2.5" />
                      <span>{session.location}</span>
                      <span>•</span>
                      <span>{session.lastActive}</span>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => handleEndSession(session.id)}
                  >
                    <LogOut className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Журнал безпеки
            <Badge variant="secondary" size="sm">Демо</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead compact>Дія</TableHead>
                <TableHead compact className="hidden sm:table-cell">Пристрій</TableHead>
                <TableHead compact>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoSecurityLog.map((log) => (
                <TableRow key={log.id}>
                  <TableCell compact>{log.action}</TableCell>
                  <TableCell compact className="hidden sm:table-cell text-muted-foreground">{log.device}</TableCell>
                  <TableCell compact className="text-muted-foreground">{log.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySection;
