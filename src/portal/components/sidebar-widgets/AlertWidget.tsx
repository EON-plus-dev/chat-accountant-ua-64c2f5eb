import { useState } from "react";
import { Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  category?: string;
}

export const AlertWidget = ({ category }: Props) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("email_subscriptions").insert({
        email,
        source: `hub-${category ?? "general"}`,
        topics: category ? [category] : [],
      });
      if (error) throw error;
      toast.success("Підписку оформлено!");
      setEmail("");
    } catch {
      toast.error("Помилка. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        Підписка на зміни
      </h4>
      <p className="text-[11px] text-muted-foreground">
        Отримуйте сповіщення про важливі зміни{category ? ` у розділі "${category}"` : ""}.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-8 text-xs flex-1"
          required
        />
        <Button type="submit" size="sm" className="h-8 text-xs shrink-0" disabled={loading}>
          {loading ? "..." : "OK"}
        </Button>
      </form>
    </div>
  );
};
