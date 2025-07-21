'use client';

import { Button } from '@/components/ui/Button';
import { FileText, Plus } from 'lucide-react';
import { EmptyDiaryStateProps } from '../../_types/plant.types';

/**
 * 일지가 없을 때 표시하는 빈 상태 컴포넌트
 */
export default function EmptyDiaryState({ plantName, onWriteDiary }: EmptyDiaryStateProps) {
  return (
    <div className='flex min-h-[25rem] flex-col items-center justify-center text-center'>
      <FileText className='mx-auto mb-4 h-16 w-16 text-gray-300' />
      <h3 className='t-h3 text-secondary mb-2 font-bold'>아직 일지가 없습니다</h3>
      <p className='t-body text-muted mb-6'>{plantName}의 첫 번째 일지를 작성해보세요!</p>
      <Button variant='primary' onClick={onWriteDiary}>
        <Plus size={16} />첫 일지 작성하기
      </Button>
    </div>
  );
}
