import { Plant } from '../_types/plant.types';

// 예시 식물 데이터 (실제 구현에서는 API에서 가져올 데이터)
const mockPlantsData: Plant[] = [
  {
    id: 1,
    imageUrl: '/images/insam_black.webp',
    name: '한국인삼공사',
    species: '인삼',
    location: '거실',
    date: '2025-07-16',
    memo: '오늘 인삼을 먹었어요',
  },
  {
    id: 2,
    imageUrl: '/images/hoya_heart_black.webp',
    name: '야호',
    species: '호야',
    location: '침실',
    date: '2025-07-16',
    memo: '야호!!! 분갈이 완료',
  },
  {
    id: 3,
    imageUrl: '/images/sansevieria_black.webp',
    name: '베리베리',
    species: '산세베리아',
    location: '베란다',
    date: '2025-07-16',
    memo: '베리베리의 잎이 무성해짐',
  },
];

/**
 * 식물 관련 서비스 클래스
 */
export class PlantService {
  /**
   * 모든 식물 목록 조회
   */
  static async getAllPlants(): Promise<Plant[]> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터 사용
      return mockPlantsData;
    } catch (error) {
      console.error('식물 목록 조회 실패:', error);
      throw new Error('식물 목록을 불러오는 데 실패했습니다.');
    }
  }

  /**
   * 특정 식물 조회
   */
  static async getPlantById(id: number): Promise<Plant | null> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터에서 조회
      const plant = mockPlantsData.find((plant) => plant.id === id);
      return plant || null;
    } catch (error) {
      console.error('식물 조회 실패:', error);
      throw new Error('식물 정보를 불러오는 데 실패했습니다.');
    }
  }

  /**
   * 식물 생성
   */
  static async createPlant(plant: Omit<Plant, 'id'>): Promise<Plant> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터 추가
      const newPlant = {
        ...plant,
        id: Date.now(), // 임시 ID 생성
      };
      mockPlantsData.push(newPlant);

      return newPlant;
    } catch (error) {
      console.error('식물 생성 실패:', error);
      throw new Error('식물을 저장하는 데 실패했습니다.');
    }
  }

  /**
   * 식물 수정
   */
  static async updatePlant(plant: Plant): Promise<Plant> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터에서 수정
      const index = mockPlantsData.findIndex((p) => p.id === plant.id);
      if (index === -1) {
        throw new Error('식물을 찾을 수 없습니다.');
      }

      mockPlantsData[index] = plant;
      return plant;
    } catch (error) {
      console.error('식물 수정 실패:', error);
      throw new Error('식물 정보를 수정하는 데 실패했습니다.');
    }
  }

  /**
   * 식물 삭제
   */
  static async deletePlant(id: number): Promise<void> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터에서 삭제
      const index = mockPlantsData.findIndex((plant) => plant.id === id);
      if (index === -1) {
        throw new Error('식물을 찾을 수 없습니다.');
      }

      mockPlantsData.splice(index, 1);
    } catch (error) {
      console.error('식물 삭제 실패:', error);
      throw new Error('식물을 삭제하는 데 실패했습니다.');
    }
  }
}
