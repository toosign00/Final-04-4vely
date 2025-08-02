import { DiaryReply } from '@/lib/actions/mypage/myPlant/diaryActions';
import { formatDateString } from '../_utils/plantUtils';

/**
 * 일지 데이터 타입 (API 응답 기반)
 */
export interface Diary {
  id: number; // _id를 id로 매핑
  plantId: number;
  title: string;
  content: string;
  images: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: number;
    name: string;
    image?: string;
  };
}

/**
 * DiaryReply를 Diary로 변환하는 유틸리티 함수
 */
export function mapDiaryReplyToDiary(reply: DiaryReply, plantId: number): Diary {
  return {
    id: reply._id,
    plantId,
    title: reply.extra?.title || '제목 없음',
    content: reply.content,
    images: reply.extra?.images || [],
    date: formatDateString(reply.extra?.date || reply.createdAt),
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
    user: reply.user,
  };
}

/**
 * 일지 생성 타입 (ID 제외)
 */
export type CreateDiaryInput = {
  plantId: number;
  title: string;
  content: string;
  images?: File[]; // 다중 이미지 파일 배열
  date: string;
};

/**
 * 일지 수정 타입
 */
export type UpdateDiaryInput = {
  id: number;
  plantId: number;
  title: string;
  content: string;
  existingImages?: string[]; // 삭제되지 않은 기존 이미지들의 URL
  newImages?: File[]; // 새로 추가할 이미지 파일들
  date: string;
};

/**
 * 일지 카드 컴포넌트 속성 타입
 */
export interface DiaryCardProps {
  diary: Diary;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onUpdate?: (updatedDiary: UpdateDiaryInput) => void;
}

/**
 * 일지 모달 컴포넌트 속성 타입
 */
export interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  diary?: Diary;
  onSave: (diary: CreateDiaryInput | UpdateDiaryInput) => void;
  mode: 'create' | 'edit';
  plantId: number;
}

/**
 * 일지 폼 데이터 타입
 */
export interface DiaryFormData {
  title: string;
  content: string;
  images: File[];
  date: string;
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
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number; // 최대 이미지 개수
  maxFileSize?: number; // bytes
}

/**
 * 일지 목록 컴포넌트 속성 타입
 */
export interface DiaryListProps {
  diaries: Diary[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onUpdate: (diary: UpdateDiaryInput) => void;
  onDelete: (id: number) => void;
}
