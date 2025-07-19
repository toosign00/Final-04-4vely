'use client';

import { useCallback, useEffect, useState } from 'react';
import { PlantService } from '../_services/plantService';
import { Plant } from '../_types/plant.types';

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
      const data = await PlantService.getPlantById(plantId);
      setPlant(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '식물 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  // 식물 정보 수정
  const updatePlant = useCallback(async (updatedPlant: Plant) => {
    try {
      setError(null);
      const result = await PlantService.updatePlant(updatedPlant);
      setPlant(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '식물 정보를 수정하는데 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // 식물 삭제
  const deletePlant = useCallback(async (id: number) => {
    try {
      setError(null);
      await PlantService.deletePlant(id);
      setPlant(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '식물을 삭제하는데 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

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
