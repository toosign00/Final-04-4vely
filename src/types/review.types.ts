// src/types/reply.types.ts

import { User } from '@/types/user.types';

/**
 * 상품 리뷰 정보를 나타내는 인터페이스
 */
export interface ProductReply {
  // 리뷰의 고유 ID
  _id: number;
  // 리뷰 작성자 정보 (id, 이름, 이미지)
  user: Pick<User, '_id' | 'name' | 'image'>;
  // 상품 ID
  product_id: number;
  // 주문 ID
  order_id: number;
  // 리뷰 내용
  content: string;
  // 평점 (1-5)
  rating: number;
  // 이미지 URL 배열
  images?: string[];
  // 리뷰 생성일
  createdAt: string;
  // 리뷰 수정일
  updatedAt: string;
  // 추가 정보 (색상, 사이즈 등)
  extra?: {
    title?: string;
    potColor?: string;
    order_id?: number; // 주문 ID 추가
  };
  product?: {
    _id: number;
    name: string;
    image: string;
  };
}

/**
 * 리뷰 작성/수정 폼에서 사용하는 타입
 */
export type ProductReplyForm = Pick<ProductReply, 'content' | 'rating'> & {
  title?: string;
  images?: string[];
};

/**
 * 리뷰 목록 응답 타입
 */
export interface ProductReplyListResponse {
  ok: number;
  item: ProductReply[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 리뷰 수정 요청 타입
 */
export interface UpdateReplyRequest {
  content?: string;
  rating?: number;
  extra?: {
    title?: string;
  };
}

/**
 * 리뷰 액션 결과 타입
 */
export interface ReplyActionResult {
  success: boolean;
  message: string;
  data?: ProductReply;
}
