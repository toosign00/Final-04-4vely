// src/lib/actions/cartServerActions.ts

'use server';

import { AddToCartRequest, CartActionResult, CartApiResponse } from '@/types/cart.types';
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
