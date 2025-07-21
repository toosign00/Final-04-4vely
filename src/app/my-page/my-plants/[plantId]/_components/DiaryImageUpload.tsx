'use client';

import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { DiaryImageUploadProps } from '../../_types/diary.types';

interface DiaryImageUploadComponentProps extends DiaryImageUploadProps {
  disabled?: boolean;
}

/**
 * 일지 이미지 업로드 컴포넌트
 */
export default function DiaryImageUpload({ images, onImagesChange, maxImages = 10, disabled = false }: DiaryImageUploadComponentProps) {
  // 이미지 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    if (images.length >= maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    // TODO: 실제 구현에서는 서버로 파일 업로드
    // 현재는 임시로 파일 이름을 URL로 사용
    const imageUrl = `/images/${file.name}`;
    const updatedImages = [...images, imageUrl];
    onImagesChange(updatedImages);
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div className='space-y-1'>
      <Label className='text-sm font-medium'>이미지</Label>
      <div className='space-y-2'>
        {/* 현재 이미지들 미리보기 */}
        {images.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {images.map((image, index) => (
              <div key={index} className='relative inline-block'>
                <Image src={typeof image === 'string' ? image : image.src} alt={`이미지 ${index + 1}`} width={80} height={80} className='h-20 w-20 rounded-lg object-cover' />
                <Button type='button' variant='destructive' size='sm' className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0' onClick={() => removeImage(index)} disabled={disabled}>
                  <X className='h-3 w-3' />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 이미지 업로드 버튼 */}
        <div>
          <input type='file' id='image-upload' accept='image/*' onChange={handleImageUpload} className='hidden' disabled={disabled} />
          <Button type='button' variant='default' size='sm' onClick={() => document.getElementById('image-upload')?.click()} className='flex items-center gap-2' disabled={disabled || images.length >= maxImages}>
            <Upload className='h-4 w-4' />
            이미지 업로드
          </Button>

          {/* 업로드 제한 안내 */}
          {images.length > 0 && (
            <p className='mt-1 text-xs text-gray-500'>
              {images.length}/{maxImages} 이미지 업로드됨
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
