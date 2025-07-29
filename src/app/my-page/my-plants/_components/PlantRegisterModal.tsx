'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { createPlant } from '@/lib/actions/plantActions';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

/**
 * 식물 등록 모달 컴포넌트의 Props 인터페이스
 * @interface PlantRegisterModalProps
 */
interface PlantRegisterModalProps {
  /** 모달 열림/닫힘 상태 */
  open: boolean;
  /** 모달 닫기 콜백 함수 */
  onClose: () => void;
  /** 식물 등록 성공 시 실행될 콜백 함수 (선택사항) */
  onSuccess?: () => void;
}

/**
 * 식물 등록 폼 데이터 인터페이스
 * @interface FormData
 */
interface FormData {
  /** 식물 별명 (1-20자) */
  name: string;
  /** 식물 종/품종 (1-30자) */
  species: string;
  /** 식물 위치 (1-20자) */
  location: string;
  /** 분양일 (YYYY-MM-DD 형식) */
  date: string;
  /** 식물 메모 제목 (1-50자) */
  memoTitle: string;
  /** 식물 메모 (1-200자) */
  memo: string;
}

/**
 * 새로운 식물을 등록하는 모달 컴포넌트
 * @description 식물의 기본 정보(별명, 종, 위치, 분양일, 메모)와 이미지를 입력받아 새 식물을 등록
 * @component PlantRegisterModal
 * @param {PlantRegisterModalProps} props - 컴포넌트 props
 * @returns {JSX.Element} 식물 등록 모달 JSX
 * @performance React.memo로 최적화, useCallback으로 함수 메모이제이션
 * @features 이미지 업로드, 실시간 유효성 검사, 로딩 상태 관리, 에러 처리
 */
const PlantRegisterModal = memo(function PlantRegisterModal({ open, onClose, onSuccess }: PlantRegisterModalProps) {
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // 파일 input 참조 (DOM 직접 접근용)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 폼 상태 관리 (react-hook-form)
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      species: '',
      location: '',
      date: '',
      memoTitle: '',
      memo: '',
    },
    mode: 'onBlur', // 블러 시 유효성 검사
  });

  /**
   * 이미지 파일 선택 시 처리하는 핸들러
   * @description 파일 크기, 타입 유효성 검사 후 미리보기 URL 생성
   * @param {React.ChangeEvent<HTMLInputElement>} e - 파일 input 변경 이벤트
   * @validation 5MB 이하, 이미지 파일만 허용
   * @performance useCallback으로 메모이제이션하여 불필요한 리렌더링 방지
   */
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 파일 크기 검증 (5MB = 5 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        setImageError('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 검증 (이미지 파일만 허용)
      if (!file.type.startsWith('image/')) {
        setImageError('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // 이전 미리보기 URL 메모리 해제
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // 새 파일 설정 및 미리보기 URL 생성
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageError(null);
    },
    [previewUrl],
  );

  /**
   * 이미지 업로드 영역 클릭 시 파일 선택 다이얼로그를 여는 핸들러
   * @description 숨겨진 file input을 프로그래밍적으로 클릭하여 파일 선택 UI 활성화
   * @performance useCallback으로 메모이제이션
   */
  const handleImageAreaClick = useCallback(() => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  }, [loading]);

  /**
   * 선택된 이미지를 제거하는 핸들러
   * @description 선택된 파일, 미리보기 URL, 에러 상태를 모두 초기화
   * @performance useCallback으로 메모이제이션, 메모리 누수 방지를 위한 URL.revokeObjectURL 호출
   */
  const handleImageRemove = useCallback(() => {
    // 메모리 누수 방지를 위한 이전 URL 해제
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // 상태 초기화
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageError(null);

    // 파일 input 값 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  /**
   * 폼 제출을 처리하는 핸들러
   * @description 폼 데이터 검증 후 서버 액션 호출하여 식물 등록
   * @param {FormData} data - react-hook-form에서 검증된 폼 데이터
   * @throws API 호출 실패, 이미지 업로드 실패 시 에러 토스트 표시
   * @performance 로딩 상태 관리로 중복 제출 방지
   */
  const onSubmit = useCallback(
    async (data: FormData) => {
      // 이미지 필수 검증
      if (!selectedFile) {
        setImageError('식물 사진을 업로드해주세요.');
        return;
      }

      setLoading(true);

      try {
        // 서버 액션용 FormData 생성
        const formData = new globalThis.FormData();

        // 폼 데이터 추가 (trim으로 공백 제거)
        formData.append('name', data.name.trim());
        formData.append('species', data.species.trim());
        formData.append('location', data.location.trim());
        formData.append('date', data.date);
        formData.append('memoTitle', data.memoTitle.trim());
        formData.append('memo', data.memo.trim());

        // 이미지 파일 추가 (존재하는 경우에만)
        if (selectedFile) {
          formData.append('attach', selectedFile);
        }

        // 식물 등록 서버 액션 호출
        const result = await createPlant(formData);

        if (result.ok) {
          toast.success('식물이 성공적으로 등록되었습니다!', {
            duration: 3000,
          });
          // 폼과 이미지 상태 초기화
          form.reset();
          handleImageRemove();
          onClose();
          onSuccess?.(); // 부모 컴포넌트에 성공 알림
        } else {
          toast.error(result.message || '식물 등록에 실패했습니다.', {
            duration: 4000,
          });
        }
      } catch (error) {
        console.error('식물 등록 처리 중 예상치 못한 오류:', error);
        toast.error('식물 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', {
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedFile, onClose, onSuccess, form, handleImageRemove],
  );

  /**
   * 폼과 이미지 상태를 초기화하는 헬퍼 함수
   * @description react-hook-form 폼 리셋과 이미지 관련 상태 초기화를 동시에 수행
   * @performance useCallback으로 메모이제이션
   */
  const resetForm = useCallback(() => {
    form.reset();
    handleImageRemove();
  }, [form, handleImageRemove]);

  /**
   * 모달 닫기를 처리하는 핸들러
   * @description 로딩 중이 아닐 때만 폼 초기화 후 모달 닫기
   * @performance useCallback으로 메모이제이션, 로딩 중 닫기 방지로 데이터 무결성 보장
   */
  const handleClose = useCallback(() => {
    if (!loading) {
      resetForm();
      onClose();
    }
  }, [loading, resetForm, onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-3xl'>
        <DialogHeader className='pb-4'>
          <DialogTitle className='t-h4'>새 식물 등록</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* 상단: 이미지 + 기본 정보 */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-center'>
              {/* 이미지 업로드 */}
              <div className='lg:col-span-2'>
                <div className='flex flex-col items-center'>
                  <div className='flex w-full flex-col'>
                    <div className='flex justify-center'>
                      <div className='flex w-56 flex-col'>
                        <label className='t-small mb-2 font-medium'>식물 사진 *</label>
                        {/* 고정 크기 컨테이너로 레이아웃 안정화 */}
                        <div className='relative h-56 w-56'>
                          <div onClick={handleImageAreaClick} className={`absolute inset-0 transition-all ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}>
                            {previewUrl ? (
                              <div className='relative h-full w-full'>
                                <Image src={previewUrl} alt='식물 미리보기' fill className='rounded-2xl border-2 border-gray-200 object-cover shadow-lg' />
                                <button
                                  type='button'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageRemove();
                                  }}
                                  className='absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white shadow-lg transition-colors hover:bg-red-600'
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className={`flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors ${loading ? 'opacity-50' : 'hover:bg-gray-100'}`}>
                                <Plus className='mb-2 h-8 w-8 text-gray-400' />
                                <span className='t-desc text-center text-sm font-medium text-gray-500'>사진 추가</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* 에러 메시지 고정 높이 영역 */}
                        <div className='mt-2 h-5 w-full'>{imageError && <p className='text-error px-2 text-xs leading-5'>{imageError}</p>}</div>
                      </div>
                    </div>
                    <input ref={fileInputRef} type='file' accept='image/*' onChange={handleImageChange} disabled={loading} className='hidden' />
                  </div>
                </div>
              </div>

              {/* 기본 정보 필드들 */}
              <div className='flex flex-col justify-center space-y-5 lg:col-span-3'>
                {/* 식물 별명 & 식물명 */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    rules={{
                      required: '식물 별명을 입력해주세요.',
                      minLength: {
                        value: 1,
                        message: '식물 별명을 입력해주세요.',
                      },
                      maxLength: {
                        value: 20,
                        message: '식물 별명은 20자 이하로 입력해주세요.',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className='min-h-[5.25rem]'>
                        <FormLabel className='t-small font-medium'>식물 별명 *</FormLabel>
                        <FormControl>
                          <Input placeholder='예: 초록이' disabled={loading} className='h-11' maxLength={20} {...field} />
                        </FormControl>
                        <div className='mt-1 h-5'>
                          <FormMessage className='text-error text-xs leading-5' />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='species'
                    rules={{
                      required: '식물명을 입력해주세요.',
                      minLength: {
                        value: 1,
                        message: '식물명을 입력해주세요.',
                      },
                      maxLength: {
                        value: 30,
                        message: '식물명은 30자 이하로 입력해주세요.',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className='min-h-[5.25rem]'>
                        <FormLabel className='t-small font-medium'>식물명 *</FormLabel>
                        <FormControl>
                          <Input placeholder='예: 몬스테라' disabled={loading} className='h-11' maxLength={30} {...field} />
                        </FormControl>
                        <div className='mt-1 h-5'>
                          <FormMessage className='text-error text-xs leading-5' />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* 식물 위치 & 분양일 */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='location'
                    rules={{
                      required: '식물 위치를 입력해주세요.',
                      minLength: {
                        value: 1,
                        message: '식물 위치를 입력해주세요.',
                      },
                      maxLength: {
                        value: 20,
                        message: '식물 위치는 20자 이하로 입력해주세요.',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className='min-h-[5.25rem]'>
                        <FormLabel className='t-small font-medium'>식물 위치 *</FormLabel>
                        <FormControl>
                          <Input placeholder='예: 거실' disabled={loading} className='h-11' maxLength={20} {...field} />
                        </FormControl>
                        <div className='mt-1 h-5'>
                          <FormMessage className='text-error text-xs leading-5' />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='date'
                    rules={{
                      required: '분양일을 선택해주세요.',
                    }}
                    render={({ field }) => (
                      <FormItem className='min-h-[5.25rem]'>
                        <FormLabel className='t-small font-medium'>분양일 *</FormLabel>
                        <FormControl>
                          <Input type='date' disabled={loading} className='h-11' {...field} />
                        </FormControl>
                        <div className='mt-1 h-5'>
                          <FormMessage className='text-error text-xs leading-5' />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 메모 (전체 너비) */}
            <div className='space-y-5 border-t border-gray-100 pt-6'>
              {/* 메모 제목 */}
              <FormField
                control={form.control}
                name='memoTitle'
                rules={{
                  required: '메모 제목을 입력해주세요.',
                  minLength: {
                    value: 1,
                    message: '메모 제목을 입력해주세요.',
                  },
                  maxLength: {
                    value: 50,
                    message: '메모 제목은 50자 이하로 입력해주세요.',
                  },
                }}
                render={({ field }) => (
                  <FormItem className='min-h-[5.25rem]'>
                    <FormLabel className='t-small font-medium'>메모 제목 *</FormLabel>
                    <FormControl>
                      <Input placeholder='예: 처음 만난 우리 식물' disabled={loading} className='h-11' maxLength={50} {...field} />
                    </FormControl>
                    <div className='mt-1 h-5'>
                      <FormMessage className='text-error text-xs leading-5' />
                    </div>
                  </FormItem>
                )}
              />

              {/* 메모 내용 */}
              <FormField
                control={form.control}
                name='memo'
                rules={{
                  required: '메모를 입력해주세요.',
                  minLength: {
                    value: 1,
                    message: '메모를 입력해주세요.',
                  },
                  maxLength: {
                    value: 200,
                    message: '메모는 200자 이하로 입력해주세요.',
                  },
                }}
                render={({ field }) => (
                  <FormItem className='min-h-[5.25rem]'>
                    <FormLabel className='t-small font-medium'>메모 *</FormLabel>
                    <FormControl>
                      <Input placeholder='식물에 대한 간단한 메모를 작성해주세요' disabled={loading} className='h-11' maxLength={200} {...field} />
                    </FormControl>
                    <div className='mt-1 h-5'>
                      <FormMessage className='text-error text-xs leading-5' />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* 버튼 */}
            <DialogFooter className='flex gap-3 border-t border-gray-100 pt-4'>
              <Button type='button' variant='outline' onClick={handleClose} disabled={loading}>
                취소
              </Button>
              <Button type='submit' variant='primary' disabled={loading}>
                {loading ? '등록 중...' : '등록하기'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export default PlantRegisterModal;
