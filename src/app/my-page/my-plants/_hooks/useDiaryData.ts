'use client';

import { createDiary, deleteDiary, getDiariesByPlantId, updateDiary } from '@/lib/actions/diaryActions';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreateDiaryInput, Diary, mapDiaryReplyToDiary, UpdateDiaryInput } from '../_types/diary.types';
import { calculatePagination } from '../_utils/diaryUtils';

/**
 * 일지 데이터 관련 커스텀 훅
 */
export const useDiaryData = (plantId: number, initialDiaries: Diary[] = []) => {
  const [diaries, setDiaries] = useState<Diary[]>(initialDiaries);
  const [loading, setLoading] = useState(initialDiaries.length === 0); // 초기값이 있으면 로딩하지 않음
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const ITEMS_PER_PAGE = 3;

  // 일지 목록 조회
  const fetchDiaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDiariesByPlantId(plantId);

      if (result.ok) {
        // DiaryReply[]를 Diary[]로 변환
        const mappedDiaries = result.item.map((reply) => mapDiaryReplyToDiary(reply, plantId));
        setDiaries(mappedDiaries);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '일지 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('일지 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  // 일지 생성
  const createDiaryEntry = useCallback(
    async (input: CreateDiaryInput) => {
      try {
        setActionLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', input.title);
        formData.append('content', input.content);
        formData.append('date', input.date);

        // 다중 이미지 처리
        if (input.images && input.images.length > 0) {
          input.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
          });
        }

        const result = await createDiary(plantId, formData);

        if (result.ok) {
          const newDiary = mapDiaryReplyToDiary(result.item, plantId);
          setDiaries((prev) => [newDiary, ...prev]);
          // 새 일지가 추가되면 첫 페이지로 이동
          setCurrentPage(1);
          toast.success('일지가 작성되었습니다.');
          return newDiary;
        } else {
          const errorMessage = result.message || '일지를 저장하는데 실패했습니다.';
          setError(errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '일지를 저장하는데 실패했습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    },
    [plantId],
  );

  // 일지 수정
  const updateDiaryEntry = useCallback(
    async (input: UpdateDiaryInput) => {
      try {
        setActionLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('title', input.title);
        formData.append('content', input.content);
        formData.append('date', input.date);

        // 기존 이미지 처리 (삭제되지 않은 이미지들)
        if (input.existingImages && input.existingImages.length > 0) {
          input.existingImages.forEach((imagePath, index) => {
            formData.append(`existingImages[${index}]`, imagePath);
          });
        }

        // 새로 추가된 이미지 처리
        if (input.newImages && input.newImages.length > 0) {
          input.newImages.forEach((image, index) => {
            formData.append(`newImages[${index}]`, image);
          });
        }

        const result = await updateDiary(plantId, input.id, formData);

        if (result.ok) {
          const updatedDiary = mapDiaryReplyToDiary(result.item, plantId);
          setDiaries((prev) => prev.map((diary) => (diary.id === updatedDiary.id ? updatedDiary : diary)));
          toast.success('일지가 수정되었습니다.');
          return updatedDiary;
        } else {
          const errorMessage = result.message || '일지를 수정하는데 실패했습니다.';
          setError(errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '일지를 수정하는데 실패했습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    },
    [plantId],
  );

  // 일지 삭제
  const deleteDiaryEntry = useCallback(
    async (id: number) => {
      try {
        setActionLoading(true);
        setError(null);

        const result = await deleteDiary(plantId, id);

        if (result.ok) {
          setDiaries((prev) => prev.filter((diary) => diary.id !== id));

          // 삭제 후 현재 페이지에 데이터가 없으면 이전 페이지로 이동
          const remainingDiaries = diaries.filter((diary) => diary.id !== id);
          const { totalPages } = calculatePagination(remainingDiaries.length, ITEMS_PER_PAGE, currentPage);
          if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
          }

          toast.success('일지가 삭제되었습니다.');
        } else {
          const errorMessage = result.message || '일지를 삭제하는데 실패했습니다.';
          setError(errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '일지를 삭제하는데 실패했습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    },
    [diaries, currentPage, plantId],
  );

  // 페이지네이션 계산
  const paginationInfo = calculatePagination(diaries.length, ITEMS_PER_PAGE, currentPage);
  const displayDiaries = diaries.slice(paginationInfo.startIdx, paginationInfo.endIdx);

  // 페이지 변경
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 새로고침
  const refresh = useCallback(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  return {
    // 상태
    diaries,
    displayDiaries,
    loading,
    error,
    actionLoading,

    // 페이지네이션
    currentPage,
    totalPages: paginationInfo.totalPages,
    hasNext: paginationInfo.hasNext,
    hasPrev: paginationInfo.hasPrev,

    // 액션 (이름 변경으로 충돌 방지)
    createDiary: createDiaryEntry,
    updateDiary: updateDiaryEntry,
    deleteDiary: deleteDiaryEntry,
    handlePageChange,
    clearError,
    refresh,

    // 상수
    ITEMS_PER_PAGE,
  };
};
