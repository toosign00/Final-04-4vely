'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { deletePlant, getMyPlants, Plant } from '@/lib/api/actions/plantActions';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PlantList from './_components/PlantList';
import PlantRegisterModal from './_components/PlantRegisterModal';

export default function MyPlants() {
  const [open, setOpen] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 한 페이지에 보여줄 아이템 개수
  const ITEMS_PER_PAGE = 4;

  // 현재 페이지 번호 (1부터 시작)
  const [currentPage, setCurrentPage] = useState(1);

  // 전체 페이지 수
  const totalPages = Math.ceil(plants.length / ITEMS_PER_PAGE);

  // 현재 페이지의 첫 아이템 인덱스
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;

  // 현재 페이지에 보여줄 데이터 배열
  const displayItems = plants.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // 빈 카드 개수 계산
  const emptyCards = ITEMS_PER_PAGE - displayItems.length;

  // 식물 목록 불러오기
  const loadPlants = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyPlants();

      if (result.ok) {
        setPlants(result.item);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('식물 목록을 불러오는 중 오류가 발생했습니다.');
      console.error('식물 목록 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadPlants();
  }, []);

  // 식물 등록 성공 시 목록 새로고침
  const handleRegisterSuccess = () => {
    loadPlants();
    // 첫 페이지로 이동 (새로 등록된 식물을 보여주기 위해)
    setCurrentPage(1);
  };

  // 식물 삭제 핸들러
  const handleDelete = async (plantId: number) => {
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return;

    // 삭제 확인
    const confirmed = window.confirm(`'${plant.name}' 식물을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`);
    if (!confirmed) return;

    try {
      setDeletingId(plantId);
      const result = await deletePlant(plantId);

      if (result.ok) {
        toast.success(`'${plant.name}' 식물이 삭제되었습니다.`);

        // 목록에서 삭제된 식물 제거
        setPlants((prev) => prev.filter((p) => p.id !== plantId));

        // 현재 페이지에 아이템이 없으면 이전 페이지로 이동
        const remainingItems = plants.filter((p) => p.id !== plantId);
        const newTotalPages = Math.ceil(remainingItems.length / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } else {
        toast.error(result.message || '식물 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('식물 삭제 오류:', error);
      toast.error('식물 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-secondary/70'>식물 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <p className='text-error mb-4'>{error}</p>
          <button type='button' onClick={loadPlants} className='bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white'>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='mx-auto grid max-w-4xl auto-rows-fr grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-5 lg:p-6'>
        <PlantList plants={displayItems} emptyCards={emptyCards} onRegisterClick={() => setOpen(true)} onDelete={handleDelete} deletingId={deletingId} />
      </div>
      {/* 페이지네이션 UI */}
      {totalPages > 1 && (
        <div className='mt-8 flex justify-center'>
          <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
      )}
      <PlantRegisterModal open={open} onClose={() => setOpen(false)} onSuccess={handleRegisterSuccess} />
    </>
  );
}
