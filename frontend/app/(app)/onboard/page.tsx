'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepCalendar } from '@/components/onboard/step-calendar';
import { StepDetails } from '@/components/onboard/step-details';
import { StepEmail } from '@/components/onboard/step-email';
import { StepKnowledge } from '@/components/onboard/step-knowledge';
import { StepPhone } from '@/components/onboard/step-phone';
import { StepWebsite } from '@/components/onboard/step-website';
import { WizardLayout } from '@/components/onboard/wizard-layout';
import { ApplyThemeScript } from '@/components/theme-toggle';

interface ScrapedData {
  practiceName?: string;
  businessType?: string;
  location?: string;
  description?: string;
  services?: string[];
  hours?: string;
  phone?: string;
  email?: string;
}

interface OnboardingData {
  website?: {
    url?: string;
    scrapedData?: ScrapedData;
  };
  details?: {
    practiceName: string;
    businessType: string;
    location: string;
  };
  phone?: {
    inboundNumber: string;
    outboundNumber: string;
  };
  calendar?: {
    provider: string;
  };
  email?: {
    provider: string;
  };
}

const STORAGE_KEY = 'voira_onboarding_data';
const TOTAL_STEPS = 6;

export default function OnboardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed.data || {});
        setCurrentStep(parsed.step || 1);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: currentStep, data }));
  }, [currentStep, data]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepWebsite = (stepData?: { url?: string; scrapedData?: ScrapedData }) => {
    setData({ ...data, website: stepData });
    setCurrentStep(2);
  };

  const handleStepDetails = (stepData: {
    practiceName: string;
    businessType: string;
    location: string;
  }) => {
    setData({ ...data, details: stepData });
    setCurrentStep(3);
  };

  const handleStepKnowledge = () => {
    setCurrentStep(4);
  };

  const handleStepPhone = (stepData: { inboundNumber: string; outboundNumber: string }) => {
    setData({ ...data, phone: stepData });
    setCurrentStep(5);
  };

  const handleStepCalendar = (stepData?: { provider: string }) => {
    setData({ ...data, calendar: stepData });
    setCurrentStep(6);
  };

  const handleStepEmail = (stepData?: { provider: string }) => {
    setData({ ...data, email: stepData });
    // Clear localStorage and redirect to success page
    localStorage.removeItem(STORAGE_KEY);
    router.push('/onboard/success');
  };

  const getTenantId = () => {
    if (data.details?.practiceName) {
      return data.details.practiceName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    return 'demo';
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Website Information';
      case 2:
        return 'Practice Details';
      case 3:
        return 'Knowledge Base';
      case 4:
        return 'Phone Configuration';
      case 5:
        return 'Calendar Integration';
      case 6:
        return 'Email Integration';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Enter your website URL to automatically extract your business information (optional).';
      case 2:
        return 'Provide basic information about your practice.';
      case 3:
        return 'Upload documents to train your voice agent with your specific knowledge.';
      case 4:
        return 'Set up phone numbers for inbound and outbound voice agent calls.';
      case 5:
        return 'Connect your calendar system for appointment booking.';
      case 6:
        return 'Configure email for sending confirmations and notifications.';
      default:
        return '';
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <ApplyThemeScript />

      <WizardLayout
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        title={getStepTitle()}
        description={getStepDescription()}
        onBack={handleBack}
        canGoBack={currentStep > 1}
      >
        {currentStep === 1 && <StepWebsite onNext={handleStepWebsite} />}
        {currentStep === 2 && (
          <StepDetails
            initialData={data.website?.scrapedData || data.details}
            onNext={handleStepDetails}
          />
        )}
        {currentStep === 3 && (
          <StepKnowledge tenantId={getTenantId()} onNext={handleStepKnowledge} />
        )}
        {currentStep === 4 && <StepPhone onNext={handleStepPhone} />}
        {currentStep === 5 && <StepCalendar onNext={handleStepCalendar} />}
        {currentStep === 6 && <StepEmail onComplete={handleStepEmail} />}
      </WizardLayout>
    </div>
  );
}
