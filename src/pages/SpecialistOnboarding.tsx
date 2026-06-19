import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getInvitationByToken, type TeamInvitation } from "@/config/teamMembersConfig";
import { getRoleDefinition } from "@/config/teamRolesConfig";
import { WelcomeStep } from "@/components/specialist-onboarding/WelcomeStep";
import { IdentityStep } from "@/components/specialist-onboarding/IdentityStep";
import { ProfileStep } from "@/components/specialist-onboarding/ProfileStep";
import { RoleReviewStep } from "@/components/specialist-onboarding/RoleReviewStep";

import { CompleteStep } from "@/components/specialist-onboarding/CompleteStep";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Demo invitation for testing without token
const DEMO_INVITATION: TeamInvitation = {
  id: "demo-invite",
  token: "DEMO-TOKEN",
  email: "demo@example.com",
  cabinetId: "1",
  cabinetName: "ТОВ «Ромашка»",
  cabinetType: "tov",
  role: "accountant",
  roleLabel: "Бухгалтер",
  accessType: "full",
  invitedBy: "user-owner",
  invitedByName: "Петренко О.В.",
  invitedByEmail: "owner@romashka.ua",
  status: "pending",
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

// Step configuration - KEP removed for members (optional, can be set up later)
const STEPS = [
  { id: "welcome", label: "Привітання" },
  { id: "identity", label: "Ідентифікація" },
  { id: "profile", label: "Профіль" },
  { id: "role", label: "Роль" },
  { id: "complete", label: "Готово" },
] as const;

type StepId = typeof STEPS[number]["id"];

// Auth method type
type AuthMethod = "kep" | "diia" | "email";

// Identity verification result
interface IdentityResult {
  method: AuthMethod;
  autoFilledData?: {
    fullName?: string;
    taxId?: string;
  };
}

// Profile form state
interface ProfileFormData {
  fullName: string;
  taxId: string;
  phone: string;
  workEmail: string;
  position: string;
}

const SpecialistOnboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const isDemo = !token;
  
  // State
  const [currentStep, setCurrentStep] = useState<StepId>("welcome");
  const [invitation, setInvitation] = useState<TeamInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [profileData, setProfileData] = useState<ProfileFormData>({
    fullName: "",
    taxId: "",
    phone: "",
    workEmail: "",
    position: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  
  // Auto-fill tracking
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [identityMethod, setIdentityMethod] = useState<AuthMethod | null>(null);
  
  // Load invitation on mount
  useEffect(() => {
    // Demo mode - use mock invitation
    if (!token) {
      setInvitation(DEMO_INVITATION);
      setProfileData(prev => ({
        ...prev,
        workEmail: DEMO_INVITATION.email,
      }));
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    const loadInvitation = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const inv = getInvitationByToken(token);
      
      if (!inv) {
        setError("Запрошення не знайдено або недійсне");
      } else if (inv.status === "expired") {
        setError("Термін дії запрошення закінчився");
      } else if (inv.status === "accepted") {
        setError("Це запрошення вже прийнято");
      } else if (inv.status === "revoked") {
        setError("Це запрошення було скасовано");
      } else {
        setInvitation(inv);
        setProfileData(prev => ({
          ...prev,
          workEmail: inv.email,
        }));
      }
      
      setIsLoading(false);
    };
    
    loadInvitation();
  }, [token]);
  
  // Get role definition
  const roleDefinition = invitation 
    ? getRoleDefinition(invitation.role, invitation.cabinetType)
    : null;
  
  // Step navigation
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  
  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };
  
  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };
  
  // Handle identity verification completion with auto-fill
  const handleIdentityComplete = (result: IdentityResult) => {
    setIdentityMethod(result.method);
    
    if (result.autoFilledData) {
      const filledFields: string[] = [];
      
      setProfileData(prev => {
        const updated = { ...prev };
        if (result.autoFilledData?.fullName) {
          updated.fullName = result.autoFilledData.fullName;
          filledFields.push("fullName");
        }
        if (result.autoFilledData?.taxId) {
          updated.taxId = result.autoFilledData.taxId;
          filledFields.push("taxId");
        }
        return updated;
      });
      
      setAutoFilledFields(filledFields);
    }
    
    goToNextStep();
  };
  
  const handleComplete = () => {
    // Navigate to dashboard with the invited cabinet selected
    navigate("/dashboard", { 
      state: { 
        activeCabinetId: invitation.cabinetId,
        tab: "overview" as const
      } 
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 space-y-4">
          <div className="rounded-lg border border-border/70 bg-card p-6 space-y-4 animate-pulse">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-3/4 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Помилка запрошення</h1>
            <p className="text-muted-foreground">{error || "Невідома помилка"}</p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => navigate("/")} className="w-full">
              Перейти на головну
            </Button>
            <p className="text-sm text-muted-foreground">
              Якщо ви вважаєте, що це помилка, зверніться до адміністратора
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <WelcomeStep 
            invitation={invitation}
            roleDefinition={roleDefinition}
            onNext={goToNextStep}
          />
        );
      case "identity":
        return (
          <IdentityStep 
            invitation={invitation}
            onNext={handleIdentityComplete}
            onBack={goToPrevStep}
          />
        );
      case "profile":
        return (
          <ProfileStep 
            invitation={invitation}
            profileData={profileData}
            onProfileChange={setProfileData}
            onNext={goToNextStep}
            onBack={goToPrevStep}
            autoFilledFields={autoFilledFields}
            authMethod={identityMethod}
          />
        );
      case "role":
        return (
          <RoleReviewStep 
            invitation={invitation}
            roleDefinition={roleDefinition}
            agreedToTerms={agreedToTerms}
            agreedToPrivacy={agreedToPrivacy}
            onAgreedToTermsChange={setAgreedToTerms}
            onAgreedToPrivacyChange={setAgreedToPrivacy}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        );
      case "complete":
        return (
          <CompleteStep 
            invitation={invitation}
            roleDefinition={roleDefinition}
            profileData={profileData}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Вийти</span>
          </Button>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-1.5">
            {isDemo && (
              <Badge variant="outline" className="mr-2 gap-1 border-amber-500/50 text-amber-700 dark:text-amber-400">
                <Play className="h-3 w-3" />
                Демо
              </Badge>
            )}
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index <= currentStepIndex 
                    ? "bg-primary w-6" 
                    : "bg-muted w-3"
                )}
              />
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {currentStepIndex + 1} / {STEPS.length}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        {renderStep()}
      </main>
    </div>
  );
};

export default SpecialistOnboarding;
