'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { createPlant } from '@/lib/actions/plantActions';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PlantRegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // 등록 성공 시 콜백
}

interface FormData {
  name: string;
  species: string;
  location: string;
  date: string;
  memo: string;
}

export default function PlantRegisterModal({ open, onClose, onSuccess }: PlantRegisterModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      species: '',
      location: '',
      date: '',
      memo: '',
    },
  });

  // 이미지 업로드 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setImageError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setImageError(null);
  };

  // 이미지 영역 클릭 핸들러
  const handleImageAreaClick = () => {
    fileInputRef.current?.click();
  };

  // 이미지 제거 핸들러
  const handleImageRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: FormData) => {
    // 이미지 필수 검증
    if (!selectedFile) {
      setImageError('식물 사진을 업로드해주세요.');
      return;
    }

    setLoading(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('species', data.species);
      formData.append('location', data.location);
      formData.append('memo', data.memo);
      formData.append('attach', selectedFile);

      // API 호출
      const result = await createPlant(formData);

      if (result.ok) {
        toast.success('식물이 성공적으로 등록되었습니다!');
        resetForm();
        onClose();
        onSuccess?.(); // 부모 컴포넌트에 성공 알림
      } else {
        toast.error(result.message || '식물 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('식물 등록 오류:', error);
      toast.error('식물 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    form.reset();
    handleImageRemove();
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

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
                <div className='flex flex-col items-center space-y-3'>
                  <div className='flex w-full flex-col'>
                    <div className='flex justify-center'>
                      <div className='flex w-55 flex-col'>
                        <label className='t-small mb-2 font-medium'>식물 사진 *</label>
                        <div onClick={handleImageAreaClick} className='relative cursor-pointer transition-all hover:opacity-80'>
                          {previewUrl ? (
                            <div className='relative'>
                              <Image src={previewUrl} alt='식물 미리보기' width={160} height={160} className='h-40 w-40 rounded-2xl border-2 border-gray-200 object-cover shadow-lg' />
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageRemove();
                                }}
                                className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white shadow-lg transition-colors hover:bg-red-600'
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className='flex h-55 w-55 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100'>
                              <Plus className='mb-2 h-8 w-8 text-gray-400' />
                              <span className='t-desc text-center text-sm font-medium text-gray-500'>사진 추가</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <input ref={fileInputRef} type='file' accept='image/*' onChange={handleImageChange} disabled={loading} className='hidden' />
                    <div className='flex justify-center'>
                      <div className='w-55'>
                        {imageError && <p className='text-error min-h-[1rem] px-2 text-xs leading-4'>{imageError}</p>}
                        {!imageError && <div className='min-h-[1rem]' />}
                      </div>
                    </div>
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
                      <FormItem className='min-h-20'>
                        <FormLabel className='t-small font-medium'>식물 별명 *</FormLabel>
                        <FormControl>
                          <Input placeholder='예: 초록이' disabled={loading} className='h-11' maxLength={20} {...field} />
                        </FormControl>
                        <FormMessage className='text-error mt-1 min-h-[1rem] text-xs leading-4' />
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
                      <FormItem className='min-h-20'>
                        <FormLabel className='t-small font-medium'>식물명 *</FormLabel>
                        <FormControl>
                          <Input placeholder='예: 몬스테라' disabled={loading} className='h-11' maxLength={30} {...field} />
                        </FormControl>
                        <FormMessage className='text-error mt-1 min-h-[1rem] text-xs leading-4' />
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
                      <FormItem className='min-h-20'>
                        <FormLabel className='t-small font-medium'>식물 위치 *</FormLabel>
                        <FormControl>
                          <Input placeholder='예: 거실' disabled={loading} className='h-11' maxLength={20} {...field} />
                        </FormControl>
                        <FormMessage className='text-error mt-1 min-h-[1rem] text-xs leading-4' />
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
                      <FormItem className='min-h-20'>
                        <FormLabel className='t-small font-medium'>분양일 *</FormLabel>
                        <FormControl>
                          <Input type='date' disabled={loading} className='h-11' {...field} />
                        </FormControl>
                        <FormMessage className='text-error mt-1 min-h-[1rem] text-xs leading-4' />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 메모 (전체 너비) */}
            <div className='border-t border-gray-100 pt-6'>
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
                  <FormItem className='min-h-20'>
                    <FormLabel className='t-small font-medium'>메모 *</FormLabel>
                    <FormControl>
                      <Input placeholder='식물에 대한 간단한 메모를 작성해주세요' disabled={loading} className='h-11' maxLength={200} {...field} />
                    </FormControl>
                    <FormMessage className='text-error mt-1 min-h-[1rem] text-xs leading-4' />
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
}
