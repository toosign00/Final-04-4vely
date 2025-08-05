'use client';

import { Button } from '@/components/ui/Button';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { deletePlant } from '@/lib/actions/mypage/myPlant/plantActions';
import { PlusCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import ErrorDisplay from '../../_components/ErrorDisplay';
import { Diary } from '../_types/diary.types';
import { Plant } from './PlantCard';
import PlantList from './PlantList';
import PlantRegisterModal from './PlantRegisterModal';
import PlantSortSelect, { SortOption } from './PlantSortSelect';

interface MyPlantsClientProps {
  initialPlants: Plant[];
  initialError?: string | null;
  initialLatestDiaries: { [plantId: number]: Diary | undefined };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function MyPlantsClient({ initialPlants, initialError, initialLatestDiaries, pagination }: MyPlantsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const error = initialError || null;
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 현재 페이지 번호
  const currentPage = pagination.page;

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    router.push(`/my-page/my-plants${queryString ? `?${queryString}` : ''}`);
  };

  const handlePlantRegistered = () => {
    setOpen(false);

    router.refresh();
  };

  // 삭제 핸들러
  const handleDelete = async (plantId: number) => {
    setDeletingId(plantId);
    const res = await deletePlant(plantId);
    if (res.ok) {
      // 삭제 성공 시 페이지 새로고침
      toast.success('식물이 삭제되었습니다.');
      router.refresh();
    } else {
      toast.error(res.message || '삭제에 실패했습니다.');
    }
    setDeletingId(null);
  };

  // 식물 정렬 (썸네일에 표시되는 날짜 기준)
  const sortedPlants = React.useMemo(() => {
    const plants = [...initialPlants];
    return plants.sort((a, b) => {
      // 썸네일에 표시되는 날짜 = 최신 일지 날짜 > 식물 등록 날짜
      const latestDiaryA = initialLatestDiaries[a.id];
      const latestDiaryB = initialLatestDiaries[b.id];

      const displayDateA = latestDiaryA ? latestDiaryA.date : a.date;
      const displayDateB = latestDiaryB ? latestDiaryB.date : b.date;

      const dateA = new Date(displayDateA).getTime();
      const dateB = new Date(displayDateB).getTime();

      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }, [initialPlants, initialLatestDiaries, sortBy]);

  // 실제 식물 데이터만 표시
  const displayItems: Plant[] = sortedPlants;

  if (error) {
    return <ErrorDisplay title='나의 식물을 불러오지 못했습니다' message='일시적인 오류가 발생했어요.' />;
  }

  return (
    <>
      <div className='mx-auto max-w-4xl px-4 md:px-5 lg:px-6'>
        <div className='mt-4 flex items-center justify-between'>
          <Button onClick={() => setOpen(true)} variant='primary' className='flex items-center gap-2'>
            <PlusCircle className='h-4 w-4' />
            반려식물 등록
          </Button>
          <PlantSortSelect sortBy={sortBy} onSortChange={setSortBy} />
        </div>
      </div>
      <div className='mx-auto grid max-w-4xl auto-rows-fr grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-5 lg:p-6'>
        <PlantList displayItems={displayItems} latestDiaries={initialLatestDiaries} onRegisterClick={() => setOpen(true)} onDelete={handleDelete} deletingId={deletingId} />
      </div>
      {pagination.totalPages > 1 && (
        <div className='mt-8 flex justify-center'>
          <PaginationWrapper currentPage={currentPage} totalPages={pagination.totalPages} setCurrentPage={handlePageChange} />
        </div>
      )}
      <PlantRegisterModal open={open} onClose={() => setOpen(false)} onSuccess={handlePlantRegistered} />
    </>
  );
}
