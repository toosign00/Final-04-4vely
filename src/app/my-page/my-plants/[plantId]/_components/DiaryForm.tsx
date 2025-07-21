'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DiaryFormProps } from '../../_types/diary.types';
import { validateDiary } from '../../_utils/diaryUtils';

/**
 * 일지 폼 컴포넌트
 */
export default function DiaryForm({ initialData, onSave, onCancel, isLoading = false }: DiaryFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    images: initialData?.images || [],
  });

  // 초기 데이터 변경 시 폼 데이터 업데이트
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        images: initialData.images || [],
      });
    }
  }, [initialData]);

  // 폼 데이터 업데이트
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 이미지 변경
  const handleImagesChange = (images: typeof formData.images) => {
    setFormData((prev) => ({ ...prev, images }));
  };

  // 저장
  const handleSave = () => {
    if (!validateDiary(formData)) {
      return;
    }
    onSave(formData);
  };

  // 취소
  const handleCancel = () => {
    // 원래 데이터로 리셋
    setFormData({
      title: initialData?.title || '',
      content: initialData?.content || '',
      images: initialData?.images || [],
    });
    onCancel();
  };

  // 폼 유효성 검증
  const isFormValid = validateDiary(formData);

  return (
    <div className='space-y-4'>
      {/* 제목 입력 */}
      <div className='space-y-1'>
        <Label htmlFor='title' className='text-sm font-medium'>
          제목
        </Label>
        <Input id='title' value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder='일지 제목을 입력하세요' className='h-10' disabled={isLoading} />
      </div>

      {/* 내용 입력 */}
      <div className='space-y-1'>
        <Label htmlFor='content' className='text-sm font-medium'>
          내용
        </Label>
        <textarea
          id='content'
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder='일지 내용을 입력하세요'
          rows={4}
          disabled={isLoading}
          className='font-pretendard placeholder:text-surface0 text-secondary focus-visible:border-secondary focus-visible:ring-secondary flex w-full resize-none rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>

      {/* 이미지 업로드 */}
      <div className='space-y-1'>
        <Label className='text-sm font-medium'>이미지</Label>
        <div className='space-y-2'>
          {/* 현재 이미지들 미리보기 */}
          {formData.images.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {formData.images.map((image, index) => (
                <div key={index} className='relative inline-block'>
                  <Image src={typeof image === 'string' ? image : image.src} alt={`이미지 ${index + 1}`} width={80} height={80} className='h-20 w-20 rounded-lg object-cover' />
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0'
                    onClick={() => {
                      const updatedImages = formData.images.filter((_, i) => i !== index);
                      handleImagesChange(updatedImages);
                    }}
                    disabled={isLoading}
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 이미지 업로드 버튼 */}
          <div>
            <input
              type='file'
              id='image-upload'
              accept='image/*'
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                // 파일 크기 검증 (5MB 제한)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                  alert('파일 크기는 5MB를 초과할 수 없습니다.');
                  return;
                }

                // 파일 타입 검증
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                  alert('지원되는 이미지 형식: JPEG, PNG, GIF, WebP');
                  return;
                }

                // 최대 이미지 개수 검증
                if (formData.images.length >= 10) {
                  alert('최대 10개의 이미지만 업로드할 수 있습니다.');
                  return;
                }

                // TODO: 실제 구현에서는 서버로 파일 업로드
                // 현재는 임시로 파일 이름을 URL로 사용
                const imageUrl = `/images/${file.name}`;
                const updatedImages = [...formData.images, imageUrl];
                handleImagesChange(updatedImages);
              }}
              className='hidden'
              disabled={isLoading}
            />
            <Button type='button' variant='default' size='sm' onClick={() => document.getElementById('image-upload')?.click()} className='flex items-center gap-2' disabled={isLoading || formData.images.length >= 10}>
              <Upload className='h-4 w-4' />
              이미지 업로드
            </Button>

            {/* 업로드 제한 안내 */}
            {formData.images.length > 0 && <p className='mt-1 text-xs text-gray-500'>{formData.images.length}/10 이미지 업로드됨</p>}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className='flex justify-end gap-2 pt-4'>
        <Button variant='default' size='sm' onClick={handleCancel} disabled={isLoading}>
          취소
        </Button>
        <Button variant='primary' size='sm' onClick={handleSave} disabled={!isFormValid || isLoading}>
          {isLoading ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}
