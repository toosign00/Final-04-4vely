'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { z } from 'zod';
import { FieldError } from '../ErrorDisplay';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator';

// Step2 데이터 타입 정의
export interface Step2Data {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  zipcode: string;
  address: string;
  addressDetail: string;
}

// Props 인터페이스
interface Step2RequiredInfoProps {
  onNext: (data: Step2Data) => void;
  onPrevious: () => void;
  initialData?: Partial<Step2Data>;
  isLoading?: boolean;
  checkEmailAvailability: (email: string) => Promise<void>;
  checkNicknameAvailability: (nickname: string) => Promise<void>;
  isEmailChecking?: boolean;
  isNicknameChecking?: boolean;
  emailAvailable?: boolean | null;
  nicknameAvailable?: boolean | null;
}

// 검증 스키마
const step2Schema = z
  .object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다.').max(50, '이름은 50자 이하여야 합니다.'),
    email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.'),
    confirmPassword: z.string(),
    phone: z.string().regex(/^010\d{8}$/, '휴대폰 번호는 01012345678 형식으로 입력해주세요.'),
    zipcode: z.string().min(1, '우편번호를 선택해주세요.'),
    address: z.string().min(1, '주소를 선택해주세요.'),
    addressDetail: z
      .string()
      .min(1, '상세주소를 입력해주세요.')
      .refine((val) => val.trim().length >= 5, '상세주소는 5자 이상 입력해주세요.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export default function Step2RequiredInfo({
  onNext,
  onPrevious,
  initialData = {},
  isLoading = false,
  checkEmailAvailability,
  checkNicknameAvailability,
  isEmailChecking = false,
  isNicknameChecking = false,
  emailAvailable = null,
  nicknameAvailable = null,
}: Step2RequiredInfoProps) {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<Step2Data>({
    name: initialData.name || '',
    email: initialData.email || '',
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || '',
    phone: initialData.phone || '',
    zipcode: initialData.zipcode || '',
    address: initialData.address || '',
    addressDetail: initialData.addressDetail || '',
  });

  // 유효성 검증 에러
  const [errors, setErrors] = useState<Partial<Record<keyof Step2Data, string>>>({});

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

  // 필드 변경 핸들러
  const handleFieldChange = useCallback(
    (field: keyof Step2Data, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // 에러 초기화
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      // 비밀번호 변경 시 확인 비밀번호도 재검증
      if (field === 'password' && formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    },
    [errors, formData.confirmPassword],
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
  const handleCompletePostcode = useCallback((data: { address: string; addressType: string; bname: string; buildingName: string; zonecode: string }) => {
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

    setFormData((prev) => ({
      ...prev,
      zipcode: data.zonecode,
      address: fullAddress,
    }));

    // 주소 관련 에러 초기화
    setErrors((prev) => ({ ...prev, zipcode: undefined, address: undefined }));
    setIsPostcodeOpen(false);
  }, []);

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
        const newErrors: Partial<Record<keyof Step2Data, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof Step2Data] = err.message;
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

    onNext(formData);
  }, [validateForm, emailAvailable, nicknameAvailable, formData, onNext]);

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-2xl font-bold text-gray-900'>필수 정보 입력</h2>
        <p className='text-gray-600'>회원가입을 위한 기본 정보를 입력해주세요</p>
      </div>

      <div className='space-y-6'>
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
                  value={formData.zipcode}
                  readOnly
                  aria-invalid={!!errors.zipcode}
                  className={`w-20 transition-all duration-200 sm:w-24 ${errors.zipcode ? 'border-error focus:border-error focus:ring-error' : 'focus:border-accent focus:ring-accent/20'}`}
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
            <FieldError error={errors.zipcode || errors.address} />

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
            <Button type='button' variant='outline' size='lg' onClick={onPrevious} disabled={isLoading}>
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
      </div>
    </div>
  );
}
