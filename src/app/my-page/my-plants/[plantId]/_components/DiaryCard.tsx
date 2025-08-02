'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { CreateDiaryInput, DiaryCardProps, UpdateDiaryInput } from '../../_types/diary.types';
import { formatDateString } from '../../_utils/plantUtils';
import DiaryModal from './DiaryModal';

interface DiaryCardWithPriorityProps extends DiaryCardProps {
  isPriority?: boolean;
}

export default function DiaryCard({ diary, onDelete, onEdit, onUpdate, isPriority = false }: DiaryCardWithPriorityProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updatedDiary: CreateDiaryInput | UpdateDiaryInput) => {
    onUpdate?.(updatedDiary as UpdateDiaryInput);
    onEdit?.(diary.id);
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    onDelete?.(diary.id);
  };

  // 유효한 이미지만 필터링 (최대 4개)
  const validImages = diary.images?.filter((image) => image && image.trim() !== '') || [];
  const imageCount = validImages.length;

  // 통일된 반응형 그리드 레이아웃 (이미지 개수 무관하게 동일한 그리드 사용)
  const getImageLayout = () => {
    return {
      containerClass: 'max-w-none',
      gridClass: 'grid-cols-2 md:grid-cols-4', // 모바일: 2열, 데스크톱: 4열
      aspectRatio: '4/5',
    };
  };

  const layout = getImageLayout();

  return (
    <>
      <div className='mb-4 rounded-2xl bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-lg'>
        {/* 헤더 */}
        <div className='mb-4 flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <h3 className='t-h4 text-secondary mb-1 line-clamp-2 font-bold break-words'>{diary.title}</h3>
            <p className='t-small text-muted line-clamp-1'>{formatDateString(diary.date)}</p>
          </div>
          <div className='flex flex-shrink-0 gap-2'>
            <Button variant='default' size='sm' onClick={handleEdit}>
              수정
            </Button>
            <Button variant='destructive' size='sm' onClick={handleDelete}>
              <Trash2 className='h-4 w-4' />
              삭제
            </Button>
          </div>
        </div>

        {/* 개선된 반응형 이미지 섹션 */}
        {imageCount > 0 && (
          <div className='mb-4'>
            <div className={`${layout.containerClass}`}>
              <div className={`grid ${layout.gridClass} gap-2`}>
                {validImages.map((image, index) => (
                  <div key={index} className='relative'>
                    <div className='relative w-full overflow-hidden rounded-lg' style={{ aspectRatio: layout.aspectRatio }}>
                      <Image
                        src={image}
                        alt={`일지 이미지 ${index + 1}`}
                        fill
                        className='cursor-pointer object-cover transition-transform hover:scale-105'
                        sizes='(max-width: 768px) 50vw, 25vw'
                        priority={isPriority && index === 0}
                        onClick={() => setSelectedImage(image)}
                        onError={(e) => {
                          console.error('이미지 로드 실패:', image);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 내용 */}
        <div className='rounded-lg bg-gray-50 p-4'>
          <p className='t-body text-secondary leading-relaxed whitespace-pre-wrap'>{diary.content}</p>
        </div>
      </div>

      {/* 수정 모달 */}
      <DiaryModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} diary={diary} onSave={handleEditSave} mode='edit' plantId={diary.plantId} />

      {/* 이미지 확대 모달 */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogDescription className='sr-only'>이미지 확대 보기</DialogDescription>
        <DialogContent className='flex h-auto max-h-[98vh] w-auto max-w-[98vw] items-center justify-center border-none bg-transparent p-0 shadow-none' showCloseButton={true}>
          {/* 접근성을 위한 숨겨진 제목 */}
          <DialogTitle className='sr-only'>이미지 확대 보기</DialogTitle>

          {selectedImage && (
            <div className='relative flex max-h-full max-w-full items-center justify-center'>
              <Image src={selectedImage} alt='확대된 이미지' width={1200} height={900} className='max-h-[94vh] max-w-[96vw] object-cover' priority />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
