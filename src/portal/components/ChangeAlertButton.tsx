import { useState, FormEvent } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createSubscription } from "@/portal/services/subscriptions";

interface Props {
  articleSlug?: string;
}

export const ChangeAlertButton = ({ articleSlug }: Props) => {
  const [subscribed, setSubscribed] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Введіть коректний email');
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await createSubscription({
      email,
      source: 'article_alert',
      articleSlug,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubscribed(true);
      setOpen(false);
    } else {
      setError(result.error || 'Помилка');
    }
  };

  if (subscribed) {
    return (
      <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
        <Check className="h-4 w-4" />
        Підписано — отримаєте сповіщення
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
          Підписатись на зміни цієї сторінки
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-xs text-muted-foreground">Отримайте сповіщення при оновленні цієї статті</p>
          <Input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Підписатись"}
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </form>
      </PopoverContent>
    </Popover>
  );
};
