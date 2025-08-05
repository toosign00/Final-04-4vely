'use client';

import { deletePlant as deletePlantAPI, getPlantById, Plant, updatePlant as updatePlantAPI } from '@/lib/actions/mypage/myPlant/plantActions';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mapPlantPostToPlant } from '../_utils/plantUtils';

/**
 * usePlantData 훅의 반환 타입
 */
interface UsePlantDataReturn {
  plant: Plant | null;
  loading: boolean;
  error: string | null;
  updatePlant: (formData: FormData) => Promise<Plant>;
  deletePlant: () => Promise<void>;
  clearError: () => void;
  refresh: () => void;
  isFound: boolean;
  plantName: string;
}

/**
 * 식물 데이터 관련 커스텀 훅
 */
export const usePlantData = (plantId: number, initialPlant: Plant | null = null) => {
  const [plant, setPlant] = useState<Plant | null>(initialPlant);
  const [loading, setLoading] = useState(!initialPlant); // 초기값이 있으면 로딩하지 않음
  const [error, setError] = useState<string | null>(null);

  // 식물 정보 조회
  const fetchPlant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPlantById(plantId);

      if (result.ok) {
        // PlantPost를 Plant로 변환
        const plant = mapPlantPostToPlant(result.item);
        setPlant(plant);
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
          // PlantPost를 Plant로 변환
          const plant = mapPlantPostToPlant(result.item);
          setPlant(plant);
          toast.success('식물 정보가 수정되었습니다.');
          return plant;
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

    // 빠른 접근을 위한 편의 속성들
    /** 식물 데이터가 성공적으로 로드되었는지 확인 */
    isFound: plant !== null,
    /** 식물 이름 또는 빈 문자열 (안전한 접근을 위한 편의 속성) */
    plantName: plant?.name || '',
  } satisfies UsePlantDataReturn;
};

/**
 * usePlantData 훅의 주요 특징과 사용법
 * @description 이 훅은 단일 식물의 데이터 관리를 위한 종합적인 솔루션을 제공합니다.
 *
 * 특징:
 * - 자동 데이터 로딩
 * - 에러 상태 관리
 * - 로딩 상태 추적
 * - CRUD 작업 지원
 * - 실시간 UI 업데이트
 * - 사용자 피드백 (토스트)
 *
 * 사용 예시:
 * ```typescript
 * const { plant, loading, updatePlant, deletePlant } = usePlantData(123);
 *
 * if (loading) return <LoadingSpinner />;
 * if (!plant) return <PlantNotFound />;
 *
 * return (
 *   <PlantDetail
 *     plant={plant}
 *     onUpdate={updatePlant}
 *     onDelete={deletePlant}
 *   />
 * );
 * ```
 */
