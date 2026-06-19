import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send,
  Mail,
  Link2,
  Network,
  CheckCircle2, 
  Loader2,
  AlertTriangle,
  Copy,
  ExternalLink,
  FileText,
  Calendar,
  Building2,
  Clock,
  Eye,
  Check
} from "lucide-react";
import { Cabinet } from "@/types/cabinet";
import { Document } from "@/config/documentFlowConfig";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SendDocumentDialogProps {
  cabinet: Cabinet;
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentSent?: (document: Document, channel: SendChannel, recipient?: string) => void;
}

type SendChannel = "email" | "edi" | "link";
type SendStep = "channel" | "details" | "sending" | "success" | "error";

interface EdiProvider {
  id: string;
  name: string;
  shortName: string;
  status: "connected" | "available" | "unavailable";
  icon: string;
}

const ediProviders: EdiProvider[] = [
  { id: "medoc", name: "M.E.Doc", shortName: "M.E.Doc", status: "connected", icon: "📄" },
  { id: "vchasno", name: "Вчасно", shortName: "Вчасно", status: "available", icon: "⚡" },
  { id: "paperless", name: "Paperless", shortName: "Paperless", status: "available", icon: "📋" },
  { id: "fredo", name: "FREDO ДокОбіг", shortName: "FREDO", status: "unavailable", icon: "🔄" },
];

const SendDocumentDialog: React.FC<SendDocumentDialogProps> = ({
  cabinet,
  document,
  open,
  onOpenChange,
  onDocumentSent,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<SendStep>("channel");
  const [selectedChannel, setSelectedChannel] = useState<SendChannel>("email");
  const [selectedEdiProvider, setSelectedEdiProvider] = useState<string>("medoc");
  const [email, setEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingProgress, setSendingProgress] = useState(0);
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Generate default email content based on document
  const defaultEmailSubject = useMemo(() => {
    if (!document) return "";
    return `${document.title} №${document.number} від ${cabinet.name}`;
  }, [document, cabinet.name]);

  const defaultEmailMessage = useMemo(() => {
    if (!document) return "";
    return `Доброго дня!

Надсилаємо ${document.title.toLowerCase()} №${document.number} від ${formatDate(document.date)}.

${document.amount ? `Сума: ${formatAmount(document.amount)} ${document.currency || "UAH"}` : ""}

З повагою,
${cabinet.name}`;
  }, [document, cabinet.name]);

  const resetDialog = () => {
    setStep("channel");
    setSelectedChannel("email");
    setSelectedEdiProvider("medoc");
    setEmail("");
    setEmailSubject(defaultEmailSubject);
    setEmailMessage(defaultEmailMessage);
    setSendingProgress(0);
    setGeneratedLink("");
    setLinkCopied(false);
  };

  // Initialize email fields when document changes
  React.useEffect(() => {
    if (open && document) {
      setEmail("");
      setEmailSubject(defaultEmailSubject);
      setEmailMessage(defaultEmailMessage);
    }
  }, [open, document, defaultEmailSubject, defaultEmailMessage]);

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const handleProceedToDetails = () => {
    setStep("details");
  };

  const handleSend = async () => {
    setStep("sending");
    setSendingProgress(0);

    // Generate link for link channel
    if (selectedChannel === "link") {
      const linkId = Math.random().toString(36).substring(2, 10);
      setGeneratedLink(`https://docs.example.com/view/${linkId}`);
    }

    // Simulate sending process
    const steps = [
      { progress: 25, delay: 400 },
      { progress: 50, delay: 600 },
      { progress: 75, delay: 500 },
      { progress: 100, delay: 300 },
    ];

    for (const s of steps) {
      await new Promise(resolve => setTimeout(resolve, s.delay));
      setSendingProgress(s.progress);
    }

    // 95% success rate for demo
    if (Math.random() > 0.05) {
      setStep("success");
      if (document && onDocumentSent) {
        onDocumentSent(document, selectedChannel, selectedChannel === "email" ? email : undefined);
      }
    } else {
      setStep("error");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    toast({
      title: "Посилання скопійовано",
      description: "Тепер ви можете надіслати його контрагенту",
    });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const getChannelIcon = (channel: SendChannel) => {
    switch (channel) {
      case "email": return <Mail className="h-5 w-5" />;
      case "edi": return <Network className="h-5 w-5" />;
      case "link": return <Link2 className="h-5 w-5" />;
    }
  };

  const getChannelLabel = (channel: SendChannel) => {
    switch (channel) {
      case "email": return "Email";
      case "edi": return "EDI (електронний обмін)";
      case "link": return "Посилання для перегляду";
    }
  };

  const getChannelDescription = (channel: SendChannel) => {
    switch (channel) {
      case "email": return "Відправити документ на email контрагента";
      case "edi": return "Передати через систему електронного документообігу";
      case "link": return "Створити посилання для онлайн-перегляду";
    }
  };

  const getEdiStatusBadge = (status: EdiProvider["status"]) => {
    switch (status) {
      case "connected":
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0 text-[10px]">Підключено</Badge>;
      case "available":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-0 text-[10px]">Доступно</Badge>;
      case "unavailable":
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-0 text-[10px]">Недоступно</Badge>;
    }
  };

  const canProceed = () => {
    if (selectedChannel === "email") return true;
    if (selectedChannel === "edi") {
      const provider = ediProviders.find(p => p.id === selectedEdiProvider);
      return provider?.status === "connected";
    }
    return true;
  };

  const canSend = () => {
    if (selectedChannel === "email") {
      return email.includes("@") && email.includes(".");
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Відправлення документа
          </DialogTitle>
          {document && step === "channel" && (
            <DialogDescription>
              {document.title} №{document.number}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Step: Select Channel */}
        {step === "channel" && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Оберіть спосіб відправки</Label>
            
            <RadioGroup
              value={selectedChannel}
              onValueChange={(value) => setSelectedChannel(value as SendChannel)}
              className="space-y-2"
            >
              {(["email", "edi", "link"] as SendChannel[]).map((channel) => (
                <label
                  key={channel}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedChannel === channel
                      ? "border-primary bg-primary/5"
                      : "border-border/70 hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={channel} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(channel)}
                      <span className="font-medium text-sm">{getChannelLabel(channel)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getChannelDescription(channel)}
                    </p>
                  </div>
                </label>
              ))}
            </RadioGroup>

            {/* EDI Provider Selection */}
            {selectedChannel === "edi" && (
              <div className="space-y-2 pl-6">
                <Label className="text-xs text-muted-foreground">Оператор EDI</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ediProviders.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      disabled={provider.status === "unavailable"}
                      onClick={() => setSelectedEdiProvider(provider.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border text-left transition-colors",
                        provider.status === "unavailable" && "opacity-50 cursor-not-allowed",
                        selectedEdiProvider === provider.id
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:bg-muted/50"
                      )}
                    >
                      <span className="text-lg">{provider.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{provider.shortName}</p>
                        {getEdiStatusBadge(provider.status)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && (
          <div className="space-y-4">
            {/* Document summary */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium truncate">{document?.title}</span>
              </div>
              {document?.contractor && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{document.contractor.name}</span>
                </div>
              )}
            </div>

            {/* Email fields */}
            {selectedChannel === "email" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">Email отримувача</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contractor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm">Тема листа</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-sm">Повідомлення</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            )}

            {/* EDI confirmation */}
            {selectedChannel === "edi" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Підключення активне</p>
                    <p className="text-xs text-muted-foreground">
                      {ediProviders.find(p => p.id === selectedEdiProvider)?.name}
                    </p>
                  </div>
                </div>
                {document?.contractor && (
                  <div className="text-sm text-muted-foreground">
                    Документ буде надіслано на адресу EDI контрагента: <span className="font-medium text-foreground">{document.contractor.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Link generation info */}
            {selectedChannel === "link" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                  <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Буде створено посилання</p>
                    <p className="text-xs text-muted-foreground">
                      Документ буде доступний для перегляду протягом 30 днів
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ви зможете відстежувати перегляди документа</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Sending in progress */}
        {step === "sending" && (
          <div className="py-8 space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <Send className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">Відправлення документа...</p>
              <p className="text-sm text-muted-foreground">
                {sendingProgress < 30 && "Підготовка документа..."}
                {sendingProgress >= 30 && sendingProgress < 60 && "Формування пакету..."}
                {sendingProgress >= 60 && sendingProgress < 90 && "Передача даних..."}
                {sendingProgress >= 90 && "Підтвердження отримання..."}
              </p>
            </div>
            <Progress value={sendingProgress} className="h-2" />
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="py-6 space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">Документ відправлено!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedChannel === "email" && `На адресу ${email}`}
                {selectedChannel === "edi" && `Через ${ediProviders.find(p => p.id === selectedEdiProvider)?.name}`}
                {selectedChannel === "link" && "Посилання готове"}
              </p>
            </div>

            {/* Show generated link */}
            {selectedChannel === "link" && generatedLink && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(generatedLink, "_blank")}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Delivery timeline preview */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Статус доставки</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs">Надіслано</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground">Доставлено</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground">Переглянуто</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Очікуйте підтвердження доставки
              </p>
            </div>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <p className="font-medium text-lg">Помилка відправлення</p>
              <p className="text-sm text-muted-foreground mt-1">
                Не вдалося відправити документ. Перевірте підключення та спробуйте ще раз.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "channel" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Скасувати
              </Button>
              <Button 
                onClick={handleProceedToDetails} 
                disabled={!canProceed()}
              >
                Далі
              </Button>
            </>
          )}

          {step === "details" && (
            <>
              <Button variant="outline" onClick={() => setStep("channel")}>
                Назад
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={!canSend()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Відправити
              </Button>
            </>
          )}

          {step === "success" && (
            <Button onClick={handleClose} className="w-full">
              Готово
            </Button>
          )}

          {step === "error" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Закрити
              </Button>
              <Button onClick={() => setStep("details")}>
                Спробувати ще
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper functions
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("uk-UA");
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default SendDocumentDialog;
