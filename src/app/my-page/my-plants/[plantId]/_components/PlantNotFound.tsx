'use client';

import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { PlantNotFoundProps } from '../../_types/plant.types';

/**
 * 식물을 찾을 수 없을 때 표시하는 컴포넌트
 */
export default function PlantNotFound({ onBack }: PlantNotFoundProps) {
  return (
    <div className='bg-surface min-h-screen'>
      <div className='flex min-h-[25rem] items-center justify-center'>
        <div className='text-center'>
          <p className='t-body text-muted mb-4'>식물을 찾을 수 없습니다.</p>
          <Button onClick={onBack} variant='primary'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
