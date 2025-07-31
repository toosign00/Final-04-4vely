'use client';

import { useSignUpStore } from '@/store/signUpStore';
import { Loader2 } from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import WizardProgress from '../_components/common/WizardProgress';
import PersonalInfoStep from '../_components/steps/PersonalInfoStep';
import ProfileSetupStep from '../_components/steps/ProfileSetupStep';
import TermsAgreementStep from '../_components/steps/TermsAgreementStep';

const STEP_COMPONENTS = {
  1: TermsAgreementStep,
  2: PersonalInfoStep,
  3: ProfileSetupStep,
} as const;

interface SignUpStepClientProps {
  stepNumber: number;
}

export default function SignUpStepClient({ stepNumber }: SignUpStepClientProps) {
  const router = useRouter();
  const store = useSignUpStore();
  const { currentStep, setCurrentStep, isStepUnlocked, isRedirecting } = store;

  // 접근 제어 로직
  useEffect(() => {
    // 리디렉션 중일 때는 접근 제어 로직 스킵
    if (isRedirecting) {
      return;
    }

    // 스토어가 완전히 초기화될 때까지 대기
    if (!store || !isStepUnlocked || typeof isStepUnlocked !== 'function') {
      return;
    }

    const isUnlocked = isStepUnlocked(stepNumber);

    if (!isUnlocked) {
      // 잠긴 단계 접근 시 step-1로 리디렉션
      router.replace('/sign-up/step-1');
      return;
    }

    // 현재 단계를 스토어에 동기화
    if (currentStep !== stepNumber) {
      setCurrentStep(stepNumber);
    }
  }, [stepNumber, isStepUnlocked, currentStep, setCurrentStep, router, store, isRedirecting]);

  // 현재 단계에 맞는 컴포넌트 가져오기
  const StepComponent = STEP_COMPONENTS[stepNumber as keyof typeof STEP_COMPONENTS];

  if (!StepComponent) {
    notFound();
  }

  // 리디렉션 중일 때 로딩 UI 표시
  if (isRedirecting) {
    return (
      <div className='w-full max-w-2xl'>
        <div className='flex flex-col items-center justify-center py-16'>
          <Loader2 className='text-primary h-8 w-8 animate-spin' />
          <p className='mt-4 text-lg text-gray-600'>회원가입 완료! 로그인 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-2xl'>
      <WizardProgress currentStep={stepNumber} totalSteps={3} stepLabels={['약관 동의', '회원 정보 입력', '추가 정보 입력']} />

      <div className='mt-8'>
        <StepComponent />
      </div>
    </div>
  );
}
