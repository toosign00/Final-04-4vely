import { StaticImageData } from 'next/image';

/**
 * 일지 데이터 타입
 */
export interface Diary {
  id: number;
  plantId: number;
  title: string;
  content: string;
  images: (string | StaticImageData)[];
  date: string;
  createdAt: string;
}

/**
 * 일지 생성 타입 (ID 제외)
 */
export type CreateDiaryInput = Omit<Diary, 'id' | 'createdAt'>;

/**
 * 일지 수정 타입
 */
export type UpdateDiaryInput = Omit<Diary, 'plantId' | 'createdAt'>;

/**
 * 일지 카드 컴포넌트 속성 타입
 */
export interface DiaryCardProps {
  diary: Diary;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onUpdate?: (updatedDiary: Diary) => void;
}

/**
 * 일지 모달 컴포넌트 속성 타입
 */
export interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  diary?: Diary;
  onSave: (diary: Diary) => void;
  mode: 'create' | 'edit';
  plantId: number;
}

/**
 * 일지 폼 데이터 타입
 */
export interface DiaryFormData {
  title: string;
  content: string;
  images: (string | StaticImageData)[];
}

/**
 * 일지 폼 컴포넌트 속성 타입
 */
export interface DiaryFormProps {
  initialData?: DiaryFormData;
  onSave: (data: DiaryFormData) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

/**
 * 일지 이미지 업로드 컴포넌트 속성 타입
 */
export interface DiaryImageUploadProps {
  images: (string | StaticImageData)[];
  onImagesChange: (images: (string | StaticImageData)[]) => void;
  maxImages?: number;
}

/**
 * 일지 목록 컴포넌트 속성 타입
 */
export interface DiaryListProps {
  diaries: Diary[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onUpdate: (diary: Diary) => void;
  onDelete: (id: number) => void;
}
