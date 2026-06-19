import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Smartphone, Upload, Loader2, CheckCircle, ArrowLeft, QrCode, ShieldCheck, RefreshCw } from "lucide-react";
import { AuthMethod } from "@/config/onboardingConfig";
import { simulateKepAuth, simulateDiiaAuth, RegistryEntityType } from "@/lib/registryIntegration";
import { cn } from "@/lib/utils";

interface KepAuthStepProps {
  method: AuthMethod;
  onSuccess: (entityType: RegistryEntityType) => void;
  onBack: () => void;
  /** Якщо вже відомо з попереднього кроку — фіксуємо тип сутності. */
  forcedEntityType?: RegistryEntityType;
}

const QR_TIMEOUT = 60; // seconds

export const KepAuthStep = ({ method, onSuccess, onBack, forcedEntityType }: KepAuthStepProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [keyPassword, setKeyPassword] = useState("");
  const [keyFile, setKeyFile] = useState<File | null>(null);
  
  // QR timer state
  const [qrTimeLeft, setQrTimeLeft] = useState(QR_TIMEOUT);
  const [qrExpired, setQrExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Start QR timer for Diia
  useEffect(() => {
    if (method === 'diia' && !isLoading) {
      setQrTimeLeft(QR_TIMEOUT);
      setQrExpired(false);
      
      timerRef.current = setInterval(() => {
        setQrTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setQrExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [method, isLoading]);
  
  const handleKepAuth = async () => {
    if (!keyFile) return;
    
    setIsLoading(true);
    try {
      const result = await simulateKepAuth(setStatus, forcedEntityType);
      if (result.success) {
        setTimeout(() => onSuccess(result.entityType), 500);
      }
    } catch (error) {
      setStatus("Помилка автентифікації");
      setIsLoading(false);
    }
  };
  
  const handleDiiaAuth = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsLoading(true);
    try {
      const result = await simulateDiiaAuth(setStatus, forcedEntityType);
      if (result.success) {
        setTimeout(() => onSuccess(result.entityType), 500);
      }
    } catch (error) {
      setStatus("Помилка автентифікації");
      setIsLoading(false);
    }
  };
  
  const handleRefreshQr = () => {
    setQrTimeLeft(QR_TIMEOUT);
    setQrExpired(false);
    
    timerRef.current = setInterval(() => {
      setQrTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setQrExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKeyFile(file);
    }
  };
  
  // Circular progress for QR timer
  const circumference = 2 * Math.PI * 54; // radius 54
  const strokeDashoffset = circumference - (qrTimeLeft / QR_TIMEOUT) * circumference;
  
  // KEP authentication UI
  const renderKepAuth = () => (
    <div className="space-y-4 sm:space-y-5">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file" className="text-xs sm:text-sm">Файловий ключ</TabsTrigger>
          <TabsTrigger value="token" className="text-xs sm:text-sm">Токен/Смарт-карта</TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="space-y-4 mt-4">
          {/* File upload */}
          <div className="space-y-2">
            <Label className="text-sm">Файл ключа (.jks, .pfx, .pk8, .zs2)</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors",
                keyFile
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
              onClick={() => document.getElementById("key-file")?.click()}
            >
              <input
                id="key-file"
                type="file"
                accept=".jks,.pfx,.pk8,.zs2,.dat"
                className="hidden"
                onChange={handleFileChange}
              />
              {keyFile ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm truncate max-w-[200px]">{keyFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Натисніть або перетягніть файл
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="key-password" className="text-sm">Пароль ключа</Label>
            <Input
              id="key-password"
              type="password"
              placeholder="Введіть пароль"
              value={keyPassword}
              onChange={(e) => setKeyPassword(e.target.value)}
              className="h-11 sm:h-10"
            />
          </div>
          
          {/* Submit */}
          <Button
            className="w-full min-h-[48px] sm:min-h-[44px]"
            size="lg"
            disabled={!keyFile || !keyPassword || isLoading}
            onClick={handleKepAuth}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {status}
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Підписати та продовжити
              </>
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="token" className="mt-4">
          <div className="text-center py-6 sm:py-8">
            <Key className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Підключіть токен або смарт-карту
            </p>
            <Button disabled className="min-h-[48px] sm:min-h-[44px]">
              Очікування пристрою...
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
  
  // Diia authentication UI with timer
  const renderDiiaAuth = () => (
    <div className="text-center space-y-4 sm:space-y-5">
      {!isLoading ? (
        <>
          {/* QR Code with circular timer */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto">
            {/* Circular progress background */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="54"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="54"
                fill="none"
                stroke={qrExpired ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            {/* QR placeholder */}
            <div className={cn(
              "absolute inset-4 bg-muted rounded-lg flex items-center justify-center",
              qrExpired && "opacity-40"
            )}>
              <QrCode className="w-20 h-20 sm:w-24 sm:h-24 text-foreground" />
            </div>
          </div>
          
          {/* Timer text */}
          <div className="text-sm text-muted-foreground">
            {qrExpired ? (
              <span className="text-destructive">QR-код застарів</span>
            ) : (
              <span>Залишилось: {qrTimeLeft} сек</span>
            )}
          </div>
          
          {/* Polling status */}
          {!qrExpired && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-[pulse_1.5s_ease-in-out_0.3s_infinite]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-[pulse_1.5s_ease-in-out_0.6s_infinite]" />
              </span>
              Очікуємо підтвердження в Дії
            </div>
          )}
          
          {/* Refresh or continue button */}
          {qrExpired ? (
            <Button variant="outline" onClick={handleRefreshQr} className="min-h-[48px] sm:min-h-[44px]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Оновити QR-код
            </Button>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-muted-foreground">або</p>
              <Button size="lg" onClick={handleDiiaAuth} className="min-h-[48px] sm:min-h-[44px]">
                <Smartphone className="w-4 h-4 mr-2" />
                Відкрити Дія на цьому пристрої
              </Button>
            </>
          )}
        </>
      ) : (
        <div className="py-10 sm:py-12">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-base sm:text-lg font-medium">{status}</p>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              {method === 'diia' ? (
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              ) : (
                <Key className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold">
              {method === 'diia' ? 'Дія.Підпис' : 'КЕП автентифікація'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {method === 'diia'
                ? 'Скануйте QR-код у застосунку Дія'
                : 'Використайте ваш електронний підпис'}
            </p>
          </div>
          
          {/* Auth content */}
          {method === 'diia' ? renderDiiaAuth() : renderKepAuth()}
        </CardContent>
      </Card>
      
      {/* Back button */}
      <Button variant="ghost" className="mt-4 h-11 sm:h-10 min-w-[48px]" onClick={onBack} disabled={isLoading}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Обрати інший спосіб
      </Button>
    </div>
  );
};