'use client';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * 식물 데이터 타입
 */
export interface Plant {
  id: number;
  imageUrl: string | StaticImageData;
  name: string;
  species: string;
  location: string;
  date: string;
  memo: string;
}

// 식물 카드 컴포넌트 속성 타입
interface PlantCardProps {
  plant: Plant;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export default function PlantCard({ plant, onDelete, isDeleting = false }: PlantCardProps) {
  const router = useRouter();

  const handleViewJournal = () => {
    router.push(`/my-page/my-plants/${plant.id}`);
  };

  return (
    <div className='group relative max-h-[26.6rem] overflow-hidden rounded-2xl border bg-white shadow-md transition-shadow duration-300 hover:shadow-lg'>
      {/* 이미지 섹션 */}
      <div className='relative overflow-hidden'>
        <Image
          src={plant.imageUrl}
          alt={`${plant.name} 사진`}
          className='h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-56'
          sizes='(max-width: 768px) 100vw, 50vw'
          priority={plant.id <= 2}
          width={400}
          height={224}
        />
      </div>
      {/* 컨텐츠 섹션 */}
      <div className='space-y-4 p-4 sm:p-5'>
        {/* 헤더 정보 */}
        <div className='flex items-start justify-between'>
          <div className='min-w-0 flex-1'>
            <h3 className='truncate text-lg font-bold text-gray-900'>{plant.name}</h3>
            <p className='truncate text-sm text-gray-500'>{plant.species}</p>
          </div>
          <div className='ml-3 text-right'>
            <p className='text-sm font-medium text-gray-600'>{plant.location}</p>
            <p className='text-xs text-gray-400'>{plant.date}</p>
          </div>
        </div>
        {/* 메모 섹션 */}
        <div className='rounded-lg border border-gray-300 bg-gray-50 p-3'>
          <p className='text-sm leading-relaxed text-gray-700'>{plant.memo}</p>
        </div>
        {/* 액션 버튼들 */}
        <div className='flex gap-2'>
          <Button variant='primary' size='sm' className='flex-1' onClick={handleViewJournal} disabled={isDeleting}>
            일지 보기
          </Button>
          <Button variant='destructive' size='sm' onClick={() => onDelete?.(plant.id)} disabled={isDeleting}>
            <Trash2 className='h-4 w-4' />
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </div>
    </div>
  );
}
