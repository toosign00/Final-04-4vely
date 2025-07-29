// src/lib/actions/order/orderServerActions.ts

'use server';

import { CreateOrderApiResponse, CreateOrderRequest, DirectPurchaseItem, OrderPageData, PurchaseActionResult } from '@/types/order.types';
import { revalidatePath } from 'next/cache';
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
 * 임시 주문 데이터를 쿠키에 저장 (1시간 유효)
 * @param {OrderPageData} orderData - 주문 데이터
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function saveTempOrderAction(orderData: OrderPageData): Promise<boolean> {
  try {
    const cookieStore = await cookies();

    // 주문 데이터를 JSON으로 직렬화
    const serializedData = JSON.stringify(orderData);

    // 쿠키에 저장 (1시간 유효)
    cookieStore.set('temp-order', serializedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1시간
      path: '/',
    });

    console.log('[Order 서버 액션] 임시 주문 저장 완료');
    return true;
  } catch (error) {
    console.error('[Order 서버 액션] 임시 주문 저장 실패:', error);
    return false;
  }
}

/**
 * 임시 주문 데이터를 쿠키에서 가져옵니다
 * @returns {Promise<OrderPageData | null>} 주문 데이터 또는 null
 */
export async function getTempOrderAction(): Promise<OrderPageData | null> {
  try {
    const cookieStore = await cookies();
    const tempOrderCookie = cookieStore.get('temp-order')?.value;

    if (!tempOrderCookie) {
      console.log('[Order 서버 액션] 임시 주문 데이터 없음');
      return null;
    }

    const orderData = JSON.parse(tempOrderCookie) as OrderPageData;
    console.log('[Order 서버 액션] 임시 주문 데이터 조회:', {
      type: orderData.type,
      itemCount: orderData.items.length,
      totalAmount: orderData.totalAmount,
    });

    return orderData;
  } catch (error) {
    console.error('[Order 서버 액션] 임시 주문 조회 실패:', error);
    return null;
  }
}

/**
 * 임시 주문 데이터를 삭제합니다
 * @returns {Promise<void>}
 */
export async function clearTempOrderAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('temp-order');
    console.log('[Order 서버 액션] 임시 주문 데이터 삭제 완료');
  } catch (error) {
    console.error('[Order 서버 액션] 임시 주문 삭제 실패:', error);
  }
}

/**
 * 직접 구매 임시 주문 생성
 * @param {DirectPurchaseItem} item - 구매할 상품
 * @returns {Promise<boolean>} 생성 성공 여부
 */
export async function createDirectPurchaseTempOrderAction(item: DirectPurchaseItem): Promise<boolean> {
  try {
    const totalAmount = item.price * item.quantity;
    const shippingFee = totalAmount >= 50000 ? 0 : 3000;

    const orderData: OrderPageData = {
      type: 'direct',
      items: [item],
      totalAmount,
      shippingFee,
    };

    return await saveTempOrderAction(orderData);
  } catch (error) {
    console.error('[Order 서버 액션] 직접 구매 임시 주문 생성 실패:', error);
    return false;
  }
}

/**
 * 장바구니 구매 임시 주문 생성
 * @param {DirectPurchaseItem[]} items - 구매할 상품들
 * @returns {Promise<boolean>} 생성 성공 여부
 */
export async function createCartPurchaseTempOrderAction(items: DirectPurchaseItem[]): Promise<boolean> {
  try {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = totalAmount >= 50000 ? 0 : 3000;

    const orderData: OrderPageData = {
      type: 'cart',
      items,
      totalAmount,
      shippingFee,
    };

    return await saveTempOrderAction(orderData);
  } catch (error) {
    console.error('[Order 서버 액션] 장바구니 구매 임시 주문 생성 실패:', error);
    return false;
  }
}

/**
 * 임시 주문의 배송 정보 업데이트
 * @param {OrderPageData['address']} address - 배송 주소
 * @returns {Promise<boolean>} 업데이트 성공 여부
 */
export async function updateTempOrderAddressAction(address: OrderPageData['address']): Promise<boolean> {
  try {
    const orderData = await getTempOrderAction();
    if (!orderData) {
      console.error('[Order 서버 액션] 임시 주문 데이터 없음');
      return false;
    }

    orderData.address = address;
    return await saveTempOrderAction(orderData);
  } catch (error) {
    console.error('[Order 서버 액션] 배송 정보 업데이트 실패:', error);
    return false;
  }
}

/**
 * 임시 주문의 배송 메모 업데이트
 * @param {string} memo - 배송 메모
 * @returns {Promise<boolean>} 업데이트 성공 여부
 */
export async function updateTempOrderMemoAction(memo: string): Promise<boolean> {
  try {
    const orderData = await getTempOrderAction();
    if (!orderData) {
      console.error('[Order 서버 액션] 임시 주문 데이터 없음');
      return false;
    }

    orderData.memo = memo;
    return await saveTempOrderAction(orderData);
  } catch (error) {
    console.error('[Order 서버 액션] 배송 메모 업데이트 실패:', error);
    return false;
  }
}

/**
 * 주문을 생성하는 서버 액션
 * @param {CreateOrderRequest} orderData - 주문 생성 데이터
 * @returns {Promise<PurchaseActionResult>} 주문 생성 결과
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

    // 임시 주문 타입 확인 (삭제 전에 먼저 확인)
    const tempOrder = await getTempOrderAction();
    const isCartOrder = tempOrder?.type === 'cart';

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

    // 주문 생성 성공 시 임시 주문 데이터 삭제
    await clearTempOrderAction();

    // 장바구니에서 구매한 경우 장바구니 페이지 재검증
    if (isCartOrder) {
      revalidatePath('/cart');
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
 * 사용자의 로그인 상태를 확인하는 서버 액션
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
