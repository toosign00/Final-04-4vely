'use client';

import { deletePlant as deletePlantAPI, getPlantById, Plant, updatePlant as updatePlantAPI } from '@/lib/actions/plantActions';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * 식물 데이터 관련 커스텀 훅
 */
export const usePlantData = (plantId: number) => {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 식물 정보 조회
  const fetchPlant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPlantById(plantId);

      if (result.ok) {
        setPlant(result.item);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '식물 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('식물 정보 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  // 식물 정보 수정 (FormData 기반)
  const updatePlant = useCallback(
    async (formData: FormData) => {
      try {
        setError(null);
        const result = await updatePlantAPI(plantId, formData);

        if (result.ok) {
          setPlant(result.item);
          toast.success('식물 정보가 수정되었습니다.');
          return result.item;
        } else {
          const errorMessage = result.message || '식물 정보를 수정하는데 실패했습니다.';
          setError(errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '식물 정보를 수정하는데 실패했습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [plantId],
  );

  // 식물 삭제
  const deletePlant = useCallback(async () => {
    try {
      setError(null);
      const result = await deletePlantAPI(plantId);

      if (result.ok) {
        setPlant(null);
        toast.success('식물이 삭제되었습니다.');
      } else {
        const errorMessage = result.message || '식물을 삭제하는데 실패했습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '식물을 삭제하는데 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [plantId]);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 새로고침
  const refresh = useCallback(() => {
    fetchPlant();
  }, [fetchPlant]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchPlant();
  }, [fetchPlant]);

  return {
    // 상태
    plant,
    loading,
    error,

    // 액션
    updatePlant,
    deletePlant,
    clearError,
    refresh,

    // 편의 속성
    isFound: plant !== null,
    plantName: plant?.name || '',
  };
};
