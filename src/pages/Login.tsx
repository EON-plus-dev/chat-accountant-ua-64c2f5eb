import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Loader2, Eye, EyeOff, Shield, LayoutDashboard, FileEdit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Невірний формат email"),
  password: z.string().min(6, "Пароль має бути не менше 6 символів"),
});

type LoginMode = "cabinet" | "admin" | "cms";

const REDIRECTS: Record<LoginMode, string> = {
  cabinet: "/dashboard",
  admin: "/admin/system",
  cms: "/admin",
};

const FOOTER_HINT: Record<LoginMode, string> = {
  cabinet: "Доступ надається адміністратором системи",
  admin: "Системне керування платформою",
  cms: "Управління контентом порталу",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<LoginMode>("cabinet");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валідація
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("Невірний email або пароль");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Email не підтверджено");
        } else {
          setError("Помилка входу. Спробуйте ще раз");
        }
        return;
      }

      // AdminRoute робить власну перевірку has_role з ретраями.
      navigate(REDIRECTS[mode]);
    } catch (e) {
      console.error("[Login] Unexpected error:", e);
      setError("Помилка мережі. Спробуйте ще раз");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-secondary/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-2xl mb-3 sm:mb-4 shadow-lg">
            <Calculator className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-sans font-semibold tracking-wide text-foreground mb-2">FINTODO</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            AI-кабінет для бухобліку: документи, доходи/витрати, звіти — усе через чат
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => { setMode(v as LoginMode); setError(null); }} className="mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cabinet" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Кабінет
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="h-4 w-4" />
              Адмін
            </TabsTrigger>
            <TabsTrigger value="cms" className="gap-2">
              <FileEdit className="h-4 w-4" />
              CMS
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleLogin} className="bg-card rounded-2xl shadow-xl p-8 border border-border animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ваш@email.com"
                className="h-12"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 pr-10"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Вхід...
                </>
              ) : (
                "Увійти"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
          <p>{FOOTER_HINT[mode]}</p>
          <a href="/" className="inline-block mt-2 text-primary hover:underline">← На головну</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
