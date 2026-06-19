import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Shield, Users, CheckCircle2, Rocket, Loader2,
  Sparkles, Zap, Headphones, Gift, Send, Copy, Check,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAudience } from "@/contexts/AudienceContext";
import { socialProof } from "@/config/landingData";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().max(100, "Максимум 100 символів").optional().or(z.literal("")),
  email: z.string().trim().email("Введіть коректний email").max(255),
  phone: z.string().trim().max(20, "Максимум 20 символів").optional().or(z.literal("")),
  user_type: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface PreRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHARE_URL = "https://fintodo.com.ua";
const SHARE_TEXT = "Я зареєструвався на OblikAI — розумний помічник для бухгалтерії та податків. Приєднуйся!";

const benefits = [
  { icon: Zap, text: "Ранній доступ раніше за всіх" },
  { icon: Gift, text: "Бонус на старті для перших користувачів" },
  { icon: Headphones, text: "Пріоритетна підтримка від команди" },
];

export const PreRegistrationModal = ({ open, onOpenChange }: PreRegistrationModalProps) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const { audience } = useAudience();
  const proofItem = socialProof[audience][0];

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", user_type: "" },
  });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.from("pre_registrations").insert({
      name: data.name || null,
      email: data.email,
      phone: data.phone || null,
      user_type: data.user_type || null,
      audience,
    });

    if (error) {
      if (error.code === "23505") {
        setErrorMsg("Цей email вже у списку. Ми обов'язково повідомимо вас!");
        setStatus("success");
      } else {
        setErrorMsg("Щось пішло не так. Спробуйте ще раз.");
        setStatus("error");
      }
      return;
    }

    // Send welcome email (fire-and-forget)
    supabase.functions.invoke("send-welcome-email", {
      body: { name: data.name || undefined, email: data.email },
    }).catch((err) => console.error("Welcome email error:", err));

    setStatus("success");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStatus("idle");
      setErrorMsg("");
      setCopied(false);
      form.reset();
    }, 300);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      toast.success("Посилання скопійовано!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  };

  const handleShareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(SHARE_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center py-6 space-y-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              >
                <CheckCircle2 className="w-16 h-16 text-primary" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Дякуємо! Ви у списку раннього доступу</h3>
                <p className="text-muted-foreground text-sm">
                  {errorMsg || "Ми надішлемо вам лист із підтвердженням та деталями. Слідкуйте за поштою — повідомимо першими, коли платформа буде готова."}
                </p>
              </div>

              <div className="w-full space-y-3 pt-2">
                <p className="text-xs text-muted-foreground">Тим часом поділіться з колегами</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleShareTelegram}
                    variant="outline"
                    className="flex-1 gap-2"
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                    Telegram
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1 gap-2"
                    size="sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Скопійовано" : "Скопіювати"}
                  </Button>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" />
                  <DialogTitle className="text-xl">Будьте першими</DialogTitle>
                </div>
                <DialogDescription className="text-sm">
                  Залиште контакти — отримайте доступ до платформи одними з перших
                </DialogDescription>

                {/* Benefit bullets */}
                <ul className="space-y-1.5 pt-1">
                  {benefits.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>

                {/* Urgency element */}
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 mt-1">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-primary">
                    Кількість місць для раннього доступу обмежена
                  </span>
                </div>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ваше ім'я</FormLabel>
                        <FormControl>
                          <Input placeholder="Олена Коваленко" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ваш@email.com" autoFocus {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон <span className="text-muted-foreground font-normal">(необов'язково)</span></FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+380 XX XXX XX XX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Хто ви?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть роль" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="accountant">Бухгалтер або бухгалтерське бюро</SelectItem>
                            <SelectItem value="business_owner">Власник бізнесу</SelectItem>
                            <SelectItem value="fop">ФОП</SelectItem>
                            <SelectItem value="cfo">Фінансовий директор / CFO</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {status === "error" && (
                    <p className="text-sm text-destructive">{errorMsg}</p>
                  )}

                  <Button type="submit" className="w-full h-11" disabled={status === "loading"}>
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Реєстрація…
                      </>
                    ) : (
                      "Зареєструватися"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="flex flex-col gap-2 pt-1 border-t border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-primary/70" />
                  <span>Ваші дані захищені. Без спаму.</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
