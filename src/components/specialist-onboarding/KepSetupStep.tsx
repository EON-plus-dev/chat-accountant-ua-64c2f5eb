import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ArrowRight, 
  KeyRound, 
  Upload,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamInvitation } from "@/config/teamMembersConfig";
import type { RoleDefinition } from "@/config/teamRolesConfig";

interface KepSetupStepProps {
  invitation: TeamInvitation;
  roleDefinition: RoleDefinition | null;
  isKepRequired: boolean;
  onSkip: () => void;
  onNext: () => void;
  onBack: () => void;
}

const kepProviders = [
  { id: "acsk-idd", name: "АЦСК ІДД ДПС", description: "Безкоштовно для фізичних осіб" },
  { id: "privat", name: "ПриватБанк КЕП", description: "Через Приват24" },
  { id: "oschadbank", name: "Ощадбанк КЕП", description: "Через Ощад 24/7" },
  { id: "diia", name: "Дія.Підпис", description: "Мобільний додаток Дія" },
];

export const KepSetupStep = ({ 
  invitation, 
  roleDefinition,
  isKepRequired,
  onSkip, 
  onNext, 
  onBack 
}: KepSetupStepProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  
  const handleUpload = async () => {
    setIsUploading(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsUploading(false);
    setIsUploaded(true);
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Налаштування КЕП</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {isKepRequired 
            ? "Ваша роль передбачає право підпису документів. Налаштуйте КЕП для електронного підписання."
            : "Додайте КЕП для можливості підписувати документи електронно. Це опціонально."
          }
        </p>
      </div>
      
      {/* Required warning */}
      {isKepRequired && !isUploaded && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-300">
                КЕП рекомендовано для вашої ролі
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                Роль "{invitation.roleLabel}" передбачає право підпису документів. 
                Ви можете налаштувати КЕП зараз або пізніше в налаштуваннях профілю.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Upload section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Завантажити сертифікат КЕП</CardTitle>
          <CardDescription>
            Підтримуються файли .jks, .pfx, .p12
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUploaded ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  КЕП успішно завантажено
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Сертифікат буде доступний для підписання документів
                </p>
              </div>
            </div>
          ) : (
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                "hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
              )}
              onClick={handleUpload}
            >
              {isUploading ? (
                <div className="space-y-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Завантаження...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Натисніть для вибору файлу</p>
                    <p className="text-sm text-muted-foreground">
                      або перетягніть файл сюди
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* No KEP? Get one */}
      {!isUploaded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ще не маєте КЕП?</CardTitle>
            <CardDescription>
              Оберіть зручний спосіб отримання електронного підпису
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {kepProviders.map((provider) => (
              <div 
                key={provider.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{provider.name}</p>
                  <p className="text-xs text-muted-foreground">{provider.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  Детальніше
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Actions */}
      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        
        <div className="flex gap-2">
          {!isKepRequired && !isUploaded && (
            <Button variant="ghost" onClick={onSkip} className="gap-2">
              <SkipForward className="w-4 h-4" />
              Пропустити
            </Button>
          )}
          <Button onClick={onNext} className="gap-2">
            {isUploaded ? "Продовжити" : (isKepRequired ? "Продовжити без КЕП" : "Завершити")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
