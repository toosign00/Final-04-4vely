'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Plant } from '@/lib/actions/plantActions';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { useDiaryData } from '../../_hooks/useDiaryData';
import { usePlantData } from '../../_hooks/usePlantData';
import { CreateDiaryInput, Diary, UpdateDiaryInput } from '../../_types/diary.types';
import DiaryList from './DiaryList';
import DiaryModal from './DiaryModal';
import EmptyDiaryState from './EmptyDiaryState';
import PlantHeader from './PlantHeader';
import PlantNotFound from './PlantNotFound';

/**
 * 클라이언트 래퍼 컴포넌트 Props 타입 정의
 * @interface PlantDiaryClientWrapperProps
 */
interface PlantDiaryClientWrapperProps {
  /** 식물 ID */
  plantId: number;
  /** 서버에서 미리 페칭한 식물 데이터 (초기값) */
  initialPlant: Plant | null;
  /** 서버에서 미리 페칭한 일지 데이터 (초기값) */
  initialDiaries: Diary[];
  /** 식물 데이터 페칭 오류 메시지 */
  plantError: string | null;
  /** 일지 데이터 페칭 오류 메시지 */
  diaryError: string | null;
}

/**
 * 식물 일지 페이지의 클라이언트 사이드 로직을 담당하는 래퍼 컴포넌트
 *
 * @description
 * - 서버에서 받은 초기 데이터를 클라이언트 hooks에 주입하여 SSR/CSR 연결
 * - 사용자 상호작용(일지 작성, 수정, 삭제 등)을 담당
 * - 클라이언트에서만 필요한 상태 관리 (모달, 페이지네이션 등)
 *
 * @param {PlantDiaryClientWrapperProps} props - 컴포넌트 props
 * @returns {JSX.Element} 렌더링된 클라이언트 컴포넌트
 *
 * @performance
 * - React.memo로 불필요한 리렌더링 방지
 * - useCallback으로 함수 메모이제이션
 * - useMemo로 계산된 값 메모이제이션
 *
 * @architecture
 * - Presentation/Container 패턴으로 비즈니스 로직과 UI 분리
 * - 커스텀 hooks로 상태 관리 로직 추상화
 * - Props drilling 최소화를 위한 컴포넌트 구조 설계
 */
const PlantDiaryClientWrapper = React.memo<PlantDiaryClientWrapperProps>(({ plantId, initialPlant, initialDiaries, plantError, diaryError }) => {
  const router = useRouter();

  // 식물 데이터 관리 - 서버 초기값으로 초기화
  const { plant, loading: plantLoading, error: currentPlantError } = usePlantData(plantId, initialPlant);

  // 일지 데이터 관리 - 서버 초기값으로 초기화
  const { displayDiaries, loading: diaryLoading, error: currentDiaryError, currentPage, createDiary, updateDiary, deleteDiary, handlePageChange } = useDiaryData(plantId, initialDiaries);

  // 일지 작성 모달 상태
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  // 삭제할 일지 ID 상태
  const [diaryToDelete, setDiaryToDelete] = useState<number | null>(null);

  /**
   * 뒤로 가기 핸들러
   * @description 식물 목록 페이지로 이동
   */
  const handleBack = useCallback(() => {
    router.push('/my-page/my-plants');
  }, [router]);

  /**
   * 일지 작성 모달 열기 핸들러
   * @description 일지 작성 모달을 열고 필요한 상태 초기화
   */
  const handleWriteDiary = useCallback(() => {
    setIsWriteModalOpen(true);
  }, []);

  /**
   * 일지 생성/수정 통합 핸들러
   * @description 생성 모드와 수정 모드를 구분하여 적절한 액션 호출
   * @param {CreateDiaryInput | UpdateDiaryInput} newDiary - 일지 데이터
   * @throws {Error} 일지 저장 실패 시 에러 로깅
   */
  const handleCreateDiary = useCallback(
    async (newDiary: CreateDiaryInput | UpdateDiaryInput) => {
      try {
        if ('id' in newDiary) {
          // 수정 모드: ID가 있으면 기존 일지 수정
          await updateDiary(newDiary);
        } else {
          // 생성 모드: ID가 없으면 새 일지 생성
          await createDiary(newDiary);
        }
        setIsWriteModalOpen(false);
      } catch (error) {
        console.error('일지 저장 실패:', error);
        // 에러는 hook 내부에서 toast로 처리되므로 여기서는 로깅만
      }
    },
    [createDiary, updateDiary],
  );

  /**
   * 일지 삭제 핸들러
   * @description 사용자 확인 후 일지 삭제 수행
   * @param {number} diaryId - 삭제할 일지 ID
   */
  const handleDeleteDiary = useCallback(async (diaryId: number) => {
    setDiaryToDelete(diaryId);
  }, []);

  /**
   * 일지 삭제 확인 핸들러
   * @description AlertDialog에서 확인 버튼 클릭 시 실제 삭제 수행
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (diaryToDelete === null) return;

    try {
      await deleteDiary(diaryToDelete);
      setDiaryToDelete(null);
    } catch (error) {
      console.error('일지 삭제 실패:', error);
      // 에러는 hook 내부에서 toast로 처리되므로 여기서는 로깅만
    }
  }, [diaryToDelete, deleteDiary]);

  /**
   * 일지 삭제 취소 핸들러
   * @description AlertDialog에서 취소 버튼 클릭 시 상태 초기화
   */
  const handleDeleteCancel = useCallback(() => {
    setDiaryToDelete(null);
  }, []);

  /**
   * 일지 수정 핸들러
   * @description 기존 일지 데이터 수정
   * @param {UpdateDiaryInput} updatedDiary - 수정된 일지 데이터
   */
  const handleUpdateDiary = useCallback(
    async (updatedDiary: UpdateDiaryInput) => {
      try {
        await updateDiary(updatedDiary);
      } catch (error) {
        console.error('일지 수정 실패:', error);
      }
    },
    [updateDiary],
  );

  /**
   * 로딩 상태 계산
   * @description 식물 또는 일지 데이터 로딩 중인지 확인
   */
  const isLoading = useMemo(() => plantLoading || diaryLoading, [plantLoading, diaryLoading]);

  /**
   * 에러 상태 계산 (서버 에러 우선, 그 다음 클라이언트 에러)
   * @description 서버에서 발생한 에러를 우선적으로 표시하고, 없으면 클라이언트 에러 표시
   */
  const errorMessage = useMemo(() => {
    return plantError || diaryError || currentPlantError || currentDiaryError;
  }, [plantError, diaryError, currentPlantError, currentDiaryError]);

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div className='bg-surface min-h-screen'>
        <div className='flex min-h-[25rem] items-center justify-center'>
          <div className='flex flex-col items-center text-center'>
            <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
            <p className='t-body text-secondary/70'>식물 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 UI
  if (errorMessage) {
    return (
      <div className='bg-surface min-h-screen'>
        <div className='flex min-h-[25rem] items-center justify-center'>
          <div className='text-center'>
            <p className='t-body text-error mb-4'>{errorMessage}</p>
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

  // 메인 콘텐츠 렌더링
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

      {/* 일지 삭제 확인 다이얼로그 */}
      <AlertDialog open={diaryToDelete !== null} onOpenChange={(open) => !open && setDiaryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>일지 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 일지를 삭제하시겠습니까?
              <br />
              삭제된 일지는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

// 컴포넌트 이름 설정 (React DevTools에서 표시됨)
PlantDiaryClientWrapper.displayName = 'PlantDiaryClientWrapper';

export default PlantDiaryClientWrapper;
