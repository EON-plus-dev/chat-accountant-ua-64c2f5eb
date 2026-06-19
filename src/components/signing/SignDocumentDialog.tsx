import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, QrCode, ExternalLink } from "lucide-react";
import { initKepSign, sha256Hex, type InitSignArgs } from "@/lib/kepSign";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  documentKind: string;
  documentId: string;
  documentBody: string;          // canonical text/JSON
  cabinetId?: string;
  signerUserId: string;
  signerRole: InitSignArgs["signerRole"];
  documentTitle?: string;
}

export function SignDocumentDialog({
  open, onOpenChange, documentKind, documentId, documentBody,
  cabinetId, signerUserId, signerRole, documentTitle,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [reqData, setReqData] = useState<{ deeplink: string; qr_payload: string } | null>(null);

  const start = async () => {
    setLoading(true);
    try {
      const hash = await sha256Hex(documentBody);
      const res = await initKepSign({
        documentKind, documentId, documentHash: hash,
        signerUserId, signerRole, cabinetId,
      });
      if (res?.ok) {
        setReqData({ deeplink: res.request.deeplink, qr_payload: res.request.qr_payload });
        toast({ title: "Запит на підпис створено", description: "Підтвердіть у Дії або через КЕП-пристрій." });
      } else {
        toast({ title: "Не вдалося створити запит", description: res?.error ?? "—", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Помилка", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Підпис КЕП / Дія.Підпис
          </DialogTitle>
          <DialogDescription>
            {documentTitle ?? "Документ"} — підписання має юридичну силу згідно ЗУ № 2155-VIII.
          </DialogDescription>
        </DialogHeader>

        {!reqData ? (
          <div className="space-y-3">
            <Badge variant="outline" className="text-xs">ДЕМО — провайдер mock, не має юридичної сили</Badge>
            <p className="text-sm text-muted-foreground">
              Натисніть «Розпочати підпис», щоб відправити запит на ваш Дія.Підпис або КЕП-носій.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border p-3 text-sm">
              <div className="flex items-center gap-2 font-medium"><QrCode className="h-4 w-4" /> QR-код</div>
              <code className="mt-1 block break-all text-xs text-muted-foreground">{reqData.qr_payload}</code>
            </div>
            <a href={reqData.deeplink} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Відкрити в Дії <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        <DialogFooter>
          {!reqData ? (
            <Button onClick={start} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Розпочати підпис
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>Закрити</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
