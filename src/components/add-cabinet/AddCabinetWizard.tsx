import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AddCabinetStep, AddCabinetScenario } from "@/config/addCabinetConfig";
import { AuthMethod } from "@/config/onboardingConfig";
import { RegistryData } from "@/lib/registryIntegration";
import { PersonalizationResult } from "@/lib/onboardingAI";
import { useOnboardingSwipe } from "@/hooks/use-onboarding-swipe";
import { AddCabinetProgress } from "./AddCabinetProgress";
import { SwipeIndicator } from "@/components/onboarding/SwipeIndicator";
import { ScenarioStep } from "./steps/ScenarioStep";
import { CabinetTypeStep } from "./steps/CabinetTypeStep";
import { MemberJoinStep } from "./steps/MemberJoinStep";
import { TeamInviteStep } from "./steps/TeamInviteStep";
import { AddCabinetCompleteStep } from "./steps/AddCabinetCompleteStep";
import { IntegrationsSetupStep } from "./steps/IntegrationsSetupStep";
import { SystemGuideStep } from "./steps/SystemGuideStep";

// Reuse existing onboarding components
import { AuthMethodStep } from "@/components/onboarding/steps/AuthMethodStep";
import { RegistrySyncStep } from "@/components/onboarding/steps/RegistrySyncStep";
import { VerifyDataStep } from "@/components/onboarding/steps/VerifyDataStep";
import { AIPersonalizationStep } from "@/components/onboarding/steps/AIPersonalizationStep";

interface AddCabinetWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface CabinetTypeData {
  type: 'fop' | 'tov' | 'individual' | 'fop-group';
}

export const AddCabinetWizard = ({ onComplete, onCancel }: AddCabinetWizardProps) => {
  const navigate = useNavigate();
  
  // Step state
  const [currentStep, setCurrentStep] = useState<AddCabinetStep>('scenario');
  const [completedSteps, setCompletedSteps] = useState<AddCabinetStep[]>([]);
  
  // Data state
  const [scenario, setScenario] = useState<AddCabinetScenario | null>(null);
  const [cabinetTypeData, setCabinetTypeData] = useState<CabinetTypeData | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [registryData, setRegistryData] = useState<RegistryData | null>(null);
  const [personalization, setPersonalization] = useState<PersonalizationResult | null>(null);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

  const isIndividual = cabinetTypeData?.type === 'individual';

  // Mark step as complete and navigate
  const completeStep = useCallback((step: AddCabinetStep, nextStep: AddCabinetStep) => {
    setCompletedSteps(prev => [...prev.filter(s => s !== step), step]);
    setCurrentStep(nextStep);
  }, []);

  // Go back to previous step
  const goBack = useCallback((previousStep: AddCabinetStep) => {
    setCurrentStep(previousStep);
  }, []);

  // Step handlers
  const handleScenarioSelect = (selectedScenario: AddCabinetScenario) => {
    setScenario(selectedScenario);
    if (selectedScenario === 'owner') {
      completeStep('scenario', 'cabinet-type');
    }
  };

  const handleCabinetTypeSelect = (data: CabinetTypeData) => {
    setCabinetTypeData(data);
    if (data.type === 'individual') {
      completeStep('cabinet-type', 'integrations-setup');
    } else {
      completeStep('cabinet-type', 'auth-method');
    }
  };

  const handleIntegrationsContinue = (integrations: string[]) => {
    setSelectedIntegrations(integrations);
    completeStep('integrations-setup', 'system-guide');
  };

  const handleIntegrationsSkip = () => {
    setSelectedIntegrations([]);
    completeStep('integrations-setup', 'system-guide');
  };

  const handleSystemGuideContinue = () => {
    completeStep('system-guide', 'ai-personalization');
  };

  const handleAuthMethodSelect = (method: AuthMethod) => {
    setAuthMethod(method);
    if (method === 'manual') {
      completeStep('auth-method', 'verify-data');
    } else {
      completeStep('auth-method', 'registry-sync');
    }
  };

  const handleRegistrySyncComplete = (data: RegistryData) => {
    setRegistryData(data);
    completeStep('registry-sync', 'verify-data');
  };

  const handleVerifyDataConfirm = (data: RegistryData) => {
    setRegistryData(data);
    completeStep('verify-data', 'ai-personalization');
  };

  const handlePersonalizationContinue = (result: PersonalizationResult) => {
    setPersonalization(result);
    completeStep('ai-personalization', 'team-invite');
  };

  const handleTeamInviteComplete = () => {
    completeStep('team-invite', 'complete');
  };

  const handleTeamInviteSkip = () => {
    completeStep('team-invite', 'complete');
  };

  // Navigation logic
  const canGoBack = !['scenario'].includes(currentStep);
  const canSwipeForward = currentStep === 'scenario' && scenario === 'owner';

  const getPreviousStep = (): AddCabinetStep => {
    switch (currentStep) {
      case 'cabinet-type': return 'scenario';
      case 'integrations-setup': return 'cabinet-type';
      case 'system-guide': return 'integrations-setup';
      case 'auth-method': return 'cabinet-type';
      case 'registry-sync': return 'auth-method';
      case 'verify-data': return authMethod === 'manual' ? 'auth-method' : 'registry-sync';
      case 'ai-personalization': return isIndividual ? 'system-guide' : 'verify-data';
      case 'team-invite': return 'ai-personalization';
      case 'complete': return 'team-invite';
      default: return 'scenario';
    }
  };

  // Swipe support
  const { swipeOffset, handlers } = useOnboardingSwipe({
    currentStep: currentStep as any,
    onNext: canSwipeForward ? () => completeStep('scenario', 'cabinet-type') : undefined,
    onBack: canGoBack ? () => goBack(getPreviousStep()) : undefined,
    canGoBack,
    canSwipeForward,
  });

  // Get entity type for components that need it
  const getEntityType = (): 'tov' | 'fop' => {
    if (!cabinetTypeData) return 'fop';
    return cabinetTypeData.type === 'tov' ? 'tov' : 'fop';
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'scenario':
        if (scenario === 'member') {
          return (
            <MemberJoinStep
              onBack={() => setScenario(null)}
              onComplete={onComplete}
            />
          );
        }
        return (
          <ScenarioStep
            onSelectScenario={handleScenarioSelect}
            onCancel={onCancel}
          />
        );

      case 'cabinet-type':
        return (
          <CabinetTypeStep
            onSelect={handleCabinetTypeSelect}
            onBack={() => goBack('scenario')}
          />
        );

      case 'integrations-setup':
        return (
          <IntegrationsSetupStep
            onContinue={handleIntegrationsContinue}
            onSkip={handleIntegrationsSkip}
            onBack={() => goBack('cabinet-type')}
          />
        );

      case 'system-guide':
        return (
          <SystemGuideStep
            onContinue={handleSystemGuideContinue}
          />
        );

      case 'auth-method':
        return (
          <AuthMethodStep
            onSelectMethod={handleAuthMethodSelect}
            onBack={() => goBack('cabinet-type')}
          />
        );

      case 'registry-sync':
        return (
          <RegistrySyncStep
            entityType={getEntityType()}
            onComplete={handleRegistrySyncComplete}
          />
        );

      case 'verify-data':
        if (!registryData) {
          const emptyData: RegistryData = {
            source: 'edr',
            entityType: getEntityType(),
            basic: {
              name: '',
              code: '',
              registrationDate: new Date().toISOString().split('T')[0],
              address: '',
              status: 'active',
            },
            leadership: {
              director: '',
              position: 'Директор',
            },
            tax: {
              vatPayer: false,
              taxSystem: 'simplified',
            },
            activity: {
              kveds: [],
            },
            contacts: {},
          };
          return (
            <VerifyDataStep
              data={emptyData}
              onConfirm={handleVerifyDataConfirm}
              onBack={() => goBack('auth-method')}
            />
          );
        }
        return (
          <VerifyDataStep
            data={registryData}
            onConfirm={handleVerifyDataConfirm}
            onBack={() => goBack(authMethod === 'manual' ? 'auth-method' : 'registry-sync')}
          />
        );

      case 'ai-personalization':
        if (isIndividual) {
          // For individual, create minimal registry data for AI personalization
          const individualData: RegistryData = registryData || {
            source: 'edr' as const,
            entityType: 'fop' as const,
            basic: {
              name: 'Фізична особа',
              code: '',
              registrationDate: new Date().toISOString().split('T')[0],
              address: '',
              status: 'active' as const,
            },
            leadership: { director: '', position: '' },
            tax: { vatPayer: false, taxSystem: 'simplified' as const },
            activity: { kveds: [] },
            contacts: {},
          };
          return (
            <AIPersonalizationStep
              data={individualData}
              onContinue={handlePersonalizationContinue}
            />
          );
        }
        if (!registryData) return null;
        return (
          <AIPersonalizationStep
            data={registryData}
            onContinue={handlePersonalizationContinue}
          />
        );

      case 'team-invite':
        return (
          <TeamInviteStep
            cabinetName={registryData?.basic.shortName || registryData?.basic.name || 'Новий кабінет'}
            onComplete={handleTeamInviteComplete}
            onSkip={handleTeamInviteSkip}
            onBack={() => goBack('ai-personalization')}
          />
        );

      case 'complete':
        return (
          <AddCabinetCompleteStep
            cabinetName={registryData?.basic.shortName || registryData?.basic.name || 'Новий кабінет'}
            cabinetType={cabinetTypeData?.type || 'fop'}
            personalization={personalization}
            onEnterCabinet={onComplete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-[100dvh] flex flex-col"
      {...handlers}
    >
      {/* Progress indicator */}
      <AddCabinetProgress 
        currentStep={currentStep}
        completedSteps={completedSteps}
        scenario={scenario}
      />
      
      {/* Step content with swipe transform */}
      <div 
        className="flex-1 pb-safe transition-transform duration-150 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {renderStep()}
      </div>
      
      {/* Swipe indicator for mobile */}
      <SwipeIndicator canGoBack={canGoBack} canSwipeForward={canSwipeForward} />
    </div>
  );
};
