import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  hasChanges?: boolean;
}

export const UnsavedChangesDialog = ({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  onCancel,
  hasChanges = true,
}: UnsavedChangesDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasChanges ? "Незбережені зміни" : "Вийти з режиму редагування?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasChanges 
              ? "У вас є незбережені зміни в документі. Бажаєте зберегти їх перед виходом?"
              : "Ви впевнені, що хочете вийти з режиму редагування?"
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel}>
            Продовжити редагування
          </AlertDialogCancel>
          {hasChanges ? (
            <>
              <Button variant="outline" onClick={onDiscard}>
                Не зберігати
              </Button>
              <AlertDialogAction onClick={onSave}>
                Зберегти
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={onDiscard}>
              Вийти
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
