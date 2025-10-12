'use client';

import { type ReactNode } from 'react';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WizardLayoutProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
  canGoBack?: boolean;
}

export function WizardLayout({
  currentStep,
  totalSteps,
  title,
  description,
  children,
  onBack,
  canGoBack = true,
}: WizardLayoutProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-fg2 text-sm">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-fg2 text-sm">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Back button - outside card for corner positioning */}
      {canGoBack && onBack && currentStep > 1 && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeftIcon size={20} className="mr-2" />
          Back
        </Button>
      )}

      <Card className="p-8">
        {/* Title and description */}
        <div className="mb-6">
          <h1 className="text-fg0 mb-2 text-3xl font-bold">{title}</h1>
          {description && <p className="text-fg2">{description}</p>}
        </div>

        {/* Step content */}
        <div>{children}</div>
      </Card>
    </div>
  );
}
