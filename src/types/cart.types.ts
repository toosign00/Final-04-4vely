// src/types/cart.types.ts

import { ApiRes } from './api.types';

/**
 * 장바구니 아이템 인터페이스 (API 응답)
 */
export interface CartItem {
  _id: number;
  product_id: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    _id: number;
    name: string;
    price: number;
    seller_id: number;
    quantity: number;
    buyQuantity: number;
    mainImages?: string[];
    extra?: {
      isNew?: boolean;
      isBest?: boolean;
      category?: string[];
      potColors?: string[];
    };
  };
  // 선택된 화분 색상 정보 (extra에 저장)
  extra?: {
    potColor?: string; // 선택된 화분 색상
  };
}

/**
 * 장바구니 추가 요청 데이터
 */
export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  extra?: {
    potColor?: string; // 선택된 화분 색상
  };
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
