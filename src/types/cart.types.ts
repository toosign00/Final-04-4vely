// src/types/cart.types.ts

import { ApiRes } from './api.types';

/**
 * 장바구니 아이템 인터페이스 (API 응답)
 */
export interface CartItem {
  _id: number;
  product_id: number;
  quantity: number;
  size?: string; // 화분 색상 등의 옵션 (API 문서에 따라)
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
  // 장바구니 추가 시 클라이언트에서 사용하는 extra (size로 이동 예정)
  extra?: {
    potColor?: string;
  };
}

/**
 * 장바구니 추가 요청 데이터
 */
export interface AddToCartRequest {
  product_id: number;
  quantity: number;
  size?: string; // 화분 색상을 size로 저장 (API 문서 준수)
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
