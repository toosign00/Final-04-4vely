'use client';

import { useSignUpForm } from '@/hooks/signUp/useSignUpForm';
import { Step1Data, Step2Data, Step3Data } from '@/types/auth.types';
import { memo } from 'react';
import Step1TermsAgreement from './steps/Step1TermsAgreement';
import Step2RequiredInfo from './steps/Step2RequiredInfo';
import Step3AdditionalInfo from './steps/Step3AdditionalInfo';
import WizardProgress from './WizardProgress';

const STEP_LABELS = ['약관 동의', '필수 정보 입력', '추가 정보 입력'];

function SignUpWizard() {
  const {
    // 기본 상태
    setValue,
    clearErrors,
    formState,
    isLoading,
    isEmailChecking,
    isNicknameChecking,
    emailAvailable,
    nicknameAvailable,

    // 단계 관리
    wizardState,
    saveStepData,
    validateStep,
    updateStepValidity,
    nextStep,
    prevStep,

    // 기능
    checkEmailAvailability,
    checkNicknameAvailability,
    handleSignUp,
  } = useSignUpForm();

  // Step 1 다음 단계 핸들러
  const handleStep1Next = (data: Step1Data) => {
    if (validateStep(1, data)) {
      saveStepData(1, data);
      updateStepValidity(1, true);
      nextStep();
    }
  };

  // Step 2 다음 단계 핸들러
  const handleStep2Next = (data: Step2Data) => {
    if (validateStep(2, data)) {
      saveStepData(2, data);
      updateStepValidity(2, true);
      nextStep();
    }
  };

  // Step 3 완료 핸들러
  const handleStep3Complete = async (data: Step3Data) => {
    console.log('[SignUpWizard] Step3 완료 핸들러 호출 - data:', data);
    saveStepData(3, data);
    await handleSignUp(data);
  };

  const renderCurrentStep = () => {
    switch (wizardState.currentStep) {
      case 1:
        return (
          <div key='step1'>
            <Step1TermsAgreement
              agreeTerms={wizardState.step1Data.agreeTerms ?? false}
              agreePrivacy={wizardState.step1Data.agreePrivacy ?? false}
              onAgreeTermsChange={(checked) => {
                const newData: Step1Data = {
                  agreeTerms: checked,
                  agreePrivacy: wizardState.step1Data.agreePrivacy ?? false,
                };
                saveStepData(1, newData);
                setValue('agreeTerms', checked);
                clearErrors();
              }}
              onAgreePrivacyChange={(checked) => {
                const newData: Step1Data = {
                  agreeTerms: wizardState.step1Data.agreeTerms ?? false,
                  agreePrivacy: checked,
                };
                saveStepData(1, newData);
                setValue('agreePrivacy', checked);
                clearErrors();
              }}
              onAgreeAll={(checked) => {
                const newData: Step1Data = {
                  agreeTerms: checked,
                  agreePrivacy: checked,
                };
                saveStepData(1, newData);
                setValue('agreeTerms', checked);
                setValue('agreePrivacy', checked);
                clearErrors();
              }}
              onNext={handleStep1Next}
              errors={{
                agreeTerms: formState.errors.agreeTerms?.message as string | undefined,
                agreePrivacy: formState.errors.agreePrivacy?.message as string | undefined,
              }}
            />
          </div>
        );

      case 2:
        return (
          <div key='step2'>
            <Step2RequiredInfo
              onNext={handleStep2Next}
              onPrevious={prevStep}
              initialData={wizardState.step2Data}
              isLoading={isLoading}
              checkEmailAvailability={checkEmailAvailability}
              checkNicknameAvailability={checkNicknameAvailability}
              isEmailChecking={isEmailChecking}
              isNicknameChecking={isNicknameChecking}
              emailAvailable={emailAvailable}
              nicknameAvailable={nicknameAvailable}
            />
          </div>
        );

      case 3:
        return (
          <div key='step3'>
            <Step3AdditionalInfo onComplete={handleStep3Complete} onPrevious={prevStep} initialData={wizardState.step3Data} isLoading={isLoading} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='mx-auto w-full max-w-2xl'>
      {/* Progress Indicator */}
      <WizardProgress currentStep={wizardState.currentStep} totalSteps={3} stepLabels={STEP_LABELS} />

      {/* Step Content */}
      <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8'>{renderCurrentStep()}</div>
    </div>
  );
}

export default memo(SignUpWizard);
