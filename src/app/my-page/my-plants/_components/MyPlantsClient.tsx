'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { deletePlant } from '@/lib/actions/plantActions';
import { useState } from 'react';
import { toast } from 'sonner';
import { Diary } from '../_types/diary.types';
import { Plant } from './PlantCard';
import PlantList from './PlantList';
import PlantRegisterModal from './PlantRegisterModal';

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
  const plants = initialPlants;
  const error = initialError || null;
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [plantsState, setPlantsState] = useState<Plant[]>(plants);
  const [latestDiariesState, setLatestDiariesState] = useState<{ [plantId: number]: Diary | undefined }>(initialLatestDiaries);

  // 삭제 핸들러
  const handleDelete = async (plantId: number) => {
    if (!window.confirm('정말로 이 식물을 삭제하시겠습니까?')) return;
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

  // 20칸 고정, 부족하면 null로 채움
  const allItems: (Plant | null)[] = [...plantsState.slice(0, TOTAL_SLOTS), ...Array(Math.max(0, TOTAL_SLOTS - plantsState.length)).fill(null)];
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayItems = allItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className='flex min-h-[25rem] items-center justify-center'>
        <div className='text-center'>
          <p className='text-error mb-4'>{error}</p>
          <button type='button' onClick={() => window.location.reload()} className='bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white'>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
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
