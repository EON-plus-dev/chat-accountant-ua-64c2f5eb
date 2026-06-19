/**
 * Діалог з QR-кодом і embed-сніпетом для публічної форми запису салону.
 */

import { useEffect, useState } from "react";
import { Copy, Download, ExternalLink, QrCode } from "lucide-react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Props {
  slug: string;
  brandName?: string;
  trigger?: React.ReactNode;
}

export function BookingQrDialog({ slug, brandName, trigger }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://fintodo.com.ua";
  const url = `${origin}/book/${slug}`;
  const embedSnippet = `<iframe src="${url}?embed=1" width="100%" height="720" frameborder="0" style="border:0;border-radius:12px"></iframe>`;

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(url, { margin: 1, width: 320, errorCorrectionLevel: "M" })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [open, url]);

  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: what });
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${slug}.png`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <QrCode className="w-4 h-4 mr-1.5" /> QR і вбудовування
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Поширити форму запису{brandName ? ` — ${brandName}` : ""}
          </DialogTitle>
          <DialogDescription>
            Покажіть QR в салоні, вставте посилання в Instagram-bio або вбудуйте на сайт.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="qr" className="mt-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="qr">QR</TabsTrigger>
            <TabsTrigger value="link">Посилання</TabsTrigger>
            <TabsTrigger value="embed">Вбудувати</TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-3 pt-3">
            <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-center min-h-[280px]">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR код для ${url}`} className="w-64 h-64" />
              ) : (
                <div className="text-sm text-muted-foreground">Генеруємо QR…</div>
              )}
            </div>
            <Button onClick={downloadQr} className="w-full" disabled={!qrDataUrl}>
              <Download className="w-4 h-4 mr-1.5" /> Завантажити PNG
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Друкуйте на ресепшені, дзеркалі робочого місця або візитці майстра.
            </p>
          </TabsContent>

          <TabsContent value="link" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="url" className="text-xs">Публічне посилання</Label>
              <div className="flex gap-1.5">
                <Input id="url" readOnly value={url} className="font-mono text-xs" />
                <Button size="icon" variant="outline" onClick={() => copy(url, "посилання")}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => window.open(url, "_blank")}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Додайте до Instagram-bio, Telegram-каналу, Google Maps або в підпис до повідомлень.
            </p>
          </TabsContent>

          <TabsContent value="embed" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="embed" className="text-xs">HTML-сніпет для вашого сайту</Label>
              <Textarea
                id="embed"
                readOnly
                value={embedSnippet}
                className="font-mono text-[11px] min-h-[120px]"
              />
              <Button size="sm" variant="outline" onClick={() => copy(embedSnippet, "HTML-сніпет")}>
                <Copy className="w-4 h-4 mr-1.5" /> Скопіювати код
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Сторінка завантажиться без шапки — органічно у вашому дизайні.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
