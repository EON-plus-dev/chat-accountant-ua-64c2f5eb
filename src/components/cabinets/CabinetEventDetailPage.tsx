import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Building2,
  Hash,
  Banknote,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  Send,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import type { Cabinet } from "@/types/cabinet";
import {
  getEventJournalConfig,
  eventTypeConfig,
  priorityConfig,
  documentTypeConfig,
  documentStatusConfig,
  type JournalEvent,
  type RelatedDocument,
  type EventActivity
} from "@/config/eventJournalConfig";

interface CabinetEventDetailPageProps {
  cabinet: Cabinet;
  eventId: string;
  onBack: () => void;
}

// Generate mock extended data for an event
const generateExtendedData = (event: JournalEvent): JournalEvent => {
  const daysAgo = (days: number, hours: number = 12, minutes: number = 0): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Generate related documents based on event type
  const relatedDocuments: RelatedDocument[] = [];
  const activityLog: EventActivity[] = [];
  
  if (event.type === "document" || event.type === "payment") {
    relatedDocuments.push({
      id: "doc1",
      type: "contract",
      title: `Договір на надання послуг`,
      number: "45",
      date: daysAgo(60),
      status: "paid"
    });
    
    if (event.metadata?.documentNumber) {
      relatedDocuments.push({
        id: "doc2",
        type: "invoice",
        title: `Рахунок №${event.metadata.documentNumber}`,
        number: event.metadata.documentNumber,
        date: event.date,
        amount: event.metadata.amount,
        status: event.type === "payment" ? "paid" : "sent"
      });
    }
    
    relatedDocuments.push({
      id: "doc3",
      type: "act",
      title: "Акт виконаних робіт",
      date: event.date,
      status: event.type === "payment" ? "sent" : "pending"
    });
  }
  
  if (event.type === "report") {
    relatedDocuments.push({
      id: "rep1",
      type: "report",
      title: "Попередній звіт",
      date: daysAgo(90),
      status: "paid"
    });
    relatedDocuments.push({
      id: "rep2",
      type: "statement",
      title: "Банківська виписка",
      date: daysAgo(5),
      status: "paid"
    });
  }

  if (event.type === "deadline") {
    relatedDocuments.push({
      id: "dead1",
      type: "report",
      title: event.title.includes("ЄП") ? "Декларація ЄП" : "Декларація ПДВ",
      date: event.date,
      status: "pending"
    });
  }

  // Generate activity log
  const eventTime = event.date;
  
  activityLog.push({
    id: "act1",
    timestamp: new Date(eventTime.getTime() - 60000), // 1 min before
    action: "Подію створено",
    user: "Система",
    details: "Автоматично на основі даних"
  });

  if (event.type === "document") {
    activityLog.push({
      id: "act2",
      timestamp: new Date(eventTime.getTime() + 180000), // 3 min after
      action: "Надіслано клієнту",
      user: "AI-Бухгалтер",
      details: event.metadata?.relatedEntity ? `email: ${event.metadata.relatedEntity.toLowerCase().replace(/[«»\s]/g, "")}@company.ua` : undefined
    });
    activityLog.push({
      id: "act3",
      timestamp: new Date(eventTime.getTime() + 300000), // 5 min after
      action: "Переглянуто клієнтом",
      details: "Відкрито з IP: 194.28.xxx.xxx"
    });
  }

  if (event.type === "payment") {
    activityLog.push({
      id: "act2",
      timestamp: eventTime,
      action: "Платіж зараховано",
      user: "Monobank API",
      details: event.metadata?.amount ? formatCurrency(event.metadata.amount) : undefined
    });
  }

  if (event.type === "report") {
    activityLog.push({
      id: "act2",
      timestamp: eventTime,
      action: "Звіт подано",
      user: "AI-Бухгалтер",
      details: "Через API ДПС"
    });
    activityLog.push({
      id: "act3",
      timestamp: new Date(eventTime.getTime() + 3600000), // 1 hour after
      action: "Звіт прийнято",
      user: "ДПС",
      details: "Квитанція №2 отримана"
    });
  }

  // Generate full description
  let fullDescription = event.description || "";
  
  if (event.type === "document" && event.metadata?.relatedEntity) {
    fullDescription = `${event.description}\n\nДокумент підготовлено для ${event.metadata.relatedEntity} згідно з договором. Включає:\n• Основні послуги за період\n• Додаткові роботи (за наявності)\n• Витратні матеріали\n\nОчікуваний термін оплати: 14 календарних днів.`;
  }

  if (event.type === "payment") {
    fullDescription = `${event.description}\n\nПлатіж успішно зараховано на основний рахунок. Автоматично пов'язано з відповідним рахунком та оновлено статус документів.`;
  }

  if (event.type === "report") {
    fullDescription = `${event.description}\n\nЗвіт сформовано на основі даних книги обліку доходів. Всі показники перевірено та підтверджено. Квитанція про прийняття збережена в системі.`;
  }

  // Generate tags
  const tags: string[] = [];
  if (event.type === "document") tags.push("документи", event.metadata?.relatedEntity ? "клієнт" : "внутрішній");
  if (event.type === "payment") tags.push("фінанси", event.metadata?.amount && event.metadata.amount > 10000 ? "великий" : "стандарт");
  if (event.type === "report") tags.push("звітність", "ДПС");
  if (event.type === "deadline") tags.push("терміново", "дедлайн");
  if (event.type === "system") tags.push("автоматизація", "система");
  if (event.priority === "high") tags.push("важливо");

  return {
    ...event,
    fullDescription,
    relatedDocuments,
    activityLog,
    tags,
    assignee: event.priority === "high" ? "Іван Петренко" : undefined,
    sourceSystem: event.type === "payment" ? "Monobank" : event.type === "system" ? "Автоімпорт" : undefined
  };
};

const CabinetEventDetailPage = ({ cabinet, eventId, onBack }: CabinetEventDetailPageProps) => {
  // Find and extend event
  const event = useMemo(() => {
    const allEvents = getEventJournalConfig(cabinet.type);
    const foundEvent = allEvents.find(e => e.id === eventId);
    if (!foundEvent) return null;
    return generateExtendedData(foundEvent);
  }, [cabinet.type, eventId]);

  if (!event) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Подію не знайдено</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ця подія може бути видалена або недоступна
            </p>
            <Button onClick={onBack}>Повернутися до подій</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeConfig = eventTypeConfig[event.type];
  const prioConfig = priorityConfig[event.priority];

  const formatAmount = (amount: number) => formatCurrency(amount);

  const formatDateTime = (date: Date) => {
    return format(date, "d MMMM yyyy, HH:mm", { locale: uk });
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: uk });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/event/${eventId}`);
    toast.success("Посилання скопійовано");
  };

  const handleSendReminder = () => {
    toast.success("Нагадування надіслано");
  };

  const navigate = useNavigate();
  const bookingDeepLink = useMemo(() => {
    if (event.type !== "booking") return null;
    const tag = event.tags?.find((t) => t.startsWith("booking:"));
    const bookingId = tag ? tag.slice("booking:".length) : null;
    const params = new URLSearchParams({
      tab: "operations",
      subtab: "bookings",
      cabinet: cabinet.id,
    });
    if (bookingId) params.set("bookingId", bookingId);
    return `/dashboard?${params.toString()}`;
  }, [event.type, event.tags, cabinet.id]);

  return (

    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex items-start gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="h-8 w-8 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            {/* Type and Priority badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={cn("gap-1", typeConfig.bgColor, typeConfig.color, "border-0")}>
                <event.icon className="w-3 h-3" />
                {typeConfig.label}
              </Badge>
              {event.priority === "high" && (
                <Badge variant="destructive" className="text-xs">
                  Важливо
                </Badge>
              )}
            </div>
            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold leading-tight">{event.title}</h2>
            {/* Meta info */}
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDateTime(event.date)}
              </span>
              {event.metadata?.relatedEntity && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {event.metadata.relatedEntity}
                </span>
              )}
            </div>
            {event.type === "booking" && bookingDeepLink && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5"
                onClick={() => navigate(bookingDeepLink)}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Відкрити у Щоденнику
              </Button>
            )}
          </div>
        </div>
      </div>


      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 pt-2 space-y-4">
          {/* Two-column layout on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Details */}
            <div className="space-y-4">
              {/* Details Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    Деталі
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.metadata?.amount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Сума</span>
                      <span className="text-sm font-semibold text-success tabular-nums">
                        {formatAmount(event.metadata.amount)}
                      </span>
                    </div>
                  )}
                  {event.metadata?.relatedEntity && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Контрагент</span>
                      <span className="text-sm font-medium">{event.metadata.relatedEntity}</span>
                    </div>
                  )}
                  {event.metadata?.documentNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Номер документа</span>
                      <span className="text-sm font-medium">№{event.metadata.documentNumber}</span>
                    </div>
                  )}
                  {event.sourceSystem && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Джерело</span>
                      <Badge variant="outline" className="text-xs">
                        {event.sourceSystem}
                      </Badge>
                    </div>
                  )}
                  {event.assignee && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Відповідальний</span>
                      <span className="text-sm font-medium flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {event.assignee}
                      </span>
                    </div>
                  )}
                  {event.tags && event.tags.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Tag className="w-3 h-3" />
                        Теги
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {event.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Full Description Card */}
              {event.fullDescription && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Опис</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {event.fullDescription}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Related Documents */}
            <div className="space-y-4">
              {/* Related Documents Card */}
              {event.relatedDocuments && event.relatedDocuments.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Пов'язані документи</span>
                      <Badge variant="secondary" className="text-xs">
                        {event.relatedDocuments.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {event.relatedDocuments.map((doc) => {
                      const docConfig = documentTypeConfig[doc.type];
                      const statusConfig = documentStatusConfig[doc.status];
                      const DocIcon = docConfig.icon;
                      
                      return (
                        <div 
                          key={doc.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                        >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-background", docConfig.color)}>
                            <DocIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{doc.title}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-xs text-muted-foreground">
                                    {format(doc.date, "d.MM.yyyy", { locale: uk })}
                                  </span>
                                  {doc.amount && (
                                    <span className="text-xs font-medium text-success tabular-nums">
                                      {formatAmount(doc.amount)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge variant="status" className={cn("text-[11px] flex-shrink-0", statusConfig.bgColor, statusConfig.textColor)}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Activity Log - Full Width */}
          {event.activityLog && event.activityLog.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Хронологія
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l-2 border-border space-y-4">
                  {event.activityLog.map((activity, index) => {
                    const isLast = index === event.activityLog!.length - 1;
                    const isPending = activity.action.includes("Очікує");
                    
                    return (
                      <div key={activity.id} className="relative">
                        {/* Timeline dot */}
                        <div className={cn(
                          "absolute -left-[25px] w-4 h-4 rounded-full flex items-center justify-center",
                          isPending 
                            ? "bg-warning/20" 
                            : "bg-success/20"
                        )}>
                          {isPending ? (
                            <Circle className="w-2.5 h-2.5 text-warning" />
                          ) : (
                            <CheckCircle className="w-2.5 h-2.5 text-success" />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatTime(activity.timestamp)}
                            </span>
                            <span className="text-sm font-medium">{activity.action}</span>
                            {activity.user && (
                              <Badge variant="outline" className="text-[11px]">
                                {activity.user}
                              </Badge>
                            )}
                          </div>
                          {activity.details && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {activity.details}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Buttons */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {(event.type === "document" || event.type === "deadline") && (
                  <Button variant="default" size="sm" onClick={handleSendReminder} className="gap-1.5">
                    <Send className="w-4 h-4" />
                    Надіслати нагадування
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5">
                  <Copy className="w-4 h-4" />
                  Копіювати посилання
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit className="w-4 h-4" />
                  Редагувати
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                  Видалити
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CabinetEventDetailPage;