'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Diary } from '../../_types/diary.types';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  diary?: Diary; // 수정 모드에서만 필요
  onSave: (diary: Diary) => void;
  mode: 'create' | 'edit';
  plantId: number; // 작성 모드에서 필요
}

export default function DiaryModal({ isOpen, onClose, diary, onSave, mode, plantId }: DiaryModalProps) {
  // 폼 상태 관리 (작성 모드일 때는 빈 데이터로 초기화)
  const [formData, setFormData] = useState({
    title: diary?.title || '',
    content: diary?.content || '',
    images: diary?.images || [],
  });

  // 폼 데이터 업데이트
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    const diaryData: Diary =
      mode === 'create'
        ? {
            id: Date.now(), // 임시 ID 생성
            plantId: plantId,
            title: formData.title,
            content: formData.content,
            images: formData.images,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
          }
        : {
            ...diary!,
            title: formData.title,
            content: formData.content,
            images: formData.images,
          };
    onSave(diaryData);
    onClose();
  };

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    // 원래 데이터로 리셋
    setFormData({
      title: diary?.title || '',
      content: diary?.content || '',
      images: diary?.images || [],
    });
    onClose();
  };

  // 이미지 업로드 핸들러 (placeholder)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO:실제 구현에서는 파일을 서버에 업로드하고 URL을 받아와야 함
      console.log('이미지 업로드:', file);
      // 임시로 파일 이름을 URL로 사용
      const newImageUrl = `/images/${file.name}`;
      const updatedImages = [...formData.images, newImageUrl];
      setFormData((prev) => ({ ...prev, images: updatedImages }));
    }
  };

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
              제목
            </Label>
            <Input id='title' value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder='일지 제목을 입력하세요' className='h-10' />
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
              className='font-pretendard placeholder:text-surface0 text-secondary focus-visible:border-secondary focus-visible:ring-secondary flex w-full resize-none rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none'
            />
          </div>

          {/* 이미지 업로드 */}
          <div className='space-y-1'>
            <Label htmlFor='image' className='text-sm font-medium'>
              이미지
            </Label>
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
                          setFormData((prev) => ({ ...prev, images: updatedImages }));
                        }}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* 이미지 업로드 버튼 */}
              <div>
                <input type='file' id='image' accept='image/*' onChange={handleImageUpload} className='hidden' />
                <Button type='button' variant='default' size='sm' onClick={() => document.getElementById('image')?.click()} className='flex items-center gap-2'>
                  <Upload className='h-4 w-4' />
                  이미지 업로드
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='mt-4'>
          <Button variant='default' size='sm' onClick={handleCancel}>
            취소
          </Button>
          <Button variant='primary' size='sm' onClick={handleSave} disabled={!formData.title.trim() || !formData.content.trim()}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
