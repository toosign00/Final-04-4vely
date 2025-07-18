import { CreateDiaryInput, Diary, UpdateDiaryInput } from '../_types/diary.types';
import { createDiaryDefaults, filterDiariesByPlantId, sortDiariesByDate } from '../_utils/diaryUtils';

// 예시 일지 데이터 (실제 구현에서는 API에서 가져올 데이터)
const mockDiariesData: Diary[] = [
  {
    id: 1,
    plantId: 1,
    title: '나는.... 오늘 인삼을 먹었다',
    content: '나는.. 오늘 인삼을 먹었다. 그동안 정든 아이였지만 먹으니 힘이 불끈불끈 난다.',
    images: ['/images/insam_black.webp', 'https://placehold.co/200x200', 'https://placehold.co/200x200', 'https://placehold.co/200x200'],
    date: '2025-07-14',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 2,
    plantId: 1,
    title: '나는.... 오늘 인삼을 먹었다',
    content: '나는.. 오늘 인삼을 먹었다. 그동안 정든 아이였지만 먹으니 힘이 불끈불끈 난다.',
    images: ['/images/insam_black.webp', 'https://placehold.co/200x200', 'https://placehold.co/200x200'],
    date: '2025-07-12',
    createdAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 3,
    plantId: 1,
    title: '나는.... 오늘 인삼을 먹었다',
    content: '나는.. 오늘 인삼을 먹었다. 그동안 정든 아이였지만 먹으니 힘이 불끈불끈 난다.',
    images: ['/images/insam_black.webp', 'https://placehold.co/200x200'],
    date: '2025-07-10',
    createdAt: '2025-01-18T16:00:00Z',
  },
];

/**
 * 일지 관련 서비스 클래스
 */
export class DiaryService {
  /**
   * 특정 식물의 일지 목록 조회
   */
  static async getDiariesByPlantId(plantId: number): Promise<Diary[]> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터 사용
      const filteredDiaries = filterDiariesByPlantId(mockDiariesData, plantId);
      return sortDiariesByDate(filteredDiaries);
    } catch (error) {
      console.error('일지 목록 조회 실패:', error);
      throw new Error('일지 목록을 불러오는 데 실패했습니다.');
    }
  }

  /**
   * 일지 생성
   */
  static async createDiary(input: CreateDiaryInput): Promise<Diary> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터 추가
      const newDiary = createDiaryDefaults(input.plantId, input.title, input.content, input.images);
      mockDiariesData.push(newDiary);

      return newDiary;
    } catch (error) {
      console.error('일지 생성 실패:', error);
      throw new Error('일지를 저장하는 데 실패했습니다.');
    }
  }

  /**
   * 일지 수정
   */
  static async updateDiary(input: UpdateDiaryInput): Promise<Diary> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터에서 수정
      const index = mockDiariesData.findIndex((diary) => diary.id === input.id);
      if (index === -1) {
        throw new Error('일지를 찾을 수 없습니다.');
      }

      const updatedDiary = { ...mockDiariesData[index], ...input };
      mockDiariesData[index] = updatedDiary;

      return updatedDiary;
    } catch (error) {
      console.error('일지 수정 실패:', error);
      throw new Error('일지를 수정하는 데 실패했습니다.');
    }
  }

  /**
   * 일지 삭제
   */
  static async deleteDiary(id: number): Promise<void> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터에서 삭제
      const index = mockDiariesData.findIndex((diary) => diary.id === id);
      if (index === -1) {
        throw new Error('일지를 찾을 수 없습니다.');
      }

      mockDiariesData.splice(index, 1);
    } catch (error) {
      console.error('일지 삭제 실패:', error);
      throw new Error('일지를 삭제하는 데 실패했습니다.');
    }
  }

  /**
   * 일지 단일 조회
   */
  static async getDiaryById(id: number): Promise<Diary | null> {
    try {
      // 실제 구현에서는 API 호출

      // 현재는 임시 데이터에서 조회
      const diary = mockDiariesData.find((diary) => diary.id === id);
      return diary || null;
    } catch (error) {
      console.error('일지 조회 실패:', error);
      throw new Error('일지를 불러오는 데 실패했습니다.');
    }
  }
}
