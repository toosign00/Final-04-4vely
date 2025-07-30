'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { UseFormReturn } from 'react-hook-form';
import ImageUpload from './ImageUpload';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface FormErrors {
  [key: string]: { message?: string } | undefined;
}

interface SignUpFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  error: string | null;
  fieldErrors?: FormErrors;
  isEmailChecking: boolean;
  isNicknameChecking: boolean;
  emailAvailable: boolean | null;
  nicknameAvailable: boolean | null;
  togglePasswordVisibility: () => void;
  toggleConfirmPasswordVisibility: () => void;
  clearErrors: () => void;
  checkEmailAvailability: (email: string) => void;
  checkNicknameAvailability: (nickname: string) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  getPasswordStrength: (password: string) => { score: number; text: string; color: string };
  handleNameChange: (value: string) => void;
  handleEmailChange: (value: string) => void;
  handlePasswordChange: (value: string) => void;
  handleConfirmPasswordChange: (value: string) => void;
  handlePhoneChange: (value: string) => void;
  handleAddressDetailChange: (value: string) => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function SignUpForm({
  form,
  showPassword,
  showConfirmPassword,
  isLoading,
  error,
  isEmailChecking,
  isNicknameChecking,
  emailAvailable,
  nicknameAvailable,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  clearErrors,
  checkEmailAvailability,
  checkNicknameAvailability,
  onSubmit,
  getPasswordStrength,
  handleNameChange,
  handleEmailChange,
  handlePasswordChange,
  handleConfirmPasswordChange,
  handlePhoneChange,
  handleAddressDetailChange,
  showBackButton = false,
  onBack,
}: SignUpFormProps) {
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  const password = form.watch('password') as string;
  const passwordStrength = getPasswordStrength(password || '');

  const handleCompletePostcode = (data: { address: string; addressType: string; bname: string; buildingName: string; zonecode: string }) => {
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

    form.setValue('zipcode', data.zonecode);
    form.setValue('address', fullAddress);
    setIsPostcodeOpen(false);
  };

  const formErrors = form.formState.errors;

  return (
    <div className='w-full'>
      <form onSubmit={onSubmit} className='flex w-full flex-col justify-center space-y-6 sm:space-y-8' noValidate role='form' aria-label='회원가입 양식'>
        {/* API 에러 메시지 표시 */}
        {error && (
          <div
            role='alert'
            aria-live='polite'
            aria-atomic='true'
            className='focus-within:ring-opacity-50 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 focus-within:ring-2 focus-within:ring-red-500'
            tabIndex={-1}
          >
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100' aria-hidden='true'>
              <svg className='h-3 w-3 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='flex-1'>
              <strong className='mb-1 block font-medium'>오류가 발생했습니다</strong>
              {error}
            </div>
          </div>
        )}

        {/* 프로필 이미지 업로드 */}
        <div className='space-y-3'>
          <div className='flex w-full items-center justify-center'>
            <div className='text-center'>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>프로필 설정</h3>
              <p className='mb-4 text-sm text-gray-600'>선택사항입니다</p>
            </div>
          </div>
          <ImageUpload onChange={(value) => form.setValue('image', value)} disabled={isLoading} error={formErrors.image?.message as string} />
          <div className='mt-1 flex min-h-[1.5rem] items-start'>
            {formErrors.image && (
              <p role='alert' className='text-sm text-red-600'>
                {String(formErrors.image?.message || '')}
              </p>
            )}
          </div>
        </div>

        {/* 이름 입력 */}
        <div>
          <div className='space-y-1'>
            <label htmlFor='name' className='block text-sm font-semibold text-gray-900'>
              이름 <span className='text-red-500'>*</span>
            </label>
            <p className='text-xs text-gray-600'>다른 사용자에게 보여질 닉네임입니다</p>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2'>
            <Input
              id='name'
              type='text'
              placeholder='이름을 입력하세요'
              disabled={isLoading}
              value={(form.watch('name') as string) || ''}
              onChange={(e) => {
                handleNameChange(e.target.value);
                clearErrors();
              }}
              aria-invalid={!!formErrors.name}
              aria-describedby={formErrors.name ? 'name-error' : 'name-status'}
              className={`transition-all duration-200 sm:flex-1 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <Button
              type='button'
              onClick={() => checkNicknameAvailability((form.watch('name') as string) || '')}
              disabled={isNicknameChecking || !(form.watch('name') as string)}
              className='w-full transition-all duration-200 hover:shadow-md sm:w-auto sm:whitespace-nowrap'
              variant={isNicknameChecking ? 'secondary' : 'outline'}
            >
              {isNicknameChecking ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  확인 중...
                </>
              ) : (
                <>
                  <svg className='mr-2 h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  중복 확인
                </>
              )}
            </Button>
          </div>
          <div className='mt-2 flex min-h-[1.5rem] items-start'>
            {!isNicknameChecking && nicknameAvailable === true && (
              <div className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700'>
                <svg className='h-4 w-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span id='name-status'>사용 가능한 닉네임입니다.</span>
              </div>
            )}
            {!isNicknameChecking && nicknameAvailable === false && (
              <div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                <svg className='h-4 w-4 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                </svg>
                <span id='name-status'>이미 사용 중인 닉네임입니다.</span>
              </div>
            )}
            {formErrors.name && (
              <div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                <svg className='h-4 w-4 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                </svg>
                <span id='name-error' role='alert'>
                  {String(formErrors.name?.message || '')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 이메일 입력 */}
        <div>
          <div className='space-y-1'>
            <label htmlFor='email' className='block text-sm font-semibold text-gray-900'>
              이메일 <span className='text-red-500'>*</span>
            </label>
            <p className='text-xs text-gray-600'>로그인 시 사용할 이메일 주소입니다</p>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2'>
            <Input
              id='email'
              type='email'
              placeholder='이메일을 입력하세요'
              autoComplete='email'
              disabled={isLoading}
              value={(form.watch('email') as string) || ''}
              onChange={(e) => {
                handleEmailChange(e.target.value);
                clearErrors();
              }}
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? 'email-error' : 'email-status'}
              className={`transition-all duration-200 sm:flex-1 ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <Button
              type='button'
              onClick={() => checkEmailAvailability((form.watch('email') as string) || '')}
              disabled={isEmailChecking || !(form.watch('email') as string)}
              className='w-full transition-all duration-200 hover:shadow-md sm:w-auto sm:whitespace-nowrap'
              variant={isEmailChecking ? 'secondary' : 'outline'}
            >
              {isEmailChecking ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  확인 중...
                </>
              ) : (
                <>
                  <svg className='mr-2 h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  중복 확인
                </>
              )}
            </Button>
          </div>
          <div className='mt-2 flex min-h-[1.5rem] items-start'>
            {!isEmailChecking && emailAvailable === true && (
              <div className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700'>
                <svg className='h-4 w-4 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span id='email-status'>사용 가능한 이메일입니다.</span>
              </div>
            )}
            {!isEmailChecking && emailAvailable === false && (
              <div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                <svg className='h-4 w-4 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                </svg>
                <span id='email-status'>이미 사용 중인 이메일입니다.</span>
              </div>
            )}
            {formErrors.email && (
              <div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                <svg className='h-4 w-4 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                </svg>
                <span id='email-error' role='alert'>
                  {String(formErrors.email?.message || '')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 비밀번호 입력 */}
        <div className='space-y-2'>
          <div className='space-y-1'>
            <label htmlFor='password' className='block text-sm font-semibold text-gray-900'>
              비밀번호 <span className='text-red-500'>*</span>
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
              value={(form.watch('password') as string) || ''}
              onChange={(e) => {
                handlePasswordChange(e.target.value);
                clearErrors();
              }}
              aria-invalid={!!formErrors.password}
              aria-describedby={formErrors.password ? 'password-error' : 'password-strength'}
              className={`transition-all duration-200 ${formErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600'
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보이기'}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </Button>
          </div>
          <div className='flex min-h-[2rem] flex-col justify-start space-y-1'>
            <PasswordStrengthIndicator password={password} strength={passwordStrength} />
            {formErrors.password && (
              <p id='password-error' role='alert' className='text-sm text-red-600'>
                {String(formErrors.password?.message || '')}
              </p>
            )}
          </div>
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label htmlFor='confirmPassword' className='mb-2 block text-sm font-semibold text-gray-900'>
            비밀번호 확인 <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              placeholder='비밀번호를 다시 입력하세요'
              type={showConfirmPassword ? 'text' : 'password'}
              disabled={isLoading}
              autoComplete='new-password'
              value={(form.watch('confirmPassword') as string) || ''}
              onChange={(e) => {
                handleConfirmPasswordChange(e.target.value);
                clearErrors();
              }}
              aria-invalid={!!formErrors.confirmPassword}
              aria-describedby={formErrors.confirmPassword ? 'confirmPassword-error' : undefined}
              className={`transition-all duration-200 ${formErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600'
              onClick={toggleConfirmPasswordVisibility}
              disabled={isLoading}
              aria-label={showConfirmPassword ? '비밀번호 확인 숨기기' : '비밀번호 확인 보이기'}
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </Button>
          </div>
          <div className='mt-1 flex min-h-[1.5rem] items-start'>
            {formErrors.confirmPassword && (
              <p id='confirmPassword-error' role='alert' className='text-sm text-red-600'>
                {String(formErrors.confirmPassword?.message || '')}
              </p>
            )}
          </div>
        </div>

        {/* 휴대폰 번호 입력 */}
        <div>
          <div className='mb-2 space-y-1'>
            <label htmlFor='phone' className='block text-sm font-semibold text-gray-900'>
              휴대폰 번호 <span className='text-red-500'>*</span>
            </label>
            <p className='text-xs text-gray-600'>&apos;-&apos; 없이 숫자만 입력해주세요 (010XXXXXXXX)</p>
          </div>
          <Input
            id='phone'
            type='tel'
            placeholder='01012345678'
            disabled={isLoading}
            autoComplete='tel'
            value={(form.watch('phone') as string) || ''}
            onChange={(e) => {
              handlePhoneChange(e.target.value);
              clearErrors();
            }}
            aria-invalid={!!formErrors.phone}
            aria-describedby={formErrors.phone ? 'phone-error' : undefined}
            className={`transition-all duration-200 ${formErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-accent focus:ring-accent/20'}`}
          />
          <div className='mt-1 flex min-h-[1.5rem] items-start'>
            {formErrors.phone && (
              <p id='phone-error' role='alert' className='text-sm text-red-600'>
                {String(formErrors.phone?.message || '')}
              </p>
            )}
          </div>
        </div>

        {/* 주소 입력 */}
        <Dialog open={isPostcodeOpen} onOpenChange={setIsPostcodeOpen}>
          <div className='space-y-4'>
            <div className='space-y-1'>
              <label htmlFor='zipcode' className='block text-sm font-semibold text-gray-900'>
                주소 <span className='text-red-500'>*</span>
              </label>
              <p className='text-xs text-gray-600'>배송을 위한 주소를 입력해주세요</p>
            </div>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2'>
              <div className='flex gap-2 sm:flex-1'>
                <Input
                  id='zipcode'
                  placeholder='우편번호'
                  disabled={isLoading}
                  value={(form.watch('zipcode') as string) || ''}
                  readOnly
                  aria-invalid={!!formErrors.zipcode}
                  aria-describedby={formErrors.zipcode ? 'zipcode-error' : undefined}
                  className={`w-20 transition-all duration-200 sm:w-24 ${formErrors.zipcode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-accent focus:ring-accent/20'}`}
                />
                <Input
                  id='address'
                  placeholder='주소를 검색하세요'
                  disabled={isLoading}
                  value={(form.watch('address') as string) || ''}
                  readOnly
                  aria-invalid={!!formErrors.address}
                  aria-describedby={formErrors.address ? 'address-error' : undefined}
                  className={`flex-1 transition-all duration-200 ${formErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-accent focus:ring-accent/20'}`}
                />
              </div>
              <DialogTrigger asChild>
                <Button type='button' disabled={isLoading} className='w-full transition-all duration-200 hover:shadow-md sm:w-auto sm:whitespace-nowrap' variant='outline'>
                  <svg className='mr-2 h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                  </svg>
                  주소 검색
                </Button>
              </DialogTrigger>
            </div>
            <div className='mt-1 flex min-h-[1.5rem] items-start'>
              {(formErrors.zipcode || formErrors.address) && (
                <p role='alert' className='text-sm text-red-600'>
                  {String(formErrors.zipcode?.message || formErrors.address?.message || '')}
                </p>
              )}
            </div>

            <label htmlFor='addressDetail' className='mb-2 block text-sm font-semibold text-gray-900'>
              상세주소 <span className='text-red-500'>*</span>
            </label>
            <Input
              id='addressDetail'
              placeholder='상세 주소를 입력하세요'
              disabled={isLoading}
              value={(form.watch('addressDetail') as string) || ''}
              onChange={(e) => {
                handleAddressDetailChange(e.target.value);
              }}
              autoComplete='address-line2'
              aria-invalid={!!formErrors.addressDetail}
              aria-describedby={formErrors.addressDetail ? 'addressDetail-error' : undefined}
              className={`transition-all duration-200 ${formErrors.addressDetail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-accent focus:ring-accent/20'}`}
            />
            <div className='mt-1 flex min-h-[1.5rem] items-start'>
              {formErrors.addressDetail && (
                <p id='addressDetail-error' role='alert' className='text-sm text-red-600'>
                  {String(formErrors.addressDetail?.message || '')}
                </p>
              )}
            </div>
          </div>
          <DialogContent className='max-w-xl overflow-hidden px-0 pt-6 pb-0'>
            <DialogHeader>
              <DialogTitle className='sr-only'>주소 검색</DialogTitle>
            </DialogHeader>
            <DaumPostcode onComplete={handleCompletePostcode} />
          </DialogContent>
        </Dialog>

        {/* 버튼 영역 */}
        <div className='space-y-4 pt-4'>
          <div className='flex gap-4'>
            {showBackButton && onBack && (
              <Button type='button' variant='outline' size='lg' onClick={onBack} disabled={isLoading} className='px-6'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                이전
              </Button>
            )}
            <Button
              type='submit'
              fullWidth
              variant='secondary'
              size='lg'
              className='h-12 transform rounded-xl text-base font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl'
              disabled={isLoading}
              aria-describedby={isLoading ? 'submit-status' : 'form-instructions'}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  <span id='submit-status'>회원가입 중...</span>
                </>
              ) : (
                <>
                  <span id='form-instructions' className='sr-only'>
                    모든 필수 정보를 입력한 후 이 버튼을 누르세요
                  </span>
                  <span>회원가입 완료</span>
                  <svg className='ml-2 h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 로그인 링크 */}
        <div className='pt-2 text-center'>
          <p className='text-sm text-gray-600'>이미 계정이 있으신가요?</p>
          <Link href='/login' className='text-accent hover:text-accent/80 hover:bg-accent/5 mt-2 inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200'>
            로그인하기
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' />
            </svg>
          </Link>
        </div>
      </form>
    </div>
  );
}
