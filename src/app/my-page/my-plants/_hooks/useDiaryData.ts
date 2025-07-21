'use client';

import { useCallback, useEffect, useState } from 'react';
import { DiaryService } from '../_services/diaryService';
import { CreateDiaryInput, Diary, UpdateDiaryInput } from '../_types/diary.types';
import { calculatePagination } from '../_utils/diaryUtils';

/**
 * 일지 데이터 관련 커스텀 훅
 */
export const useDiaryData = (plantId: number) => {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const ITEMS_PER_PAGE = 3;

  // 일지 목록 조회
  const fetchDiaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DiaryService.getDiariesByPlantId(plantId);
      setDiaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '일지 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  // 일지 생성
  const createDiary = useCallback(async (input: CreateDiaryInput) => {
    try {
      setActionLoading(true);
      setError(null);
      const newDiary = await DiaryService.createDiary(input);
      setDiaries((prev) => [newDiary, ...prev]);
      // 새 일지가 추가되면 첫 페이지로 이동
      setCurrentPage(1);
      return newDiary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '일지를 저장하는데 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, []);

  // 일지 수정
  const updateDiary = useCallback(async (input: UpdateDiaryInput) => {
    try {
      setActionLoading(true);
      setError(null);
      const updatedDiary = await DiaryService.updateDiary(input);
      setDiaries((prev) => prev.map((diary) => (diary.id === updatedDiary.id ? updatedDiary : diary)));
      return updatedDiary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '일지를 수정하는데 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  }, []);

  // 일지 삭제
  const deleteDiary = useCallback(
    async (id: number) => {
      try {
        setActionLoading(true);
        setError(null);
        await DiaryService.deleteDiary(id);
        setDiaries((prev) => prev.filter((diary) => diary.id !== id));

        // 삭제 후 현재 페이지에 데이터가 없으면 이전 페이지로 이동
        const remainingDiaries = diaries.filter((diary) => diary.id !== id);
        const { totalPages } = calculatePagination(remainingDiaries.length, ITEMS_PER_PAGE, currentPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '일지를 삭제하는데 실패했습니다.';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    },
    [diaries, currentPage],
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

    // 액션
    createDiary,
    updateDiary,
    deleteDiary,
    handlePageChange,
    clearError,
    refresh,

    // 상수
    ITEMS_PER_PAGE,
  };
};
