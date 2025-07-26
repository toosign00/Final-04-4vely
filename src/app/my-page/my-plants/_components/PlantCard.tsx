'use client';
import { Button } from '@/components/ui/Button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { Diary } from '../_types/diary.types';
import { formatDateString } from '../_utils/plantUtils';

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
  memoTitle: string;
}

// 식물 카드 컴포넌트 속성 타입
interface PlantCardProps {
  plant: Plant;
  latestDiary?: Diary; // 최신 일지 정보 (선택)
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  /** 이 카드가 화면에 처음 보이는 위치인지 (LCP 최적화용) */
  isPriority?: boolean;
}

export default function PlantCard({ plant, latestDiary, onDelete, isDeleting = false, isPriority = false }: PlantCardProps) {
  const router = useRouter();

  const handleViewJournal = () => {
    router.push(`/my-page/my-plants/${plant.id}`);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(plant.id);
  };

  // 최신 일지 정보가 있으면 해당 정보로 대체, 없으면 식물의 초기 메모 정보 사용
  const displayTitle = latestDiary ? latestDiary.title : plant.memoTitle;
  const displayMemo = latestDiary ? latestDiary.content : plant.memo;
  const displayImage = latestDiary && latestDiary.images && latestDiary.images.length > 0 ? latestDiary.images[0] : plant.imageUrl;
  const displayDate = formatDateString(latestDiary ? latestDiary.date : plant.date);

  return (
    <div className='group relative max-h-[28.1rem] overflow-hidden rounded-2xl border bg-white shadow-md transition-shadow duration-300 hover:shadow-lg'>
      {/* 이미지 섹션 */}
      <div className='relative h-48 overflow-hidden sm:h-56'>
        <Image src={displayImage} alt={`${plant.name} 사진`} className='object-cover transition-transform duration-300 group-hover:scale-105' sizes='(max-width: 768px) 100vw, 50vw' priority={isPriority} fill />
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
            <p className='text-xs text-gray-400'>{displayDate}</p>
          </div>
        </div>
        {/* 메모/일지 영역 */}
        <div className='rounded-lg border border-gray-300 bg-gray-50 p-3'>
          <h4 className='text-secondary mb-1 min-h-[1.5rem] truncate text-sm font-semibold'>{displayTitle}</h4>
          <p className='text-sm leading-relaxed text-gray-700'>{displayMemo}</p>
        </div>
        {/* 액션 버튼들 */}
        <div className='flex gap-2'>
          <Button variant='primary' size='sm' className='flex-1' onClick={handleViewJournal} disabled={isDeleting}>
            일지 보기
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive' size='sm' disabled={isDeleting}>
                <Trash2 className='h-4 w-4' />
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>식물 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 &apos;{plant.name}&apos; 식물을 삭제하시겠습니까?
                  <br />
                  삭제된 식물과 관련된 모든 일지가 함께 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
                  {isDeleting ? '삭제 중...' : '삭제'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
