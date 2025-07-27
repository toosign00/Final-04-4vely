// src/lib/actions/cartServerActions.ts

'use server';

import { AddToCartRequest, CartActionResult, CartApiResponse, CartItem, CartListApiResponse } from '@/types/cart.types';
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
    console.error('[Cart 서버 액션] 토큰 파싱 오류:', error);
    return null;
  }
}

/**
 * 장바구니 목록을 조회하는 서버 액션
 * @returns {Promise<CartItem[]>} 장바구니 아이템 목록
 */
export async function getCartItemsAction(): Promise<CartItem[]> {
  try {
    console.log('[Cart 서버 액션] 장바구니 목록 조회 시작');

    // 액세스 토큰 확인
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log('[Cart 서버 액션] 로그인되지 않은 사용자');
      return [];
    }

    // API 요청
    const res = await fetch(`${API_URL}/carts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-cache',
    });

    const data: CartListApiResponse = await res.json();

    if (!res.ok || data.ok === 0) {
      return [];
    }

    return data.item || [];
  } catch (error) {
    console.error('[Cart 서버 액션] 네트워크 오류:', error);
    return [];
  }
}

/**
 * 장바구니에 상품을 추가하는 서버 액션
 * @param {AddToCartRequest} cartData - 장바구니 추가 데이터
 * @returns {Promise<CartActionResult>} 추가 결과
 * @example
 * const result = await addToCartAction({
 *   product_id: 1,
 *   quantity: 2,
 *   extra: { potColor: '흑색' }
 * });
 */
export async function addToCartAction(cartData: AddToCartRequest): Promise<CartActionResult> {
  try {
    console.log('[Cart 서버 액션] 장바구니 추가 시작:', cartData);

    // 액세스 토큰 확인
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log('[Cart 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // API 요청
    const res = await fetch(`${API_URL}/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(cartData),
    });

    const data: CartApiResponse = await res.json();
    console.log('[Cart 서버 액션] API 응답:', { status: res.status, ok: data.ok });

    if (!res.ok || data.ok === 0) {
      return {
        success: false,
        message: '장바구니 추가에 실패했습니다.',
      };
    }

    // 장바구니 페이지 재검증
    revalidatePath('/cart');

    console.log('[Cart 서버 액션] 장바구니 추가 성공');
    return {
      success: true,
      message: '장바구니에 추가되었습니다.',
      data: data.item,
    };
  } catch (error) {
    console.error('[Cart 서버 액션] 네트워크 오류:', error);
    return {
      success: false,
      message: '일시적인 네트워크 문제로 장바구니 추가에 실패했습니다.',
    };
  }
}

/**
 * 장바구니에서 상품을 삭제하는 서버 액션
 * @param {number} cartId - 장바구니 아이템 ID
 * @returns {Promise<CartActionResult>} 삭제 결과
 */
export async function removeFromCartAction(cartId: number): Promise<CartActionResult> {
  try {
    console.log('[Cart 서버 액션] 장바구니 삭제 시작:', cartId);

    // 액세스 토큰 확인
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log('[Cart 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // API 요청
    const res = await fetch(`${API_URL}/carts/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    console.log('[Cart 서버 액션] API 응답:', { status: res.status, ok: data.ok });

    if (!res.ok || data.ok === 0) {
      return {
        success: false,
        message: '장바구니 삭제에 실패했습니다.',
      };
    }

    // 장바구니 페이지 재검증
    revalidatePath('/cart');

    console.log('[Cart 서버 액션] 장바구니 삭제 성공');
    return {
      success: true,
      message: '장바구니에서 삭제되었습니다.',
    };
  } catch (error) {
    console.error('[Cart 서버 액션] 네트워크 오류:', error);
    return {
      success: false,
      message: '일시적인 네트워크 문제로 장바구니 삭제에 실패했습니다.',
    };
  }
}

/**
 * 장바구니 수량을 업데이트하는 서버 액션
 * @param {number} cartId - 장바구니 아이템 ID
 * @param {number} quantity - 새로운 수량
 * @returns {Promise<CartActionResult>} 업데이트 결과
 */
export async function updateCartQuantityAction(cartId: number, quantity: number): Promise<CartActionResult> {
  try {
    console.log('[Cart 서버 액션] 수량 업데이트 시작:', { cartId, quantity });

    // 액세스 토큰 확인
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log('[Cart 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // API 요청
    const res = await fetch(`${API_URL}/carts/${cartId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ quantity }),
    });

    const data: CartApiResponse = await res.json();
    console.log('[Cart 서버 액션] API 응답:', { status: res.status, ok: data.ok });

    if (!res.ok || data.ok === 0) {
      return {
        success: false,
        message: '수량 업데이트에 실패했습니다.',
      };
    }

    // 장바구니 페이지 재검증
    revalidatePath('/cart');

    console.log('[Cart 서버 액션] 수량 업데이트 성공');
    return {
      success: true,
      message: '수량이 업데이트되었습니다.',
      data: data.item,
    };
  } catch (error) {
    console.error('[Cart 서버 액션] 네트워크 오류:', error);
    return {
      success: false,
      message: '일시적인 네트워크 문제로 수량 업데이트에 실패했습니다.',
    };
  }
}

/**
 * 사용자의 로그인 상태를 확인하는 서버 액션
 * @returns {Promise<boolean>} 로그인 여부
 */
export async function checkLoginStatusAction(): Promise<boolean> {
  try {
    const accessToken = await getServerAccessToken();
    return !!accessToken;
  } catch (error) {
    console.error('[Cart 서버 액션] 로그인 상태 확인 오류:', error);
    return false;
  }
}
