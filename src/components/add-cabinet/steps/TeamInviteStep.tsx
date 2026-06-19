import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, ArrowRight, Users, Mail, Info, X, Plus, Copy, Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateInviteCode } from "@/lib/inviteCodeGenerator";

interface TeamInviteStepProps {
  cabinetName: string;
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

interface TeamMember {
  id: string;
  email: string;
  role: 'accountant' | 'auditor' | 'lawyer';
  inviteCode: string;
}

const ROLE_OPTIONS = [
  { value: 'accountant', label: 'Бухгалтер', description: 'Повний доступ до документів та звітності' },
  { value: 'auditor', label: 'Аудитор', description: 'Перегляд документів та звітів' },
  { value: 'lawyer', label: 'Юрист', description: 'Доступ до договорів та юридичних документів' },
] as const;

export const TeamInviteStep = ({ 
  cabinetName, 
  onComplete, 
  onSkip, 
  onBack 
}: TeamInviteStepProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<TeamMember['role']>('accountant');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMember = () => {
    if (!newEmail.trim()) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Введіть коректний email");
      return;
    }

    if (members.some(m => m.email === newEmail)) {
      toast.error("Цей email вже додано");
      return;
    }

    // Generate invite code for this member
    const code = generateInviteCode();

    setMembers(prev => [
      ...prev,
      { id: crypto.randomUUID(), email: newEmail, role: newRole, inviteCode: code }
    ]);
    setNewEmail("");
    
    toast.success(`Учасника додано з кодом ${code}`);
  };

  const copyMemberCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Код скопійовано");
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleComplete = async () => {
    if (members.length === 0) {
      onSkip();
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Надіслано ${members.length} запрошень`);
    setIsSubmitting(false);
    onComplete();
  };

  const getRoleLabel = (role: TeamMember['role']) => {
    return ROLE_OPTIONS.find(r => r.value === role)?.label || role;
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)] px-4 py-6">
      <div className="max-w-lg w-full mx-auto flex-1">
        {/* Header */}
        <div className="mb-6">
          <Badge variant="outline" className="mb-3 text-xs">
            Опціонально
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Хочете одразу запросити команду?
          </h2>
          <p className="text-muted-foreground">
            Додайте колег до кабінету «{cabinetName}». Це можна зробити пізніше в налаштуваннях.
          </p>
        </div>

        {/* Add member form */}
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email члена команди</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  onKeyDown={(e) => e.key === 'Enter' && addMember()}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={addMember}
                  disabled={!newEmail.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Роль</Label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map(role => (
                  <button
                    key={role.value}
                    onClick={() => setNewRole(role.value)}
                    className={cn(
                      "p-2.5 rounded-lg border text-center transition-all text-sm",
                      newRole === role.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-primary/30"
                    )}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Added members */}
        {members.length > 0 && (
          <div className="space-y-2 mb-4">
            <Label className="text-sm text-muted-foreground">
              Додані члени команди ({members.length})
            </Label>
            <div className="space-y-2">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{member.email}</p>
                      <p className="text-xs text-muted-foreground">{getRoleLabel(member.role)}</p>
                    </div>
                    {/* Show invite code */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background border">
                      <Key className="w-3 h-3 text-muted-foreground" />
                      <code className="text-xs font-mono">{member.inviteCode}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyMemberCode(member.inviteCode)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 ml-2"
                    onClick={() => removeMember(member.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Запрошені отримають email з посиланням для приєднання до кабінету. 
            Ви зможете керувати правами доступу в налаштуваннях.
          </span>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="max-w-lg w-full mx-auto pt-6 mt-auto">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          
          {members.length === 0 ? (
            <Button
              variant="ghost"
              className="flex-1"
              onClick={onSkip}
            >
              Пропустити
            </Button>
          ) : (
            <Button
              className="flex-1 gap-2"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              <Users className="w-4 h-4" />
              Запросити ({members.length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
