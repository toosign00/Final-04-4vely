// src/types/cart.types.ts

import { ApiRes } from './api.types';

/**
 * 장바구니 아이템 인터페이스 (API 응답)
 */
export interface CartItem {
  _id: number;
  product_id: number;
  quantity: number;
  color?: string; // 화분 색상 옵션 (color 필드 사용)
  createdAt: string;
  updatedAt: string;
  product: {
    _id: number;
    name: string;
    price: number;
    seller_id: number;
    quantity: number;
    buyQuantity: number;
    image: string; // 현재 선택된 색상의 이미지
    mainImages?: string[]; // 모든 색상의 이미지 배열 (상세 API에서 가져옴)
    extra?: {
      isNew?: boolean;
      isBest?: boolean;
      tags?: string[];
      category?: string[];
      potColors?: string[];
      sort?: number;
    };
  };
}

/**
 * 장바구니 추가 요청 데이터
 */
export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  color?: string; // 화분 색상을 color로 저장 (새로운 API 지원)
}

/**
 * 장바구니 API 응답 타입들
 */
export type CartApiResponse = ApiRes<CartItem>;
export type CartListApiResponse = ApiRes<CartItem[]>;

/**
 * 장바구니 액션 결과
 */
export interface CartActionResult {
  success: boolean;
  message: string;
  data?: CartItem;
}
