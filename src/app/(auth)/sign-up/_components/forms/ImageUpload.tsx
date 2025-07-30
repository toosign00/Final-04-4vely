import { Button } from '@/components/ui/Button';
import { Camera, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onChange: (file?: File) => void;
  disabled?: boolean;
  error?: string;
}

export default function ImageUpload({ onChange, disabled, error }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='group relative'>
          <div
            className={`relative h-24 w-24 cursor-pointer rounded-full border-2 border-dashed transition-all duration-200 ${preview ? 'border-green-300 bg-green-50' : 'hover:border-accent hover:bg-accent/5 border-gray-300 bg-gray-50'}`}
            onClick={handleClick}
          >
            {preview ? (
              <Image src={preview} alt='프로필' width={96} height={96} className='h-full w-full rounded-full object-cover' />
            ) : (
              <div className='flex h-full w-full items-center justify-center'>
                <div className='text-center'>
                  <Camera className='mx-auto mb-1 h-6 w-6 text-gray-400' />
                  <p className='text-xs text-gray-500'>사진 추가</p>
                </div>
              </div>
            )}

            {/* Hover overlay */}
            {!preview && (
              <div className='bg-accent/10 absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                <Camera className='text-accent h-6 w-6' />
              </div>
            )}
          </div>

          {preview && (
            <Button type='button' variant='destructive' size='icon' className='absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-lg' onClick={handleRemove} disabled={disabled}>
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>

        <div className='space-y-1 text-center'>
          <Button type='button' variant='outline' size='sm' onClick={handleClick} disabled={disabled} className='text-sm'>
            {preview ? '사진 변경' : '사진 선택'}
          </Button>
          <p className='text-xs text-gray-500'>JPG, PNG 파일만 가능 (최대 5MB)</p>
        </div>
      </div>

      <input ref={fileInputRef} type='file' accept='image/*' onChange={handleFileSelect} className='hidden' disabled={disabled} />

      {error && (
        <div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
          <svg className='h-4 w-4 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
