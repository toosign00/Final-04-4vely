import { notFound } from 'next/navigation';
import SignUpStepClient from './SignUpStepClient';

interface SignUpStepPageProps {
  params: Promise<{
    step: string;
  }>;
}

const STEP_MAP = {
  'step-1': 1,
  'step-2': 2,
  'step-3': 3,
} as const;

export default async function SignUpStepPage({ params }: SignUpStepPageProps) {
  const { step } = await params;
  
  // URL step을 숫자로 변환
  const stepNumber = STEP_MAP[step as keyof typeof STEP_MAP];
  
  // 유효하지 않은 step인 경우 404
  if (!stepNumber) {
    notFound();
  }

  return <SignUpStepClient stepNumber={stepNumber} />;
}

