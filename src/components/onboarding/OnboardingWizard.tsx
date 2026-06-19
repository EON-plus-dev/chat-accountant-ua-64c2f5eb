import { useState, useCallback } from "react";
import { OnboardingStep, AuthMethod } from "@/config/onboardingConfig";
import { RegistryData, RegistryEntityType } from "@/lib/registryIntegration";
import { PersonalizationResult } from "@/lib/onboardingAI";
import { OnboardingProgress } from "./OnboardingProgress";
import { SwipeIndicator } from "./SwipeIndicator";
import { WelcomeStep } from "./steps/WelcomeStep";
import { AuthMethodStep } from "./steps/AuthMethodStep";
import { KepAuthStep } from "./steps/KepAuthStep";
import { RegistrySyncStep } from "./steps/RegistrySyncStep";
import { ManualEntryStep } from "./steps/ManualEntryStep";
import { VerifyDataStep } from "./steps/VerifyDataStep";
import { AIPersonalizationStep } from "./steps/AIPersonalizationStep";
import { CompleteStep } from "./steps/CompleteStep";
import { InteractiveTour } from "./InteractiveTour";
import { useOnboardingSwipe } from "@/hooks/use-onboarding-swipe";

export type OnboardingUserType = 'business' | 'fop' | 'individual';

interface OnboardingWizardProps {
  onComplete: () => void;
  /** Тип користувача з UserTypeOnboardingWizard. Визначає сценарій. */
  userType?: OnboardingUserType;
  /** Тип кабінету: 'tov' | 'fop' | 'individual'. */
  cabinetType?: RegistryEntityType;
  /** Метод авторизації, обраний на попередньому кроці. */
  preselectedAuthMethod?: AuthMethod;
}

export const OnboardingWizard = ({
  onComplete,
  userType = 'business',
  cabinetType,
  preselectedAuthMethod,
}: OnboardingWizardProps) => {
  const initialEntity: RegistryEntityType | null = cabinetType ?? null;
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(preselectedAuthMethod ?? null);
  const [entityType, setEntityType] = useState<RegistryEntityType | null>(initialEntity);
  const [registryData, setRegistryData] = useState<RegistryData | null>(null);
  const [personalization, setPersonalization] = useState<PersonalizationResult | null>(null);
  const [showTour, setShowTour] = useState(false);
  
  const markStepComplete = (step: OnboardingStep) => {
    setCompletedSteps(prev => [...prev, step]);
  };
  
  // Step handlers
  const handleWelcomeContinue = () => {
    markStepComplete('welcome');
    // Якщо метод і тип уже відомі — пропускаємо вибір методу
    if (preselectedAuthMethod && initialEntity) {
      setCurrentStep('kep-auth');
    } else {
      setCurrentStep('auth-method');
    }
  };
  
  const handleAuthMethodSelect = (method: AuthMethod) => {
    setAuthMethod(method);
    markStepComplete('auth-method');
    
    if (method === 'manual') {
      setCurrentStep('manual-entry' as OnboardingStep);
    } else {
      setCurrentStep('kep-auth');
    }
  };
  
  const handleManualEntryComplete = (data: RegistryData) => {
    setRegistryData(data);
    markStepComplete('manual-entry' as OnboardingStep);
    setCurrentStep('verify-data');
  };
  
  const handleKepAuthSuccess = (type: RegistryEntityType) => {
    setEntityType(type);
    markStepComplete('kep-auth');
    setCurrentStep('registry-sync');
  };
  
  const handleRegistrySyncComplete = useCallback((data: RegistryData) => {
    setRegistryData(data);
    markStepComplete('registry-sync');
    setCurrentStep('verify-data');
  }, []);
  
  const handleVerifyConfirm = (
    data: RegistryData,
    _agreements: { terms: boolean; dataProcessing: boolean }
  ) => {
    setRegistryData(data);
    markStepComplete('verify-data');
    setCurrentStep('ai-personalization');
  };
  
  const handleAIPersonalizationContinue = (result: PersonalizationResult) => {
    setPersonalization(result);
    markStepComplete('ai-personalization');
    setCurrentStep('complete');
  };
  
  const handleStartTour = () => {
    markStepComplete('complete');
    setShowTour(true);
  };
  
  const handleTourComplete = () => {
    setShowTour(false);
    markStepComplete('interactive-tour');
    onComplete();
  };
  
  const handleSkipTour = () => {
    markStepComplete('complete');
    onComplete();
  };
  
  // Go back handlers
  const goBack = (toStep: OnboardingStep) => {
    setCurrentStep(toStep);
  };
  
  // Swipe navigation configuration
  const canGoBack = !['welcome', 'registry-sync'].includes(currentStep);
  const canSwipeForward = currentStep === 'welcome';
  
  const getPreviousStep = (): OnboardingStep => {
    const skipAuthMethod = !!preselectedAuthMethod && !!initialEntity;
    switch (currentStep) {
      case 'auth-method': return 'welcome';
      case 'kep-auth': return skipAuthMethod ? 'welcome' : 'auth-method';
      case 'verify-data': return authMethod === 'manual' ? 'auth-method' : 'registry-sync';
      case 'ai-personalization': return 'verify-data';
      case 'complete': return 'ai-personalization';
      default: return 'welcome';
    }
  };
  
  const { swipeOffset, handlers } = useOnboardingSwipe({
    currentStep,
    onNext: currentStep === 'welcome' ? handleWelcomeContinue : undefined,
    onBack: canGoBack ? () => goBack(getPreviousStep()) : undefined,
    canGoBack,
    canSwipeForward,
  });
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onContinue={handleWelcomeContinue} userType={userType} />;
      
      case 'auth-method':
        return (
          <AuthMethodStep
            onSelectMethod={handleAuthMethodSelect}
            onBack={() => goBack('welcome')}
          />
        );
      
      case 'kep-auth':
        return authMethod ? (
          <KepAuthStep
            method={authMethod}
            onSuccess={handleKepAuthSuccess}
            onBack={() => goBack(preselectedAuthMethod && initialEntity ? 'welcome' : 'auth-method')}
            forcedEntityType={initialEntity ?? undefined}
          />
        ) : null;
      
      case 'registry-sync':
        return entityType ? (
          <RegistrySyncStep
            entityType={entityType}
            onComplete={handleRegistrySyncComplete}
          />
        ) : null;
      
      case 'manual-entry':
        return (
          <ManualEntryStep
            onComplete={handleManualEntryComplete}
            onBack={() => goBack('auth-method')}
          />
        );
      
      case 'verify-data':
        const dataToVerify = registryData || {
          source: 'edr' as const,
          entityType: 'fop' as const,
          basic: {
            name: '',
            code: '',
            address: '',
            registrationDate: new Date().toISOString().split('T')[0],
            status: 'active' as const,
          },
          leadership: {
            director: '',
            position: 'Директор',
          },
          activity: {
            kveds: [],
          },
          tax: {
            vatPayer: false,
            taxSystem: 'simplified' as const,
          },
        };
        return (
          <VerifyDataStep
            data={dataToVerify}
            onConfirm={handleVerifyConfirm}
            onBack={() => goBack(authMethod === 'manual' ? ('manual-entry' as OnboardingStep) : 'registry-sync')}
          />
        );
      
      case 'ai-personalization':
        return registryData ? (
          <AIPersonalizationStep
            data={registryData}
            onContinue={handleAIPersonalizationContinue}
          />
        ) : null;
      
      case 'complete':
        return personalization ? (
          <CompleteStep
            personalization={personalization}
            onStartTour={handleStartTour}
            onSkipTour={handleSkipTour}
            userType={userType}
          />
        ) : null;
      
      default:
        return null;
    }
  };
  
  // Show tour overlay if active
  if (showTour) {
    return (
      <InteractiveTour
        onComplete={handleTourComplete}
        onSkip={handleSkipTour}
      />
    );
  }
  
  return (
    <div 
      className="min-h-[100dvh] bg-background flex flex-col pt-safe"
      {...handlers}
    >
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b py-3 sm:py-4 px-4">
        <OnboardingProgress
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>
      
      {/* Step content with swipe transform */}
      <div 
        className="flex-1 pb-safe transition-transform duration-150 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {renderStep()}
      </div>
      
      {/* Swipe indicator */}
      <SwipeIndicator canGoBack={canGoBack} canSwipeForward={canSwipeForward} />
    </div>
  );
};
