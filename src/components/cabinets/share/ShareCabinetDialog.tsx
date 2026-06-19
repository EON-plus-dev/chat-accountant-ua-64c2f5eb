import { useMemo } from "react";
import { Copy, Mail, MessageCircle, Send, Download, Eye, Users, Link2, MessageSquare, QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import { getCabinetRequisites } from "@/config/cabinetRequisitesDemo";
import { buildShareUrl, getViewCount, getLeads } from "@/lib/share/shareLinks";
import { buildRequisitesText } from "@/lib/share/buildRequisitesText";
import { buildVCard, downloadVCard } from "@/lib/share/buildVCard";
import { LinkPreviewCard } from "./LinkPreviewCard";

interface Props {
  cabinet: Cabinet;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  taxSystemLabel?: string | null;
  shortTax?: string | null;
}

function getShortTax(c: Cabinet): string | null {
  if (c.type === "fop" && c.fopGroup) return `${c.fopGroup} гр. ФОП`;
  if (c.type === "tov") return "ТОВ";
  return null;
}

export function ShareCabinetDialog({ cabinet, open, onOpenChange, taxSystemLabel, shortTax }: Props) {
  const { toast } = useToast();
  const requisites = useMemo(() => getCabinetRequisites(cabinet), [cabinet]);
  const shareUrl = useMemo(() => buildShareUrl(cabinet.id), [cabinet.id]);
  const text = useMemo(
    () => buildRequisitesText(cabinet, requisites, { shareUrl, taxSystemLabel }),
    [cabinet, requisites, shareUrl, taxSystemLabel],
  );
  const stats = useMemo(
    () => ({ views: getViewCount(cabinet.id), leads: getLeads(cabinet.id).length }),
    [cabinet.id, open],
  );
  const tax = shortTax ?? getShortTax(cabinet);

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(
      () => toast({ title: "Скопійовано", description: label }),
      () => toast({ title: "Не вдалося скопіювати", variant: "destructive" }),
    );
  };

  const subject = `Реквізити ${requisites.name || cabinet.name}`;
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(subject)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${subject}\n${shareUrl}`)}`;
  const viber = `viber://forward?text=${encodeURIComponent(`${subject}\n${shareUrl}`)}`;

  const downloadQr = () => {
    const svg = document.getElementById("share-qr-svg") as unknown as SVGSVGElement | null;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `requisites-${cabinet.id}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Поділитися реквізитами</DialogTitle>
          <DialogDescription>
            Надішліть контрагенту чисту сторінку з усіма реквізитами. Він заповнить свої дані —
            ви побачите його як новий лід.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9 p-0.5">
            <TabsTrigger value="link" className="text-xs px-2 gap-1.5">
              <Link2 className="w-3.5 h-3.5" /> Посилання
            </TabsTrigger>
            <TabsTrigger value="text" className="text-xs px-2 gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Текст
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-xs px-2 gap-1.5">
              <QrCode className="w-3.5 h-3.5" /> QR
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Link ─────────────────────────────────────────── */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <LinkPreviewCard cabinet={cabinet} requisites={requisites} shortTax={tax} />

            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-xs" />
              <Button onClick={() => copy(shareUrl, "Посилання")} className="shrink-0">
                <Copy className="w-4 h-4 mr-1.5" />
                Копіювати
              </Button>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5">
                Швидко надіслати
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="px-2.5">
                  <a href={mailto}>
                    <Mail className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Email</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="px-2.5">
                  <a href={tg} target="_blank" rel="noopener noreferrer">
                    <Send className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Telegram</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="px-2.5">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="px-2.5">
                  <a href={viber}>
                    <MessageCircle className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Viber</span>
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
              <span className="inline-flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> {stats.views} переглядів
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {stats.leads} лідів захоплено
              </span>
            </div>
          </TabsContent>

          {/* ── Tab: Text ─────────────────────────────────────────── */}
          <TabsContent value="text" className="space-y-3 mt-4">
            <Textarea
              value={text}
              readOnly
              className="font-mono text-xs h-64 resize-none"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => copy(text, "Текст реквізитів")}>
                <Copy className="w-4 h-4 mr-1.5" /> Копіювати текст
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadVCard(`requisites-${cabinet.id}`, buildVCard(cabinet, requisites, shareUrl))}
              >
                <Download className="w-4 h-4 mr-1.5" /> Завантажити .vcf
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Текст готовий до вставки в Telegram/Viber/Email. vCard зберігає реквізити в адресну книгу.
            </p>
          </TabsContent>

          {/* ── Tab: QR ───────────────────────────────────────────── */}
          <TabsContent value="qr" className="space-y-3 mt-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white rounded-lg p-3 border border-border/70">
                <QRCodeSVG id="share-qr-svg" value={shareUrl} size={192} level="M" />
              </div>
              <div className="flex-1 space-y-2 text-sm text-muted-foreground">
                <p>
                  Покажіть QR на зустрічі або роздрукуйте на візитці. Скан → відкриється сторінка
                  з вашими реквізитами.
                </p>
                <Button variant="outline" size="sm" onClick={downloadQr}>
                  <Download className="w-4 h-4 mr-1.5" /> Завантажити SVG
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
