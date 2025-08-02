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
  color: string; // 선택한 상품 색상 옵션
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
  memo: {
    selectedMemo: string; // 선택한 배송 메모
    selectedImage: string[]; // 구매한 상품별 옵션에 해당하는 이미지 배열
  }; // 주문 메모 및 이미지 정보
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
 * 주문 목록 응답 타입 (페이지네이션 포함)
 */
export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 페이지네이션 파라미터 타입
 */
export interface PaginationParams {
  page?: number; // 페이지 번호 (기본값: 1)
  limit?: number; // 한 페이지당 항목 수 (기본값: 10)
  sort?: string; // 정렬 (내림차순: -1, 오름차순: 1)
}

/**
 * 주문 목록을 조회합니다.
 * @param userId - 특정 사용자의 주문만 조회할 경우 사용자 ID (선택사항)
 * @param paginationParams - 페이지네이션 파라미터 (선택사항)
 * @returns 주문 목록과 성공 여부를 포함한 API 응답
 */
export async function getOrders(userId?: number, paginationParams?: PaginationParams): Promise<ApiRes<OrdersResponse>> {
  try {
    // 인증 정보 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return { ok: 0, message: '인증 정보가 없습니다.' };
    }

    // Build API request URL with query parameters
    const queryParams = new URLSearchParams();

    if (userId) {
      queryParams.append('userId', userId.toString());
    }

    if (paginationParams) {
      const { page, limit, sort } = paginationParams;
      if (page) queryParams.append('page', page.toString());
      if (limit) queryParams.append('limit', limit.toString());
      if (sort) queryParams.append('sort', sort);
    }

    const queryString = queryParams.toString();
    const url = `${API_URL}/orders${queryString ? `?${queryString}` : ''}`;

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

    const defaultPagination = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };

    let orders: Order[];
    let pagination;

    if (data.item && data.pagination) {
      // Response with pagination
      orders = data.item;
      pagination = data.pagination;
    } else if (data.item) {
      // Legacy response format (backward compatibility)
      orders = data.item;
      pagination = {
        ...defaultPagination,
        total: orders.length,
        totalPages: 1,
      };
    } else if (Array.isArray(data)) {
      orders = data;
      pagination = {
        ...defaultPagination,
        total: orders.length,
        totalPages: 1,
      };
    } else {
      orders = [];
      pagination = defaultPagination;
    }

    return { ok: 1, item: { orders, pagination } };
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
