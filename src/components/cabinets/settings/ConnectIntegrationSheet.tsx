import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink,
  Info,
  Key,
  Lock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import type { DataSource, AuthField } from "@/config/dataSourcesConfig";

interface ConnectIntegrationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: DataSource | null;
  onSuccess?: (data: Record<string, string>) => void;
}

type TestStatus = "idle" | "testing" | "success" | "error";

interface TestResult {
  status: TestStatus;
  message?: string;
  recordsFound?: number;
}

export const ConnectIntegrationSheet = ({ 
  open, 
  onOpenChange, 
  integration,
  onSuccess 
}: ConnectIntegrationSheetProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<TestResult>({ status: "idle" });

  const auth = integration?.auth;
  const isOAuth = auth?.type === "oauth";

  // Reset form when integration changes
  useMemo(() => {
    if (integration) {
      setFormData({});
      setErrors({});
      setShowPasswords({});
      setTestResult({ status: "idle" });
    }
  }, [integration?.id]);

  const validateField = (field: AuthField, value: string): string | null => {
    if (field.required && !value.trim()) {
      return `${field.label} є обов'язковим`;
    }
    if (field.validation) {
      if (field.validation.minLength && value.length < field.validation.minLength) {
        return field.validation.errorMessage || `Мінімум ${field.validation.minLength} символів`;
      }
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        return field.validation.errorMessage || `Максимум ${field.validation.maxLength} символів`;
      }
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          return field.validation.errorMessage || "Невірний формат";
        }
      }
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    auth?.fields?.forEach((field) => {
      const error = validateField(field, formData[field.name] || "");
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error on change
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
    // Reset test result on any change
    if (testResult.status !== "idle") {
      setTestResult({ status: "idle" });
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Скопійовано");
  };

  const testConnection = async () => {
    if (!validateForm()) return;

    setTestResult({ status: "testing" });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Mock responses based on integration
    if (integration?.id === "nova-poshta") {
      const apiKey = formData.apiKey || "";
      if (apiKey.length < 32) {
        setTestResult({ 
          status: "error", 
          message: "Невірний формат API-ключа. Перевірте налаштування в особистому кабінеті." 
        });
        return;
      }
    }

    if (integration?.id === "checkbox") {
      if (!formData.licenseKey?.includes("-")) {
        setTestResult({ 
          status: "error", 
          message: "Невірний формат ліцензійного ключа" 
        });
        return;
      }
    }

    // Success mock
    setTestResult({ 
      status: "success", 
      message: "З'єднання встановлено успішно",
      recordsFound: Math.floor(Math.random() * 500) + 50
    });
  };

  const handleOAuthClick = () => {
    // Mock OAuth redirect
    toast.info("Перенаправлення на сторінку авторизації...");
    
    setTimeout(() => {
      setTestResult({ 
        status: "success", 
        message: "Авторизація успішна",
        recordsFound: Math.floor(Math.random() * 200) + 20
      });
    }, 2000);
  };

  const handleSubmit = () => {
    if (testResult.status !== "success") {
      toast.error("Спочатку перевірте з'єднання");
      return;
    }
    onSuccess?.(formData);
    onOpenChange(false);
    toast.success(`${integration?.name} успішно підключено!`);
  };

  const getAuthTypeIcon = () => {
    switch (auth?.type) {
      case "oauth": return <Shield className="h-4 w-4" />;
      case "api_key": return <Key className="h-4 w-4" />;
      case "credentials": return <Lock className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const getAuthTypeLabel = () => {
    switch (auth?.type) {
      case "oauth": return "OAuth 2.0";
      case "api_key": return "API-ключ";
      case "credentials": return "Логін та пароль";
      case "token": return "Токен";
      default: return "Автентифікація";
    }
  };

  if (!integration) return null;

  const IntegrationIcon = integration.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2.5">
              <IntegrationIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-left">{integration.name}</SheetTitle>
              {integration.description && (
                <SheetDescription className="text-left mt-0.5">
                  {integration.description}
                </SheetDescription>
              )}
            </div>
          </div>

          {/* Features list */}
          {integration.features && integration.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {integration.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs font-normal">
                  {feature}
                </Badge>
              ))}
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
          <div className="space-y-5">
            {/* Auth type indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getAuthTypeIcon()}
              <span>Тип автентифікації: {getAuthTypeLabel()}</span>
            </div>

            {/* Instructions card */}
            {auth?.instructions && (
              <Card className="bg-muted/50 border-muted">
                <CardContent className="p-3 flex gap-2">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{auth.instructions}</p>
                </CardContent>
              </Card>
            )}

            {/* OAuth flow */}
            {isOAuth && (
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleOAuthClick}
                  disabled={testResult.status === "testing"}
                >
                  {testResult.status === "testing" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Авторизація...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Авторизуватись через {integration.name}
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Credentials / API Key form */}
            {!isOAuth && auth?.fields && (
              <div className="space-y-4">
                {auth.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={
                          field.type === "password" && !showPasswords[field.name] 
                            ? "password" 
                            : "text"
                        }
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className={errors[field.name] ? "border-destructive pr-20" : "pr-20"}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        {formData[field.name] && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(formData[field.name])}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {field.type === "password" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => togglePasswordVisibility(field.name)}
                          >
                            {showPasswords[field.name] ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {errors[field.name] && (
                      <p className="text-xs text-destructive">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Test connection button (for non-OAuth) */}
            {!isOAuth && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={testConnection}
                disabled={testResult.status === "testing"}
              >
                {testResult.status === "testing" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Перевіряємо з'єднання...
                  </>
                ) : testResult.status === "success" ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Перевірити ще раз
                  </>
                ) : testResult.status === "error" ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
                    Повторити перевірку
                  </>
                ) : (
                  "Перевірити з'єднання"
                )}
              </Button>
            )}

            {/* Test result */}
            {testResult.status === "success" && (
              <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                <CardContent className="p-3 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      {testResult.message}
                    </p>
                    {testResult.recordsFound !== undefined && (
                      <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                        Знайдено {testResult.recordsFound} записів
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {testResult.status === "error" && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{testResult.message}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Скасувати
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={testResult.status !== "success"}
            className="flex-1"
          >
            Підключити
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ConnectIntegrationSheet;
