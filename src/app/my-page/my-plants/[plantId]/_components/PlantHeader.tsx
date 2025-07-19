'use client';

import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { PlantHeaderProps } from '../../_types/plant.types';

/**
 * 식물 정보를 표시하는 헤더 컴포넌트
 */
export default function PlantHeader({ plant, onWriteDiary }: PlantHeaderProps) {
  return (
    <div className='bg-surface'>
      <div className='mx-auto max-w-4xl pb-10'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='relative h-12 w-12 overflow-hidden rounded-full border-2 border-gray-200'>
              <Image src={plant.imageUrl} alt={plant.name} fill className='object-cover' sizes='48px' priority />
            </div>
            <div>
              <h1 className='t-h3 text-secondary font-bold'>{plant.name}</h1>
              <p className='t-small text-muted'>
                {plant.species} • {plant.location}
              </p>
            </div>
          </div>
          <Button variant='primary' onClick={onWriteDiary}>
            <Plus size={16} />
            일지 작성
          </Button>
        </div>
      </div>
    </div>
  );
}
