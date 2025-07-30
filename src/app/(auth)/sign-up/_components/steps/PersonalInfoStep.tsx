'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useSignUpStore } from '@/store/signUpStore';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { z } from 'zod';
import { useSignUpForm } from '../../_hooks/useSignUpForm';
import { step2Schema } from '../../_schemas';
import type { PersonalInfoData } from '../../_types';
import { FieldError } from '../common/ErrorDisplay';
import PasswordStrengthIndicator from '../forms/PasswordStrengthIndicator';

export default function PersonalInfoStep() {
  const router = useRouter();

  // Zustand 스토어에서 상태 가져오기
  const { step2Data, setStep2Data, setStepValid, isLoading, isEmailChecking, isNicknameChecking, emailAvailable, nicknameAvailable } = useSignUpStore();

  // useSignUpForm 훅에서 중복 확인 함수들 가져오기
  const { checkEmailAvailability, checkNicknameAvailability } = useSignUpForm();

  // 폼 데이터 상태
  const [formData, setFormData] = useState<PersonalInfoData>({
    name: step2Data.name || '',
    email: step2Data.email || '',
    password: step2Data.password || '',
    confirmPassword: step2Data.confirmPassword || '',
    phone: step2Data.phone || '',
    postalCode: step2Data.postalCode || '',
    address: step2Data.address || '',
    addressDetail: step2Data.addressDetail || '',
  });

  // 유효성 검증 에러
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfoData, string>>>({});

  // UI 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  // 비밀번호 강도 계산
  const getPasswordStrength = useCallback((password: string) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const levels = [
      { score: 0, text: '', color: '' },
      { score: 1, text: '매우 약함', color: 'text-error' },
      { score: 2, text: '약함', color: 'text-orange-500' },
      { score: 3, text: '보통', color: 'text-yellow-500' },
      { score: 4, text: '강함', color: 'text-blue-500' },
      { score: 5, text: '매우 강함', color: 'text-green-500' },
    ];

    return levels[score] || levels[0];
  }, []);

  // 컴포넌트 마운트 시 스토어 데이터로 폼 초기화
  useEffect(() => {
    if (step2Data && Object.keys(step2Data).length > 0) {
      setFormData({
        name: step2Data.name || '',
        email: step2Data.email || '',
        password: step2Data.password || '',
        confirmPassword: step2Data.confirmPassword || '',
        phone: step2Data.phone || '',
        postalCode: step2Data.postalCode || '',
        address: step2Data.address || '',
        addressDetail: step2Data.addressDetail || '',
      });
    }
  }, [step2Data]);

  // 필드 변경 핸들러
  const handleFieldChange = useCallback(
    (field: keyof PersonalInfoData, value: string) => {
      const newFormData = { ...formData, [field]: value };
      setFormData(newFormData);

      // Zustand 스토어에도 업데이트
      setStep2Data(newFormData);

      // 에러 초기화
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      // 비밀번호 변경 시 확인 비밀번호도 재검증
      if (field === 'password' && formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    },
    [errors, formData, setStep2Data],
  );

  // 휴대폰 번호 형식 지정
  const handlePhoneChange = useCallback(
    (value: string) => {
      const formattedValue = value.replace(/[^0-9]/g, '').substring(0, 11);
      handleFieldChange('phone', formattedValue);
    },
    [handleFieldChange],
  );

  // 주소 검색 완료 핸들러
  const handleCompletePostcode = useCallback(
    (data: { address: string; addressType: string; bname: string; buildingName: string; zonecode: string }) => {
      let fullAddress = data.address;
      let extraAddress = '';

      if (data.addressType === 'R') {
        if (data.bname !== '') {
          extraAddress += data.bname;
        }
        if (data.buildingName !== '') {
          extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
        }
        fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
      }

      const newFormData = {
        ...formData,
        postalCode: data.zonecode,
        address: fullAddress,
      };

      setFormData(newFormData);
      setStep2Data(newFormData);

      // 주소 관련 에러 초기화
      setErrors((prev) => ({ ...prev, postalCode: undefined, address: undefined }));
      setIsPostcodeOpen(false);
    },
    [formData, setStep2Data],
  );

  // 중복 확인 핸들러
  const handleEmailCheck = useCallback(async () => {
    if (!formData.email || !z.string().email().safeParse(formData.email).success) {
      return;
    }
    await checkEmailAvailability(formData.email);
  }, [formData.email, checkEmailAvailability]);

  const handleNicknameCheck = useCallback(async () => {
    if (!formData.name || formData.name.length < 2) {
      return;
    }
    await checkNicknameAvailability(formData.name);
  }, [formData.name, checkNicknameAvailability]);

  // 폼 검증
  const validateForm = useCallback(() => {
    try {
      step2Schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof PersonalInfoData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof PersonalInfoData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  // 다음 단계로 진행
  const handleNext = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    // 중복 확인 체크
    if (emailAvailable !== true) {
      setErrors((prev) => ({ ...prev, email: '이메일 중복 확인을 완료해주세요.' }));
      return;
    }

    if (nicknameAvailable !== true) {
      setErrors((prev) => ({ ...prev, name: '닉네임 중복 확인을 완료해주세요.' }));
      return;
    }

    // 스토어에 데이터 저장 및 단계 유효성 설정
    setStep2Data(formData);
    setStepValid(2, true);

    // 다음 단계로 라우터 네비게이션
    router.push('/sign-up/step-3');
  }, [validateForm, emailAvailable, nicknameAvailable, formData, setStep2Data, setStepValid, router]);

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className='w-full'>
      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-2xl font-bold text-gray-900'>필수 정보 입력</h2>
        <p className='text-gray-600'>회원가입을 위한 기본 정보를 입력해주세요</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
        className='space-y-6 rounded-lg border border-gray-100 bg-white p-6 shadow-sm'
      >
        {/* 이름 입력 */}
        <div>
          <div className='mb-3 space-y-1'>
            <label htmlFor='name' className='block text-sm font-semibold text-gray-900'>
              이름 <span className='text-error'>*</span>
            </label>
            <p className='text-xs text-gray-600'>다른 사용자에게 보여질 닉네임입니다</p>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-2'>
            <Input
              id='name'
              type='text'
              placeholder='이름을 입력하세요'
              disabled={isLoading}
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              aria-invalid={!!errors.name}
              className={`transition-all duration-200 sm:flex-1 ${errors.name ? 'border-error focus:border-error focus:ring-error' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <Button
              type='button'
              onClick={handleNicknameCheck}
              disabled={isNicknameChecking || !formData.name}
              className='w-full transition-all duration-200 hover:shadow-md sm:w-auto sm:whitespace-nowrap'
              variant={isNicknameChecking ? 'secondary' : 'outline'}
            >
              {isNicknameChecking ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  확인 중...
                </>
              ) : (
                <>
                  <Check className='size-4' />
                  중복 확인
                </>
              )}
            </Button>
          </div>
          <FieldError
            error={errors.name}
            success={!isNicknameChecking && nicknameAvailable === true ? '사용 가능한 닉네임입니다.' : undefined}
            warning={!isNicknameChecking && nicknameAvailable === false ? '이미 사용 중인 닉네임입니다.' : undefined}
          />
        </div>

        {/* 이메일 입력 */}
        <div>
          <div className='mb-3 space-y-1'>
            <label htmlFor='email' className='block text-sm font-semibold text-gray-900'>
              이메일 <span className='text-error'>*</span>
            </label>
            <p className='text-xs text-gray-600'>로그인 시 사용할 이메일 주소입니다</p>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-2'>
            <Input
              id='email'
              type='email'
              placeholder='이메일을 입력하세요'
              autoComplete='email'
              disabled={isLoading}
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              aria-invalid={!!errors.email}
              className={`transition-all duration-200 sm:flex-1 ${errors.email ? 'border-error focus:border-error focus:ring-error' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <Button
              type='button'
              onClick={handleEmailCheck}
              disabled={isEmailChecking || !formData.email}
              className='w-full transition-all duration-200 hover:shadow-md sm:w-auto sm:whitespace-nowrap'
              variant={isEmailChecking ? 'secondary' : 'outline'}
            >
              {isEmailChecking ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  확인 중...
                </>
              ) : (
                <>
                  <Check className='size-4' />
                  중복 확인
                </>
              )}
            </Button>
          </div>
          <FieldError error={errors.email} success={!isEmailChecking && emailAvailable === true ? '사용 가능한 이메일입니다.' : undefined} warning={!isEmailChecking && emailAvailable === false ? '이미 사용 중인 이메일입니다.' : undefined} />
        </div>

        {/* 비밀번호 입력 */}
        <div className='space-y-2'>
          <div className='mb-3 space-y-1'>
            <label htmlFor='password' className='block text-sm font-semibold text-gray-900'>
              비밀번호 <span className='text-error'>*</span>
            </label>
            <p className='text-xs text-gray-600'>영문, 숫자, 특수문자를 모두 포함하여 8자 이상 입력해주세요</p>
          </div>
          <div className='relative'>
            <Input
              id='password'
              placeholder='비밀번호를 입력하세요'
              type={showPassword ? 'text' : 'password'}
              autoComplete='new-password'
              disabled={isLoading}
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              aria-invalid={!!errors.password}
              className={`transition-all duration-200 ${errors.password ? 'border-error focus:border-error focus:ring-error' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600'
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </Button>
          </div>
          <div className='flex min-h-[2rem] flex-col justify-start space-y-1'>
            <PasswordStrengthIndicator password={formData.password} strength={passwordStrength} />
            <FieldError error={errors.password} />
          </div>
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label htmlFor='confirmPassword' className='mb-3 block text-sm font-semibold text-gray-900'>
            비밀번호 확인 <span className='text-error'>*</span>
          </label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              placeholder='비밀번호를 다시 입력하세요'
              type={showConfirmPassword ? 'text' : 'password'}
              disabled={isLoading}
              autoComplete='new-password'
              value={formData.confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              aria-invalid={!!errors.confirmPassword}
              className={`transition-all duration-200 ${errors.confirmPassword ? 'border-error focus:border-error focus:ring-error' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              aria-label={showConfirmPassword ? '비밀번호 확인 숨기기' : '비밀번호 확인 보이기'}
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </Button>
          </div>
          <FieldError error={errors.confirmPassword} />
        </div>

        {/* 휴대폰 번호 입력 */}
        <div>
          <div className='mb-3 space-y-1'>
            <label htmlFor='phone' className='block text-sm font-semibold text-gray-900'>
              휴대폰 번호 <span className='text-error'>*</span>
            </label>
            <p className='text-xs text-gray-600'>&apos;-&apos; 없이 숫자만 입력해주세요 (010XXXXXXXX)</p>
          </div>
          <Input
            id='phone'
            type='tel'
            placeholder='01012345678'
            disabled={isLoading}
            autoComplete='tel'
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            aria-invalid={!!errors.phone}
            className={`transition-all duration-200 ${errors.phone ? 'border-error focus:border-error focus:ring-error' : 'focus:border-accent focus:ring-accent/20'}`}
          />
          <FieldError error={errors.phone} />
        </div>

        {/* 주소 입력 */}
        <Dialog open={isPostcodeOpen} onOpenChange={setIsPostcodeOpen}>
          <div className='space-y-4'>
            <div className='mb-3 space-y-1'>
              <label htmlFor='zipcode' className='block text-sm font-semibold text-gray-900'>
                주소 <span className='text-error'>*</span>
              </label>
              <p className='text-xs text-gray-600'>배송을 위한 주소를 입력해주세요</p>
            </div>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2'>
              <div className='flex gap-2 sm:flex-1'>
                <Input
                  id='zipcode'
                  placeholder='우편번호'
                  disabled={isLoading}
                  value={formData.postalCode}
                  readOnly
                  aria-invalid={!!errors.postalCode}
                  className={`w-20 transition-all duration-200 sm:w-24 ${errors.postalCode ? 'border-error focus:border-error focus:ring-error' : 'focus:border-accent focus:ring-accent/20'}`}
                />
                <Input
                  id='address'
                  placeholder='주소를 검색하세요'
                  disabled={isLoading}
                  value={formData.address}
                  readOnly
                  aria-invalid={!!errors.address}
                  className={`flex-1 transition-all duration-200 ${errors.address ? 'border-error focus:border-error focus:ring-error' : 'focus:border-accent focus:ring-accent/20'}`}
                />
              </div>
              <DialogTrigger asChild>
                <Button type='button' disabled={isLoading} variant='outline'>
                  <Search className='size-4' />
                  주소 검색
                </Button>
              </DialogTrigger>
            </div>
            <FieldError error={errors.postalCode || errors.address} />

            <label htmlFor='addressDetail' className='block text-sm font-semibold text-gray-900'>
              상세주소 <span className='text-error'>*</span>
            </label>
            <Input
              id='addressDetail'
              placeholder='상세 주소를 입력하세요'
              disabled={isLoading}
              value={formData.addressDetail}
              onChange={(e) => handleFieldChange('addressDetail', e.target.value)}
              autoComplete='address-line2'
              aria-invalid={!!errors.addressDetail}
              className={`transition-all duration-200 ${errors.addressDetail ? 'border-error focus:border-error focus:ring-error' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <FieldError error={errors.addressDetail} />
          </div>
          <DialogContent className='max-w-xl overflow-hidden px-0 pt-6 pb-0'>
            <DialogHeader>
              <DialogTitle className='sr-only'>주소 검색</DialogTitle>
            </DialogHeader>
            <DaumPostcode onComplete={handleCompletePostcode} />
          </DialogContent>
        </Dialog>

        {/* 버튼 영역 */}
        <div className='space-y-4 pt-6'>
          <div className='flex gap-4'>
            <Button type='button' variant='outline' size='lg' onClick={() => router.push('/sign-up/step-1')} disabled={isLoading}>
              <ArrowLeft className='size-4' />
              이전
            </Button>
            <Button type='button' onClick={handleNext} variant='primary' size='lg' disabled={isLoading} className='flex-1'>
              {isLoading ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  처리 중...
                </>
              ) : (
                <>
                  다음 단계
                  <ArrowRight className='size-4' />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
