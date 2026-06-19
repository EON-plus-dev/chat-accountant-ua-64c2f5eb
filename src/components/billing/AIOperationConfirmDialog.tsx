import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wallet } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  estimatedCredits: number;
  payerLabel: string; // "Ви" | "Власник кабінету" | "Партнер «Цифра»"
  contractRef?: string;
  isMePaying: boolean;
  onConfirm: () => void;
}

export function AIOperationConfirmDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Підтвердіть AI-операцію
          </DialogTitle>
          <DialogDescription>
            Операція використає AI-кредити. Перевірте платника перед запуском.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Орієнтовно</span>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" /> ~{props.estimatedCredits.toFixed(1)} кр.
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Платник
            </span>
            <Badge variant={props.isMePaying ? "default" : "secondary"}>
              {props.payerLabel}
            </Badge>
          </div>
          {props.contractRef && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Підстава</span>
              <span className="text-xs">Договір {props.contractRef}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={props.onConfirm}>Запустити</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
