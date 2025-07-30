'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Image as ImageIcon, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

// Step3 데이터 타입 정의
export interface Step3Data {
  image?: File;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  interests?: string[];
}

// Props 인터페이스
interface Step3AdditionalInfoProps {
  onComplete: (data: Step3Data) => void;
  onPrevious: () => void;
  initialData?: Partial<Step3Data>;
  isLoading?: boolean;
}

// 성별 옵션
const GENDER_OPTIONS = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '선택 안함' },
] as const;

export default function Step3AdditionalInfo({ onComplete, onPrevious, initialData = {}, isLoading = false }: Step3AdditionalInfoProps) {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<Step3Data>({
    image: initialData.image,
    gender: initialData.gender,
    birthDate: initialData.birthDate || '',
    interests: initialData.interests || [],
  });

  // UI 상태
  const [preview, setPreview] = useState<string | null>(null);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 파일 선택 핸들러
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크 (다양한 이미지 포맷 허용)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];

    if (!allowedTypes.includes(file.type)) {
      alert('지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP, BMP, TIFF, SVG 파일을 사용해주세요.');
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setFormData((prev) => ({ ...prev, image: file }));
  }, []);

  // 이미지 제거 핸들러
  const handleRemoveImage = useCallback(() => {
    setPreview(null);
    setFormData((prev) => ({ ...prev, image: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 이미지 클릭 핸들러
  const handleImageClick = useCallback(() => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  }, [isLoading]);

  // 성별 선택 핸들러
  const handleGenderSelect = useCallback((gender: 'male' | 'female' | 'other') => {
    setFormData((prev) => ({ ...prev, gender }));
    setIsGenderDropdownOpen(false);
  }, []);

  // 생년월일 변경 핸들러
  const handleBirthDateChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, birthDate: value }));
  }, []);

  // 완료 핸들러
  const handleComplete = useCallback(() => {
    console.log('[Step3] 완료 버튼 클릭 - formData:', formData);
    onComplete(formData);
  }, [formData, onComplete]);

  const getMaxBirthDate = () => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return eighteenYearsAgo.toISOString().split('T')[0];
  };

  const selectedGender = GENDER_OPTIONS.find((option) => option.value === formData.gender);

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <h2 className='mb-2 text-2xl font-bold text-gray-900'>추가 정보 입력</h2>
        <p className='text-gray-600'>더 나은 서비스 제공을 위한 선택사항입니다</p>
      </div>

      <div className='space-y-6'>
        {/* 프로필 이미지 업로드 */}
        <div>
          <div className='mb-3 space-y-1'>
            <label className='block text-sm font-semibold text-gray-900'>
              프로필 사진 <span className='text-gray-400'>(선택사항)</span>
            </label>
            <p className='text-xs text-gray-600'>다른 사용자들에게 보여질 프로필 사진입니다</p>
          </div>

          <div className='mb-8 flex flex-col items-center space-y-2'>
            <div className='group relative'>
              <div
                className={`relative h-28 w-28 cursor-pointer rounded-full border-2 border-dashed transition-all duration-200 ${preview ? 'border-accent bg-accent/5' : 'hover:border-accent hover:bg-accent/5 border-gray-300 bg-gray-50'}`}
                onClick={handleImageClick}
              >
                {preview ? (
                  <Image src={preview} alt='프로필' width={112} height={112} className='h-full w-full rounded-full object-cover' />
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <div className='text-center'>
                      <ImageIcon className='group-hover:text-primary mx-auto mb-2 h-8 w-8 text-gray-400 transition-colors duration-200' />
                      <p className='group-hover:text-primary text-xs text-gray-500 transition-colors duration-200'>사진 추가</p>
                    </div>
                  </div>
                )}
              </div>

              {preview && (
                <Button type='button' variant='destructive' size='icon' className='absolute -top-1 -right-1 h-8 w-8 rounded-full shadow-lg' onClick={handleRemoveImage} disabled={isLoading}>
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>

            <div className='space-y-4 text-center'>
              <Button type='button' variant='default' size='sm' onClick={handleImageClick} disabled={isLoading}>
                {preview ? '사진 변경' : '사진 선택'}
              </Button>
              <p className='text-xs text-gray-500'>JPG, PNG, GIF, WebP, BMP, TIFF, SVG 파일 가능 (최대 5MB)</p>
            </div>
          </div>

          <input ref={fileInputRef} type='file' accept='image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff,image/svg+xml' onChange={handleFileSelect} className='hidden' disabled={isLoading} />
        </div>

        {/* 성별 및 생년월일 선택 */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          {/* 성별 선택 */}
          <div>
            <div className='mb-3 space-y-1'>
              <label htmlFor='gender' className='block text-sm font-semibold text-gray-900'>
                성별 <span className='text-gray-400'>(선택사항)</span>
              </label>
              <p className='text-xs text-gray-600'>맞춤형 추천을 위해 사용됩니다</p>
            </div>

            <div className='relative'>
              <Input
                id='gender'
                type='text'
                placeholder='성별을 선택해주세요'
                value={selectedGender ? `${selectedGender.label}` : ''}
                onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                readOnly
                disabled={isLoading}
                className='cursor-pointer'
              />

              {isGenderDropdownOpen && (
                <div className='absolute top-full right-0 left-0 z-10 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg'>
                  {GENDER_OPTIONS.map((option) => (
                    <Button key={option.value} type='button' variant='ghost' onClick={() => handleGenderSelect(option.value)} className='hover:bg-accent/5 w-full justify-start rounded-none text-left first:rounded-t-lg last:rounded-b-lg'>
                      <span className='flex items-center gap-2'>
                        <span>{option.label}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 생년월일 선택 */}
          <div>
            <div className='mb-3 space-y-1'>
              <label htmlFor='birthDate' className='block text-sm font-semibold text-gray-900'>
                생년월일 <span className='text-gray-400'>(선택사항)</span>
              </label>
              <p className='text-xs text-gray-600'>연령대별 맞춤 콘텐츠 제공을 위해 사용됩니다</p>
            </div>

            <Input id='birthDate' type='date' value={formData.birthDate} onChange={(e) => handleBirthDateChange(e.target.value)} max={getMaxBirthDate()} disabled={isLoading} />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className='space-y-4 pt-6'>
          <div className='flex gap-4'>
            <Button type='button' variant='outline' size='lg' onClick={onPrevious} disabled={isLoading} className='px-6'>
              <ArrowLeft className='size-4' />
              이전
            </Button>

            <Button type='button' onClick={handleComplete} variant='primary' size='lg' disabled={isLoading} className='flex-1'>
              {isLoading ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  회원가입 완료 중...
                </>
              ) : (
                <>회원가입 완료</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
