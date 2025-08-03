// src/lib/actions/cart/cartServerActions.ts

'use server';

import { getAuthInfo } from '@/lib/utils/auth.server';
import { AddToCartRequest, CartActionResult, CartApiResponse, CartItem, CartListApiResponse } from '@/types/cart.types';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/**
 * 장바구니 목록을 조회하는 서버 액션
 * @returns {Promise<CartItem[]>} 장바구니 아이템 목록
 */
export async function getCartItemsActionOptimized(): Promise<CartItem[]> {
  try {
    console.log('[Cart 서버 액션] 장바구니 목록 조회 시작');

    const authInfo = await getAuthInfo();
    if (!authInfo) {
      console.log('[Cart 서버 액션] 로그인되지 않은 사용자');
      return [];
    }
    const { accessToken } = authInfo;

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

    const cartItems = data.item || [];

    // 색상이 선택된 상품들만 상세 정보 조회
    const enrichedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        // 색상이 선택되지 않은 경우 그대로 반환 (color 체크)
        if (!item.color) {
          return item;
        }

        try {
          // 캐시된 상품 상세 정보 사용
          const productRes = await fetch(`${API_URL}/products/${item.product._id}`, {
            headers: {
              'Content-Type': 'application/json',
              'client-id': CLIENT_ID,
            },
            next: { revalidate: 3600 }, // 1시간 캐싱
          });

          if (productRes.ok) {
            const productData = await productRes.json();

            if (productData.ok && productData.item) {
              const mainImages = productData.item.mainImages || [];
              const potColors = productData.item.extra?.potColors || [];

              if (potColors.length > 0 && mainImages.length > 0) {
                // color 필드를 사용
                const selectedColor = item.color;
                const colorIndex = potColors.findIndex((color: string) => color === selectedColor);
                const selectedImage = mainImages[colorIndex] || mainImages[0] || item.product.image;

                item.product = {
                  ...item.product,
                  image: selectedImage,
                  mainImages: mainImages,
                  extra: productData.item.extra,
                };
              }
            }
          }
        } catch (error) {
          console.error(`[Cart 서버 액션] 상품 ${item.product._id} 상세 조회 실패:`, error);
        }

        return item;
      }),
    );

    return enrichedCartItems;
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
 *   color: '흑색'  // 화분 색상 옵션
 * });
 */
export async function addToCartAction(cartData: AddToCartRequest): Promise<CartActionResult> {
  try {
    console.log('[Cart 서버 액션] 장바구니 추가 시작:', cartData);

    // 액세스 토큰 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      console.log('[Cart 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }
    const { accessToken } = authInfo;

    // API 요청
    const res = await fetch(`${API_URL}/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: cartData.product_id,
        quantity: cartData.quantity,
        color: cartData.color, // 화분 색상을 color로 전송
      }),
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
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      console.log('[Cart 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }
    const { accessToken } = authInfo;

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
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      console.log('[Cart 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }
    const { accessToken } = authInfo;

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
 * 장바구니 옵션(색상)을 업데이트하는 서버 액션
 * API가 color 필드 업데이트를 지원하지 않으므로, 삭제 후 재추가 방식으로 구현
 * @param {number} cartId - 장바구니 아이템 ID
 * @param {number} productId - 상품 ID
 * @param {number} quantity - 수량
 * @param {string} color - 새로운 색상
 * @returns {Promise<CartActionResult>} 업데이트 결과
 */
export async function updateCartOptionAction(cartId: number, productId: number, quantity: number, color: string): Promise<CartActionResult> {
  try {
    console.log('[Cart 서버 액션] 옵션 업데이트 시작:', { cartId, productId, quantity, color });

    // 액세스 토큰 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      console.log('[Cart 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }
    const { accessToken } = authInfo;

    // 1. 기존 아이템 삭제
    const deleteRes = await fetch(`${API_URL}/carts/${cartId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const deleteData = await deleteRes.json();
    console.log('[Cart 서버 액션] 삭제 응답:', { status: deleteRes.status, ok: deleteData.ok });

    if (!deleteRes.ok || deleteData.ok === 0) {
      return {
        success: false,
        message: '기존 상품 삭제에 실패했습니다.',
      };
    }

    // 2. 새로운 색상으로 재추가
    const addRes = await fetch(`${API_URL}/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
        color: color, // 새로운 색상
      }),
    });

    const addData: CartApiResponse = await addRes.json();
    console.log('[Cart 서버 액션] 추가 응답:', { status: addRes.status, ok: addData.ok });

    if (!addRes.ok || addData.ok === 0) {
      // 추가 실패 시 원래 상태로 복구 시도
      console.error('[Cart 서버 액션] 재추가 실패, 복구 불가능');
      return {
        success: false,
        message: '옵션 변경에 실패했습니다. 장바구니를 다시 확인해주세요.',
      };
    }

    // 장바구니 페이지 재검증
    revalidatePath('/cart');

    console.log('[Cart 서버 액션] 옵션 업데이트 성공');
    return {
      success: true,
      message: '옵션이 변경되었습니다.',
      data: addData.item,
    };
  } catch (error) {
    console.error('[Cart 서버 액션] 네트워크 오류:', error);
    return {
      success: false,
      message: '일시적인 네트워크 문제로 옵션 변경에 실패했습니다.',
    };
  }
}

/**
 * 로그인 상태를 확인하는 서버 액션
 * @returns {Promise<boolean>} 로그인 여부
 */
export async function checkLoginStatusAction(): Promise<boolean> {
  const authInfo = await getAuthInfo();
  return !!authInfo;
}
