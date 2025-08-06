'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { CreateDiaryInput, Diary, UpdateDiaryInput } from '../../_types/diary.types';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  diary?: Diary; // 수정 모드에서만 필요
  onSave: (diary: CreateDiaryInput | UpdateDiaryInput) => void;
  mode: 'create' | 'edit';
  plantId: number; // 작성 모드에서 필요
}

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function DiaryModal({ isOpen, onClose, diary, onSave, mode, plantId }: DiaryModalProps) {
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
    newImages: [] as File[], // 새로 추가할 이미지들
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // 기존 이미지들 (삭제되지 않은 것들)
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 날짜 형식 변환 함수 (YYYY.MM.DD -> YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    // 이미 올바른 형식인지 확인
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // YYYY.MM.DD 형식을 YYYY-MM-DD로 변환
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(dateString)) {
      return dateString.replace(/\./g, '-');
    }
    
    // 기타 형식은 현재 날짜로 대체
    return new Date().toISOString().split('T')[0];
  };

  // 폼 초기화 함수
  const resetForm = useCallback(() => {
    if (mode === 'edit' && diary) {
      setFormData({
        title: diary.title,
        content: diary.content,
        date: formatDateForInput(diary.date),
        newImages: [],
      });
      // 기존 이미지들 설정
      const diaryImages = diary.images || [];
      setExistingImages(diaryImages);
      setImagePreviews(diaryImages);
    } else {
      setFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        newImages: [],
      });
      setExistingImages([]);
      setImagePreviews([]);
    }
    setImageError(null);
  }, [mode, diary]);

  // 모달이 열릴 때마다 폼 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // 폼 데이터 업데이트
  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 파일 검증 함수
  const validateFiles = useCallback((files: File[], currentImageCount: number): string | null => {
    const availableSlots = MAX_IMAGES - currentImageCount;

    if (files.length > availableSlots) {
      return `최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다. (현재 ${currentImageCount}장)`;
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return '이미지 크기는 5MB 이하여야 합니다.';
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return '지원하는 이미지 형식: JPEG, PNG, WebP, GIF';
      }
    }

    return null;
  }, []);

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setImageError(null);

      if (files.length === 0) return;

      const currentImageCount = imagePreviews.length;
      const validationError = validateFiles(files, currentImageCount);

      if (validationError) {
        setImageError(validationError);
        return;
      }

      // 새 이미지들을 FormData에 추가
      setFormData((prev) => ({
        ...prev,
        newImages: [...prev.newImages, ...files],
      }));

      // 미리보기 생성
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });

      // 파일 input 초기화
      event.target.value = '';
    },
    [imagePreviews.length, validateFiles],
  );

  // 이미지 삭제 핸들러
  const handleImageRemove = useCallback(
    (index: number) => {
      // 미리보기에서 제거
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));

      if (mode === 'create') {
        // 생성 모드: 모든 이미지가 새로 추가된 것
        setFormData((prev) => ({
          ...prev,
          newImages: prev.newImages.filter((_, i) => i !== index),
        }));
      } else if (mode === 'edit') {
        // 수정 모드: 기존 이미지와 새 이미지 구분 처리
        const existingImageCount = existingImages.length;

        if (index < existingImageCount) {
          // 기존 이미지 삭제 - existingImages에서 제거
          setExistingImages((prev) => prev.filter((_, i) => i !== index));
        } else {
          // 새로 추가된 이미지 삭제 - newImages에서 제거
          const newImageIndex = index - existingImageCount;
          setFormData((prev) => ({
            ...prev,
            newImages: prev.newImages.filter((_, i) => i !== newImageIndex),
          }));
        }
      }

      setImageError(null);
    },
    [mode, existingImages.length],
  );

  // 저장 버튼 클릭 핸들러
  const handleSave = useCallback(async () => {
    setIsLoading(true);

    try {
      if (mode === 'create') {
        const diaryData: CreateDiaryInput = {
          plantId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          date: formData.date,
          images: formData.newImages.length > 0 ? formData.newImages : undefined,
        };
        await onSave(diaryData);
      } else if (mode === 'edit' && diary) {
        const diaryData: UpdateDiaryInput = {
          id: diary.id,
          plantId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          date: formData.date,
          existingImages: existingImages, // 삭제되지 않은 기존 이미지들
          newImages: formData.newImages.length > 0 ? formData.newImages : undefined, // 새로 추가할 이미지들
        };
        await onSave(diaryData);
      }

      onClose();
    } catch (error) {
      console.error('일지 저장 실패:', error);
      // 추가: 에러 상태를 사용자에게 알려주는 로직 필요
    } finally {
      setIsLoading(false);
    }
  }, [mode, plantId, formData, diary, existingImages, onSave, onClose]);

  // 취소 버튼 클릭 핸들러
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // 이미지 업로드 버튼 클릭 핸들러
  const handleUploadClick = useCallback(() => {
    document.getElementById('images')?.click();
  }, []);

  // 폼 유효성 검사
  const isFormValid = formData.title.trim() && formData.content.trim();
  const isMaxImages = imagePreviews.length >= MAX_IMAGES;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[75vh] max-w-md overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '일지 작성' : '일지 수정'}</DialogTitle>
          <DialogDescription>{mode === 'create' ? '새로운 일지를 작성해보세요.' : '일지 내용을 수정해보세요.'}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* 제목 입력 */}
          <div className='space-y-1'>
            <Label htmlFor='title' className='text-sm font-medium'>
              제목 *
            </Label>
            <Input id='title' value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder='일지 제목을 입력하세요' maxLength={50} disabled={isLoading} className='h-10' />
          </div>

          {/* 날짜 입력 */}
          <div className='space-y-1'>
            <Label htmlFor='date' className='text-sm font-medium'>
              날짜 *
            </Label>
            <Input id='date' type='date' value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} disabled={isLoading} className='h-10' />
          </div>

          {/* 내용 입력 */}
          <div className='space-y-1'>
            <Label htmlFor='content' className='text-sm font-medium'>
              내용 *
            </Label>
            <textarea
              id='content'
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder='일지 내용을 입력하세요'
              maxLength={1000}
              rows={4}
              disabled={isLoading}
              className='font-pretendard placeholder:text-surface0 text-secondary focus-visible:border-secondary focus-visible:ring-secondary flex w-full resize-none rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none disabled:opacity-50'
            />
          </div>

          {/* 이미지 업로드 */}
          <div className='space-y-1'>
            <Label htmlFor='images' className='text-sm font-medium'>
              이미지 (최대 {MAX_IMAGES}장)
            </Label>
            <p className='mt-1 text-xs text-gray-500'>최신 일지의 첫 번째 이미지가 일지의 대표 이미지로 표시됩니다</p>
            <div>
              {/* 현재 이미지들 미리보기 - 그리드 레이아웃 */}
              {imagePreviews.length > 0 && (
                <div className='my-3 grid max-w-full grid-cols-4 gap-2'>
                  {imagePreviews.map((preview, index) => (
                    <div key={`preview-${index}`} className='group relative'>
                      {/* 이미지 컨테이너 */}
                      <div className='relative w-full overflow-hidden rounded-lg' style={{ aspectRatio: '4/5' }}>
                        <Image
                          src={preview}
                          alt={`이미지 ${index + 1}`}
                          fill
                          className='object-cover'
                          sizes='80px'
                          onError={() => {
                            console.error('이미지 미리보기 로드 실패:', preview);
                          }}
                        />
                      </div>

                      {/* 삭제 버튼 */}
                      <button
                        type='button'
                        className='absolute -top-2 -right-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-white bg-red-500 p-0 opacity-90 shadow-md transition-opacity hover:bg-red-600 hover:opacity-100 disabled:opacity-50'
                        onClick={() => handleImageRemove(index)}
                        disabled={isLoading}
                        aria-label={`이미지 ${index + 1} 삭제`}
                      >
                        <X className='h-2.5 w-2.5 text-white' />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 이미지 업로드 버튼 - 항상 표시, 최대치일 때 비활성화 */}
              <div>
                <input type='file' id='images' accept={ALLOWED_IMAGE_TYPES.join(',')} multiple onChange={handleImageUpload} className='hidden' disabled={isLoading || isMaxImages} />
                <Button type='button' variant='default' size='sm' onClick={handleUploadClick} disabled={isLoading || isMaxImages} className='flex items-center gap-2'>
                  <Upload className='h-4 w-4' />
                  {`이미지 추가 (${imagePreviews.length}/${MAX_IMAGES})`}
                </Button>
              </div>

              {/* 이미지 에러 메시지 */}
              {imageError && <p className='rounded border bg-red-50 p-2 text-sm text-red-500'>{imageError}</p>}
            </div>
          </div>
        </div>

        <DialogFooter className='mt-4'>
          <Button variant='default' size='sm' onClick={handleCancel} disabled={isLoading}>
            취소
          </Button>
          <Button variant='primary' size='sm' onClick={handleSave} disabled={!isFormValid || isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
