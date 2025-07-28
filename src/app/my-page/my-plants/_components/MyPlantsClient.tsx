'use client';

import React, { useState, useMemo } from 'react';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { deletePlant } from '@/lib/actions/plantActions';
import { toast } from 'sonner';
import { Diary } from '../_types/diary.types';
import { Plant } from './PlantCard';
import PlantList from './PlantList';
import PlantRegisterModal from './PlantRegisterModal';
import PlantSortSelect, { SortOption } from './PlantSortSelect';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface MyPlantsClientProps {
  initialPlants: Plant[];
  initialError?: string | null;
  initialLatestDiaries: { [plantId: number]: Diary | undefined };
}

const TOTAL_SLOTS = 20;
const ITEMS_PER_PAGE = 4;
const TOTAL_PAGES = 5;

export default function MyPlantsClient({ initialPlants, initialError, initialLatestDiaries }: MyPlantsClientProps) {
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const plants = initialPlants;
  const error = initialError || null;
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [plantsState, setPlantsState] = useState<Plant[]>(plants);
  const [latestDiariesState, setLatestDiariesState] = useState<{ [plantId: number]: Diary | undefined }>(initialLatestDiaries);

  // 삭제 핸들러
  const handleDelete = async (plantId: number) => {
    setDeletingId(plantId);
    const res = await deletePlant(plantId);
    if (res.ok) {
      // 삭제 성공 시 목록에서 제거
      setPlantsState((prev) => prev.filter((p) => p.id !== plantId));
      setLatestDiariesState((prev) => {
        const copy = { ...prev };
        delete copy[plantId];
        return copy;
      });
      toast.success('식물이 삭제되었습니다.');
    } else {
      toast.error(res.message || '삭제에 실패했습니다.');
    }
    setDeletingId(null);
  };

  // 식물 정렬 (썸네일에 표시되는 날짜 기준)
  const sortedPlants = useMemo(() => {
    const filtered = plantsState.filter((plant) => plant !== null);
    return filtered.sort((a, b) => {
      // 썸네일에 표시되는 날짜 = 최신 일지 날짜 > 식물 등록 날짜
      const latestDiaryA = latestDiariesState[a.id];
      const latestDiaryB = latestDiariesState[b.id];

      const displayDateA = latestDiaryA ? latestDiaryA.date : a.date;
      const displayDateB = latestDiaryB ? latestDiaryB.date : b.date;

      const dateA = new Date(displayDateA).getTime();
      const dateB = new Date(displayDateB).getTime();

      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }, [plantsState, latestDiariesState, sortBy]);

  // 20칸 고정, 부족하면 null로 채움
  const allItems: (Plant | null)[] = [...sortedPlants.slice(0, TOTAL_SLOTS), ...Array(Math.max(0, TOTAL_SLOTS - sortedPlants.length)).fill(null)];
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayItems = allItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className='flex items-center justify-center'>
        <div className='flex w-full max-w-md flex-col items-center gap-6 px-8 py-12'>
          <AlertCircle className='text-error mb-2 size-12' />
          <div className='t-h3 text-secondary mb-1'>프로필 정보를 불러오지 못했습니다</div>
          <div className='t-desc text-secondary/70 mb-4 text-center'>
            일시적인 오류가 발생했어요.
            <br />
            잠시 후 다시 시도해 주세요.
          </div>
          <Button variant='secondary' onClick={() => window.location.reload()}>
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='mx-auto max-w-4xl px-4 md:px-5 lg:px-6'>
        <div className='mt-4 flex justify-end'>
          <PlantSortSelect sortBy={sortBy} onSortChange={setSortBy} />
        </div>
      </div>
      <div className='mx-auto grid max-w-4xl auto-rows-fr grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-5 lg:p-6'>
        <PlantList displayItems={displayItems} latestDiaries={latestDiariesState} onRegisterClick={() => setOpen(true)} onDelete={handleDelete} deletingId={deletingId} />
      </div>
      <div className='mt-8 flex justify-center'>
        <PaginationWrapper currentPage={currentPage} totalPages={TOTAL_PAGES} setCurrentPage={setCurrentPage} />
      </div>
      <PlantRegisterModal open={open} onClose={() => setOpen(false)} onSuccess={() => window.location.reload()} />
    </>
  );
}
