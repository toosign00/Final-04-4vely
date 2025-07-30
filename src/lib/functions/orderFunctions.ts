'use server';

import { getAuthInfo } from '@/lib/utils/auth.server';
import { ApiRes } from '@/types/api.types';

// API 엔드포인트 및 클라이언트 설정
const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 주문에 포함된 개별 상품 정보
 */
interface OrderProduct {
  _id: number; // 상품 고유 ID
  quantity: number; // 주문 수량
  seller_id: number; // 판매자 ID
  name: string; // 상품명
  image: string; // 상품 이미지 URL
  price: number; // 상품 가격
  extra: {
    isNew: boolean; // 신상품 여부
    isBest: boolean; // 베스트 상품 여부
    tags: string[]; // 상품 태그
    category: string[]; // 상품 카테고리
    potColors: string[]; // 화분 색상
    sort: number; // 정렬 순서
  };
  review_id?: number; // 리뷰 ID (선택사항)
}

/**
 * 주문 배송지 정보
 */
interface OrderAddress {
  name: string; // 배송지 이름
  value: string; // 배송지 주소
}

/**
 * 주문 비용 정보
 */
interface OrderCost {
  products: number; // 상품 금액
  shippingFees: number; // 배송비
  discount: {
    products: number; // 상품 할인 금액
    shippingFees: number; // 배송비 할인 금액
  };
  total: number; // 총 결제 금액
}

/**
 * 주문 전체 정보
 */
export interface Order {
  _id: number; // 주문 고유 ID
  products: OrderProduct[]; // 주문 상품 목록
  address: OrderAddress; // 배송지 정보
  state: string; // 주문 상태
  user_id: number; // 사용자 ID
  createdAt: string; // 주문 생성일
  updatedAt: string; // 주문 수정일
  cost: OrderCost; // 주문 비용 정보
}

/**
 * 주문 상태 정보
 */
export interface OrderState {
  code: string; // 상태 코드
  name: string; // 상태 이름
}

/**
 * 주문 목록을 조회합니다.
 * @param userId - 특정 사용자의 주문만 조회할 경우 사용자 ID (선택사항)
 * @returns 주문 목록과 성공 여부를 포함한 API 응답
 */
export async function getOrders(userId?: number): Promise<ApiRes<Order[]>> {
  try {
    // 인증 정보 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return { ok: 0, message: '인증 정보가 없습니다.' };
    }

    // API 요청 URL 구성 (userId가 있으면 쿼리 파라미터로 추가)
    const url = userId ? `${API_URL}/orders?userId=${userId}` : `${API_URL}/orders`;

    // 인증된 주문 목록 요청
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${authInfo.accessToken}`,
      },
    });

    // 응답 상태 확인
    if (!response.ok) {
      const errorText = await response.text();
      return { ok: 0, message: `Failed to fetch orders: ${response.status} - ${errorText}` };
    }

    const data = await response.json();

    // API 응답 구조에 따른 주문 데이터 추출
    // 다양한 응답 형태에 대응하여 주문 목록 파싱
    let orders: Order[] = [];
    if (data.item) {
      orders = data.item;
    } else if (data.orders) {
      orders = data.orders;
    } else if (Array.isArray(data)) {
      orders = data;
    } else {
      orders = [];
    }

    return { ok: 1, item: orders };
  } catch (error) {
    // 예외 발생 시 에러 메시지 반환
    return { ok: 0, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * 특정 주문의 상세 정보를 조회합니다.
 * @param orderId - 조회할 주문의 고유 ID
 * @returns 주문 상세 정보와 성공 여부를 포함한 API 응답
 */
export async function getOrderById(orderId: number): Promise<ApiRes<Order>> {
  try {
    // 인증 정보 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return { ok: 0, message: '인증 정보가 없습니다.' };
    }

    // 특정 주문 ID로 상세 정보 요청
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${authInfo.accessToken}`,
      },
    });

    // 응답 상태 확인
    if (!response.ok) {
      return { ok: 0, message: `Failed to fetch order: ${response.status}` };
    }

    const data = await response.json();
    return { ok: 1, item: data.item };
  } catch (error) {
    // 예외 발생 시 에러 메시지 반환
    return { ok: 0, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * 주문 상태 목록을 조회합니다.
 * 주문 진행 상태(주문 완료, 배송 중, 배송 완료 등)를 나타내는 코드와 이름을 반환합니다.
 * @returns 주문 상태 목록과 성공 여부를 포함한 API 응답
 */
export async function getOrderStates(): Promise<ApiRes<OrderState[]>> {
  try {
    // 인증 정보 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return { ok: 0, message: '인증 정보가 없습니다.' };
    }

    // 주문 상태 목록 요청
    const response = await fetch(`${API_URL}/orders/state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${authInfo.accessToken}`,
      },
    });

    // 응답 상태 확인
    if (!response.ok) {
      return { ok: 0, message: `Failed to fetch order states: ${response.status}` };
    }

    const data = await response.json();
    // 상태 목록 반환 (없으면 빈 배열)
    return { ok: 1, item: data.item || [] };
  } catch (error) {
    // 예외 발생 시 에러 메시지 반환
    return { ok: 0, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}
