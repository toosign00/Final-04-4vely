'use client';

import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function WizardProgress({ currentStep, totalSteps, stepLabels }: WizardProgressProps) {
  return (
    <div className='mx-auto mb-8 w-full max-w-md'>
      {/* Progress Bar */}
      <div className='mb-4 flex items-center justify-center gap-2'>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div key={step} className='flex items-center'>
              {/* Step Circle */}
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-primary border-primary text-secondary' : isCurrent ? 'bg-accent border-accent text-white' : 'border-gray-300 bg-gray-100 text-gray-400'
                } `}
              >
                {isCompleted ? (
                  <div>
                    <Check className='h-4 w-4' />
                  </div>
                ) : (
                  <span className='text-xs font-medium'>{step}</span>
                )}
              </div>

              {/* Connector Line */}
              {index < totalSteps - 1 && <div className={`mx-1 h-1 w-8 rounded-full transition-all duration-500 ${isCompleted || (isCurrent && index + 1 < currentStep) ? 'bg-primary' : 'bg-gray-300'} `} />}
            </div>
          );
        })}
      </div>

      {/* Step Label */}
      <div className='text-center'>
        <p className='text-sm font-medium text-gray-700'>{stepLabels[currentStep - 1]}</p>
      </div>
    </div>
  );
}
