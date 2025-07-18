'use client';

import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Diary, DiaryCardProps } from '../../_types/diary.types';
import DiaryModal from './DiaryModal';

export default function DiaryCard({ diary, onDelete, onEdit, onUpdate }: DiaryCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updatedDiary: Diary) => {
    onUpdate?.(updatedDiary);
    onEdit?.(diary.id);
  };

  const handleDelete = () => {
    onDelete?.(diary.id);
  };

  // 이미지 배열 (실제 이미지만 표시, 최대 4개)
  const images = diary.images.slice(0, 4);

  return (
    <>
      <div className='mb-4 rounded-2xl bg-white p-4 shadow-md hover:shadow-lg'>
        {/* 헤더 */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex-1'>
            <h3 className='t-h4 text-secondary mb-1 line-clamp-2 font-bold'>{diary.title}</h3>
            <p className='t-small text-muted line-clamp-1'>{diary.date}</p>
          </div>
          <div className='flex gap-2'>
            <Button variant='default' size='sm' onClick={handleEdit}>
              수정
            </Button>
            <Button variant='destructive' size='sm' onClick={handleDelete}>
              <Trash2 className='h-4 w-4' />
              삭제
            </Button>
          </div>
        </div>

        {/* 이미지 */}
        {images.length > 0 && (
          <div className='mb-4 grid grid-cols-4 gap-2'>
            {images.map((image, index) => (
              <div key={index} className='relative aspect-square overflow-hidden rounded-lg'>
                <Image
                  src={image}
                  alt={`일지 이미지 ${index + 1}`}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw'
                  priority={index === 0} // 첫 번째 이미지에만 priority 적용
                />
              </div>
            ))}
          </div>
        )}

        {/* 메모 */}
        <div className='rounded-lg bg-gray-50 p-4'>
          <p className='t-body text-secondary leading-relaxed whitespace-pre-wrap'>{diary.content}</p>
        </div>
      </div>

      {/* 수정 모달 */}
      <DiaryModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} diary={diary} onSave={handleEditSave} mode='edit' plantId={diary.plantId} />
    </>
  );
}
