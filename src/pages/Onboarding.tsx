import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserTypeOnboardingWizard } from "@/components/onboarding/UserTypeOnboardingWizard";
import { OnboardingWizard, type OnboardingUserType } from "@/components/onboarding/OnboardingWizard";
import type { AuthMethod } from "@/config/onboardingConfig";
import type { RegistryEntityType } from "@/lib/registryIntegration";

/**
 * Two-stage onboarding:
 *   1. UserTypeOnboardingWizard — pick user type (business / fop / individual),
 *      auth method, and intended cabinet type. Persists вибір у localStorage.
 *   2. OnboardingWizard — далі підлаштовується під вибір з кроку 1
 *      (skips auth-method, fixes entityType, varies welcome/verify/complete).
 */
const Onboarding = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"type" | "cabinet">("type");

  const handleTypeComplete = () => {
    setStage("cabinet");
  };

  const handleCabinetComplete = () => {
    localStorage.setItem("onboarding_complete", "true");
    // Партнерство — пост-онбординг опція, активується з картки у профілі кабінету
    localStorage.removeItem("partner_intent");
    navigate("/dashboard", { replace: true });
  };

  if (stage === "type") {
    return <UserTypeOnboardingWizard onComplete={handleTypeComplete} />;
  }

  // Зчитуємо вибір з першого етапу
  const storedUserType = (localStorage.getItem("user_type") || "business") as OnboardingUserType;
  const storedCabinetType = (localStorage.getItem("intended_cabinet_type") || null) as RegistryEntityType | null;

  // Метод авторизації виводимо з типу: individual → diia, інші → kep
  const preselectedAuthMethod: AuthMethod | undefined =
    storedUserType === "individual" ? "diia" : "kep";

  return (
    <OnboardingWizard
      onComplete={handleCabinetComplete}
      userType={storedUserType}
      cabinetType={storedCabinetType ?? undefined}
      preselectedAuthMethod={preselectedAuthMethod}
    />
  );
};

export default Onboarding;
