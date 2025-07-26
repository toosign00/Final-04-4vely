// src/lib/actions/orderServerActions.ts

'use server';

import { CreateOrderRequest, CreateOrderApiResponse, PurchaseActionResult } from '@/types/order.types';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/**
 * 서버에서 사용자의 액세스 토큰을 가져옵니다
 * @private
 * @returns {Promise<string | null>} 액세스 토큰 또는 null
 */
async function getServerAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userAuthCookie = cookieStore.get('user-auth')?.value;

    if (!userAuthCookie) return null;

    const userData = JSON.parse(userAuthCookie);
    return userData?.state?.user?.token?.accessToken || null;
  } catch (error) {
    console.error('[Order 서버 액션] 토큰 파싱 오류:', error);
    return null;
  }
}

/**
 * 주문을 생성하는 서버 액션
 * @param {CreateOrderRequest} orderData - 주문 생성 데이터
 * @returns {Promise<PurchaseActionResult>} 주문 생성 결과
 * @example
 * const result = await createOrderAction({
 *   products: [
 *     { _id: 1, quantity: 2, size: '흑색' }
 *   ],
 *   address: {
 *     name: '홍길동',
 *     phone: '010-1234-5678',
 *     address: '서울시 강남구 테헤란로 123'
 *   }
 * });
 */
export async function createOrderAction(orderData: CreateOrderRequest): Promise<PurchaseActionResult> {
  try {
    console.log('[Order 서버 액션] 주문 생성 시작:', orderData);

    // 액세스 토큰 확인
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log('[Order 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // API 요청
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    const data: CreateOrderApiResponse = await res.json();
    console.log('[Order 서버 액션] API 응답:', { status: res.status, ok: data.ok });

    if (!res.ok || data.ok === 0) {
      const errorMessage = '주문 생성에 실패했습니다.';
      console.error('[Order 서버 액션] 오류:', errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    }

    console.log('[Order 서버 액션] 주문 생성 성공:', data.item);
    return {
      success: true,
      message: '주문이 성공적으로 생성되었습니다.',
      data: {
        orderId: data.item?._id,
        redirectUrl: `/order/order-complete?orderId=${data.item?._id}`,
      },
    };
  } catch (error) {
    console.error('[Order 서버 액션] 네트워크 오류:', error);
    return {
      success: false,
      message: '일시적인 네트워크 문제로 주문 생성에 실패했습니다.',
    };
  }
}

/**
 * 특정 주문의 상세 정보를 조회하는 서버 액션
 * @param {number} orderId - 주문 ID
 * @returns {Promise<PurchaseActionResult>} 주문 조회 결과
 */
export async function getOrderByIdAction(orderId: number): Promise<PurchaseActionResult> {
  try {
    console.log('[Order 서버 액션] 주문 조회 시작:', orderId);

    // 액세스 토큰 확인
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log('[Order 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // API 요청
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data: CreateOrderApiResponse = await res.json();
    console.log('[Order 서버 액션] 주문 조회 API 응답:', { status: res.status, ok: data.ok });

    if (!res.ok || data.ok === 0) {
      return {
        success: false,
        message: '주문 정보를 찾을 수 없습니다.',
      };
    }

    console.log('[Order 서버 액션] 주문 조회 성공:', data.item);
    return {
      success: true,
      message: '주문 정보를 성공적으로 조회했습니다.',
      data: {
        orderId: data.item?._id,
      },
    };
  } catch (error) {
    console.error('[Order 서버 액션] 주문 조회 네트워크 오류:', error);
    return {
      success: false,
      message: '일시적인 네트워크 문제로 주문 조회에 실패했습니다.',
    };
  }
}

/**
 * 사용자의 로그인 상태를 확인하는 서버 액션 (재사용)
 * @returns {Promise<boolean>} 로그인 여부
 */
export async function checkOrderLoginStatusAction(): Promise<boolean> {
  try {
    const accessToken = await getServerAccessToken();
    return !!accessToken;
  } catch (error) {
    console.error('[Order 서버 액션] 로그인 상태 확인 오류:', error);
    return false;
  }
}
