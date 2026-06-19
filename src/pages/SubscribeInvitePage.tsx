/**
 * /subscribe/:code — публічна сторінка прийняття L3-запрошення на каталог.
 *
 * MVP: знаходить публікацію за hard-coded демо-кодами, показує умови
 * privacy-VIEW і кнопку «Підписатися». У реалі — резолвить
 * `catalog_invitations.code`, авторизує користувача (Дія/email),
 * створює `catalog_subscriptions` row.
 */
import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MOCK_CATALOG_PUBLICATIONS } from "@/modules/network/data/mockNetworkData";

// Демо-таблиця запрошень → publication.
const DEMO_INVITES: Record<string, string> = {
  "SALON-2026": "pub-salon-zatyshok",
  "TENNIS-VIP": "pub-tennis-club",
  "HOTEL-WELCOME": "pub-hotel-zatyshok",
};

export default function SubscribeInvitePage() {
  const { code = "" } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const publication = useMemo(() => {
    const pubId = DEMO_INVITES[code.toUpperCase()];
    if (!pubId) return null;
    return MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === pubId) ?? null;
  }, [code]);

  if (!publication) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold">Запрошення не знайдено</h1>
          <p className="text-sm text-muted-foreground">
            Код «{code}» недійсний або застарів. Попросіть заклад надіслати нове посилання.
          </p>
          <Button asChild variant="outline">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> На головну</Link>
          </Button>
        </div>
      </div>
    );
  }

  const accept = () => {
    toast({
      title: "Підписку оформлено",
      description: `Заклад «${publication.displayName}» зʼявиться у розділі «Підписки».`,
    });
    setTimeout(() => navigate("/dashboard?tab=cabinets"), 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-6 space-y-5">
        <div className="space-y-1">
          <Badge variant="secondary" className="text-[10px]">Запрошення в мережу Fintodo</Badge>
          <h1 className="text-2xl font-semibold mt-2">{publication.displayName}</h1>
          {publication.shortDescription && (
            <p className="text-sm text-muted-foreground">{publication.shortDescription}</p>
          )}
          {publication.address && (
            <p className="text-xs text-muted-foreground">{publication.address}</p>
          )}
        </div>

        <div className="rounded-lg border bg-background p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4 text-primary" /> Що отримує заклад
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-1">
            <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> Ваше імʼя і телефон</li>
            <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> Історію ваших замовлень/візитів виключно у себе</li>
            <li className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> Можливість писати вам про статус замовлення</li>
          </ul>
        </div>

        <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
          Заклад <span className="font-medium text-foreground">НЕ бачить</span> ваших інших підписок,
          фінансів, декларацій або балансу — це гарантія Cabinet Network Protocol (L3).
          Ви можете відписатися будь-коли зі сторінки «Підписки».
        </div>

        <div className="flex gap-2">
          <Button onClick={accept} className="flex-1">Підписатися</Button>
          <Button variant="outline" onClick={() => navigate("/")}>Відхилити</Button>
        </div>
      </div>
    </div>
  );
}
