import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, UserX, FileX, Users, Database } from "lucide-react";
import DeleteAccountDialog from "./DeleteAccountDialog";

const DeleteAccountSection = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold text-destructive">Небезпечна зона</h3>
            <p className="text-sm text-muted-foreground">
              Дії в цьому розділі є незворотними. Будь ласка, переконайтеся, що ви розумієте наслідки.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Account Card */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            Видалення акаунту
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ця дія є <span className="font-medium text-foreground">незворотною</span>. 
            Всі ваші дані буде видалено назавжди:
          </p>

          <div className="grid gap-2">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <UserX className="w-3.5 h-3.5" />
              </div>
              <span>Особисті дані та налаштування профілю</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Database className="w-3.5 h-3.5" />
              </div>
              <span>Історія активності та журнали</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span>Зв'язки з кабінетами (ви залишите всі команди)</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <FileX className="w-3.5 h-3.5" />
              </div>
              <span>Файли та документи у вашому профілі</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <span className="font-medium">Важливо:</span> Дані кабінетів, де ви є власником, НЕ видаляються автоматично. 
                Передайте право власності іншому учаснику або видаліть кабінети вручну перед видаленням акаунту.
              </p>
            </div>
          </div>

          <Button 
            variant="destructive" 
            className="w-full sm:w-auto"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Видалити мій акаунт
          </Button>
        </CardContent>
      </Card>

      <DeleteAccountDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog} 
      />
    </div>
  );
};

export default DeleteAccountSection;