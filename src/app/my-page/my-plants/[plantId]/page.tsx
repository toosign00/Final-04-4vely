'use client';

import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDiaryData } from '../_hooks/useDiaryData';
import { usePlantData } from '../_hooks/usePlantData';
import { CreateDiaryInput, UpdateDiaryInput } from '../_types/diary.types';
import DiaryList from './_components/DiaryList';
import DiaryModal from './_components/DiaryModal';
import EmptyDiaryState from './_components/EmptyDiaryState';
import PlantHeader from './_components/PlantHeader';
import PlantNotFound from './_components/PlantNotFound';

/**
 * 식물 일지 목록 페이지
 */
export default function PlantDiaryListPage() {
  const router = useRouter();
  const params = useParams();
  const plantId = Number(params.plantId);

  // 식물 데이터 관리
  const { plant, loading: plantLoading, error: plantError } = usePlantData(plantId);

  // 일지 데이터 관리
  const { displayDiaries, loading: diaryLoading, error: diaryError, currentPage, createDiary, updateDiary, deleteDiary, handlePageChange } = useDiaryData(plantId);

  // 일지 작성 모달 상태
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // 뒤로 가기
  const handleBack = () => {
    router.push('/my-page/my-plants');
  };

  // 일지 작성 모달 열기
  const handleWriteDiary = () => {
    setIsWriteModalOpen(true);
  };

  // 일지 생성 처리
  const handleCreateDiary = async (newDiary: CreateDiaryInput | UpdateDiaryInput) => {
    try {
      if ('id' in newDiary) {
        // 수정 모드
        await updateDiary(newDiary);
      } else {
        // 생성 모드
        await createDiary(newDiary);
      }
      setIsWriteModalOpen(false);
    } catch (error) {
      console.error('일지 저장 실패:', error);
    }
  };

  // 일지 삭제 처리
  const handleDeleteDiary = async (diaryId: number) => {
    if (confirm('정말로 이 일지를 삭제하시겠습니까?')) {
      try {
        await deleteDiary(diaryId);
      } catch (error) {
        console.error('일지 삭제 실패:', error);
      }
    }
  };

  // 일지 수정 처리
  const handleUpdateDiary = async (updatedDiary: UpdateDiaryInput) => {
    try {
      await updateDiary(updatedDiary);
    } catch (error) {
      console.error('일지 수정 실패:', error);
    }
  };

  // 로딩 상태
  if (plantLoading || diaryLoading) {
    return (
      <div className='bg-surface min-h-screen'>
        <div className='flex min-h-[25rem] items-center justify-center'>
          <div className='flex flex-col items-center text-center'>
            <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
            <p className='t-body text-secondary/70'>식물 정보를 불러오는 중</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (plantError || diaryError) {
    return (
      <div className='bg-surface min-h-screen'>
        <div className='flex min-h-[25rem] items-center justify-center'>
          <div className='text-center'>
            <p className='t-body text-error mb-4'>{plantError || diaryError}</p>
            <Button onClick={handleBack} variant='primary'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 식물을 찾을 수 없는 경우
  if (!plant) {
    return <PlantNotFound onBack={handleBack} />;
  }

  return (
    <div className='bg-surface min-h-screen'>
      {/* 목록으로 돌아가기 버튼 */}
      <div className='mx-auto max-w-4xl py-4'>
        <Button variant='ghost' size='lg' className='text-base' style={{ paddingLeft: '0px' }} onClick={handleBack}>
          <ArrowLeft className='size-5' />
          목록으로 돌아가기
        </Button>
      </div>

      {/* 식물 헤더 */}
      <PlantHeader plant={plant} onWriteDiary={handleWriteDiary} />

      {/* 메인 콘텐츠 */}
      <div className='mx-auto max-w-4xl pb-6'>
        {displayDiaries.length > 0 ? (
          <DiaryList diaries={displayDiaries} currentPage={currentPage} onPageChange={handlePageChange} onUpdate={handleUpdateDiary} onDelete={handleDeleteDiary} />
        ) : (
          <EmptyDiaryState plantName={plant.name} onWriteDiary={handleWriteDiary} />
        )}
      </div>

      {/* 일지 작성 모달 */}
      <DiaryModal isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} onSave={handleCreateDiary} mode='create' plantId={plantId} />
    </div>
  );
}
