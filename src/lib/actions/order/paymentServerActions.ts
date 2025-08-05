// src/lib/actions/order/paymentServerActions.ts
'use server';

import { getAuthInfo } from '@/lib/utils/auth.server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';
const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;

/**
 * PortOne 액세스 토큰 발급
 * @private
 * @returns {Promise<string | null>} PortOne 액세스 토큰
 */
async function getPortOneAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('https://api.portone.io/login/api-secret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiSecret: PORTONE_API_SECRET,
      }),
    });

    const data = await response.json();
    return data.accessToken || null;
  } catch {
    return null;
  }
}

interface PortOnePayment {
  status: string;
  amount?: {
    total: number;
  };
}

/**
 * PortOne 결제 정보 조회
 * @param {string} paymentId - 결제 ID
 * @returns {Promise<PortOnePayment>} 결제 정보
 */
async function getPortOnePayment(paymentId: string): Promise<PortOnePayment> {
  try {
    const accessToken = await getPortOneAccessToken();
    if (!accessToken) {
      throw new Error('PortOne 액세스 토큰 발급 실패');
    }

    const response = await fetch(`https://api.portone.io/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * 결제 검증 및 주문 완료 처리 서버 액션 (검증 로직 제거 버전)
 * @param {string} paymentId - PortOne 결제 ID
 * @param {string} orderIdFromClient - 클라이언트에서 전달받은 주문 ID
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
interface PaymentActionResult {
  orderId: string;
  paymentId: string;
  redirectUrl: string;
}

export async function verifyPaymentAndCompleteOrderAction(paymentId: string, orderIdFromClient: string): Promise<{ success: boolean; message: string; data?: PaymentActionResult }> {
  try {
    // 1. 사용자 액세스 토큰 확인 - getAuthInfo 사용
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }
    const { accessToken } = authInfo;

    // 2. PortOne에서 결제 정보 조회
    const portonePayment = await getPortOnePayment(paymentId);

    if (!portonePayment || portonePayment.status !== 'PAID') {
      return {
        success: false,
        message: '결제가 완료되지 않았습니다.',
      };
    }

    // 3. 우리 서버의 주문 정보 조회
    const orderResponse = await fetch(`${API_URL}/orders/${orderIdFromClient}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!orderResponse.ok) {
      return {
        success: false,
        message: '주문 정보를 찾을 수 없습니다.',
      };
    }

    const orderData = await orderResponse.json();

    // 4. 주문 상태 업데이트 (결제 완료로 변경)
    const updateResponse = await fetch(`${API_URL}/orders/${orderIdFromClient}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        state: 'OS020', // 결제완료 상태로 변경
        extra: {
          ...orderData.item?.extra,
          paymentId: paymentId,
          paymentMethod: 'portone',
          paymentCompletedAt: new Date().toISOString(),
        },
      }),
    });

    if (!updateResponse.ok) {
      return {
        success: false,
        message: '주문 상태 업데이트에 실패했습니다.',
      };
    }

    // 5. 장바구니에서 주문된 상품 제거 (장바구니 구매인 경우)
    const cookieStore = await cookies();
    const tempCartIds = cookieStore.get('temp-cart-ids')?.value;

    if (tempCartIds) {
      try {
        const cartIds = JSON.parse(tempCartIds);
        for (const cartId of cartIds) {
          await fetch(`${API_URL}/carts/${cartId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'client-id': CLIENT_ID,
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }
        // 임시 장바구니 ID 쿠키 삭제
        cookieStore.delete('temp-cart-ids');
      } catch {
        // none-debug
      }
    }

    // 6. 임시 주문 데이터 쿠키 정리
    cookieStore.delete('temp-order');

    // 7. 관련 페이지 재검증
    revalidatePath('/shop');
    revalidatePath('/cart');
    revalidatePath('/my-page/order-history');

    return {
      success: true,
      message: '결제가 완료되었습니다.',
      data: {
        orderId: orderIdFromClient,
        paymentId: paymentId,
        redirectUrl: `/order/order-complete?orderId=${orderIdFromClient}`,
      },
    };
  } catch {
    return {
      success: false,
      message: '결제 검증 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 결제 취소 서버 액션 (테스트용)
 * @param {string} paymentId - PortOne 결제 ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function cancelPaymentAction(paymentId: string): Promise<{ success: boolean; message: string }> {
  try {
    const accessToken = await getPortOneAccessToken();
    if (!accessToken) {
      return {
        success: false,
        message: 'PortOne 인증에 실패했습니다.',
      };
    }

    const response = await fetch(`https://api.portone.io/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: '테스트 결제 취소',
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: '결제가 취소되었습니다.',
      };
    } else {
      return {
        success: false,
        message: '결제 취소에 실패했습니다.',
      };
    }
  } catch {
    return {
      success: false,
      message: '결제 취소 중 오류가 발생했습니다.',
    };
  }
}
