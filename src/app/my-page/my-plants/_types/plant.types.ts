/**
 * 식물 데이터 타입
 */
export interface Plant {
  id: number;
  name: string;
  species: string;
  location: string;
  imageUrl: string;
  date: string;
  memo: string;
}

/**
 * 식물 헤더 컴포넌트 속성 타입
 */
export interface PlantHeaderProps {
  plant: Plant;
  onWriteDiary: () => void;
}

/**
 * 식물 찾을 수 없음 컴포넌트 속성 타입
 */
export interface PlantNotFoundProps {
  onBack: () => void;
}

/**
 * 빈 일지 상태 컴포넌트 속성 타입
 */
export interface EmptyDiaryStateProps {
  plantName: string;
  onWriteDiary: () => void;
}
