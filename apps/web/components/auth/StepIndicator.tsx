'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  isMobile?: boolean;
}

export function StepIndicator({ steps, currentStep, isMobile = false }: StepIndicatorProps) {
  const progressPercentage = (currentStep / steps.length) * 100;

  if (isMobile) {
    return (
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text-muted">
            Paso {currentStep} de {steps.length}
          </span>
          <span className="text-sm font-bold text-primary-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="w-full bg-border rounded-full h-1 mb-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isPending = step.status === 'pending';
            const isSkipped = step.status === 'skipped';

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  {/* Step Icon */}
                  <div
                    className={cn(
                      'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                      isCompleted && 'border-success bg-success text-white',
                      isCurrent && 'border-primary-600 bg-primary-600 text-white shadow-lg scale-110',
                      isSkipped && 'border-warning bg-warning/10 text-warning',
                      isPending && 'border-border bg-surface text-text-muted'
                    )}
                  >
                    {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                    {isCurrent && <span className="text-sm font-bold">{step.id}</span>}
                    {isSkipped && <Clock className="w-4 h-4" />}
                    {isPending && <Circle className="w-4 h-4" />}
                  </div>

                  {/* Step Label */}
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium text-center max-w-20',
                      isCompleted && 'text-success',
                      isCurrent && 'text-primary-600 font-bold',
                      isSkipped && 'text-warning',
                      isPending && 'text-text-muted'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 transition-all duration-500',
                      isCompleted ? 'bg-success' : 'bg-border'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
