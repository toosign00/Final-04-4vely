// src/lib/actions/order/orderServerActions.ts

'use server';

import { CreateOrderApiResponse, CreateOrderRequest, DirectPurchaseItem, Order, OrderPageData, PurchaseActionResult } from '@/types/order.types';
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
    const shippingFee = 3000;

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
 * @param {number[]} selectedCartIds - 선택된 장바구니 아이템 ID들
 * @returns {Promise<boolean>} 생성 성공 여부
 */
export async function createCartPurchaseTempOrderAction(selectedCartIds: number[]): Promise<boolean> {
  try {
    console.log('[Order 서버 액션] 장바구니 구매 임시 주문 생성 시작:', selectedCartIds);

    // 액세스 토큰 확인
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log('[Order 서버 액션] 로그인 필요');
      return false;
    }

    // 장바구니 아이템 정보 가져오기
    const { getCartItemsActionOptimized } = await import('@/lib/actions/cartServerActions');
    const cartItems = await getCartItemsActionOptimized();

    // 선택된 아이템만 필터링
    const selectedItems = cartItems.filter((item) => selectedCartIds.includes(item._id));

    if (selectedItems.length === 0) {
      console.log('[Order 서버 액션] 선택된 장바구니 아이템이 없음');
      return false;
    }

    // DirectPurchaseItem 형태로 변환
    const purchaseItems: DirectPurchaseItem[] = selectedItems.map((item) => {
      // 이미지 URL 처리
      let imageUrl = '/images/placeholder-plant.jpg';
      if (item.product.image) {
        if (item.product.image.startsWith('http')) {
          imageUrl = item.product.image;
        } else {
          const normalizedPath = item.product.image.startsWith('/') ? item.product.image : `/${item.product.image}`;
          imageUrl = normalizedPath;
        }
      }

      return {
        productId: item.product._id,
        productName: item.product.name,
        productImage: imageUrl,
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.color
          ? {
              colorIndex: 0,
              colorName: item.color, // color 필드 사용
            }
          : undefined,
      };
    });

    // 총 금액 계산
    const totalAmount = purchaseItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = 3000;

    // 임시 주문 데이터 생성
    const orderData: OrderPageData = {
      type: 'cart',
      items: purchaseItems,
      totalAmount,
      shippingFee,
    };

    // 임시 주문 데이터 저장
    const orderSaved = await saveTempOrderAction(orderData);
    if (!orderSaved) {
      console.log('[Order 서버 액션] 임시 주문 데이터 저장 실패');
      return false;
    }

    // 선택된 장바구니 아이템 ID들을 별도로 저장
    const cookieStore = await cookies();
    cookieStore.set('temp-cart-ids', JSON.stringify(selectedCartIds), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1시간
      path: '/',
    });

    console.log('[Order 서버 액션] 장바구니 구매 임시 주문 생성 완료');
    return true;
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

    // 장바구니 아이템 ID들 가져오기
    let cartItemIds: number[] = [];
    if (isCartOrder) {
      const cookieStore = await cookies();
      const cartIdsCookie = cookieStore.get('temp-cart-ids')?.value;
      if (cartIdsCookie) {
        cartItemIds = JSON.parse(cartIdsCookie);
        console.log('[Order 서버 액션] 삭제할 장바구니 아이템 IDs:', cartItemIds);
      }
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

    // 주문 생성 성공 후 장바구니 아이템 삭제
    if (isCartOrder && cartItemIds.length > 0) {
      console.log('[Order 서버 액션] 장바구니 아이템 삭제 시작');

      // removeFromCartAction 임포트해서 사용
      const { removeFromCartAction } = await import('@/lib/actions/cartServerActions');

      // 모든 장바구니 아이템 삭제 (병렬 처리)
      const deletePromises = cartItemIds.map((cartId) =>
        removeFromCartAction(cartId).catch((error) => {
          console.error(`[Order 서버 액션] 장바구니 아이템 ${cartId} 삭제 실패:`, error);
          return null;
        }),
      );

      await Promise.all(deletePromises);
      console.log('[Order 서버 액션] 장바구니 아이템 삭제 완료');

      // temp-cart-ids 쿠키 삭제
      const cookieStore = await cookies();
      cookieStore.delete('temp-cart-ids');
    }

    // 임시 주문 데이터 삭제
    await clearTempOrderAction();

    // 장바구니 페이지 재검증
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
export async function getOrderByIdAction(orderId: number): Promise<PurchaseActionResult & { orderData?: Order }> {
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

    // API 요청 - populate 파라미터 추가하여 상품 정보도 함께 조회
    const res = await fetch(`${API_URL}/orders/${orderId}?populate=products.product`, {
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

    // 상품 정보가 없는 경우 별도로 조회
    if (data.item && data.item.products) {
      for (const product of data.item.products) {
        if (!product.product && product.product_id) {
          // 상품 정보 개별 조회
          const productRes = await fetch(`${API_URL}/products/${product.product_id}`, {
            headers: {
              'Content-Type': 'application/json',
              'client-id': CLIENT_ID,
            },
          });

          if (productRes.ok) {
            const productData = await productRes.json();
            product.product = productData.item;
          }
        }
      }
    }

    console.log('[Order 서버 액션] 주문 조회 성공:', data.item);
    return {
      success: true,
      message: '주문 정보를 성공적으로 조회했습니다.',
      data: {
        orderId: data.item?._id,
      },
      orderData: data.item, // 전체 주문 데이터 반환
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
 * 현재 로그인한 사용자의 주소 정보를 가져오는 서버 액션
 * @returns {Promise<{address: string | null, name: string | null, phone: string | null, userId: number | null}>} 사용자 정보
 */
export async function getUserAddressAction(): Promise<{
  address: string | null;
  name: string | null;
  phone: string | null;
  userId: number | null;
}> {
  try {
    const cookieStore = await cookies();
    const userAuthCookie = cookieStore.get('user-auth')?.value;

    if (!userAuthCookie) {
      console.log('[getUserAddressAction] 로그인되지 않은 사용자');
      return { address: null, name: null, phone: null, userId: null };
    }

    const userData = JSON.parse(userAuthCookie);
    const userId = userData?.state?.user?._id;
    const accessToken = userData?.state?.user?.token?.accessToken;

    console.log('[getUserAddressAction] 사용자 정보:', {
      userId,
      hasToken: !!accessToken,
    });

    if (!userId || !accessToken) {
      console.log('[getUserAddressAction] 사용자 정보 불완전');
      return { address: null, name: null, phone: null, userId: null };
    }

    // API 요청
    const apiUrl = `${API_URL}/users/${userId}`;
    console.log('[getUserAddressAction] API 호출:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseText = await res.text();
    console.log('[getUserAddressAction] API 응답 상태:', res.status);
    console.log('[getUserAddressAction] API 응답 텍스트:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[getUserAddressAction] JSON 파싱 오류:', e);
      return { address: null, name: null, phone: null, userId: null };
    }

    if (!res.ok || data.ok === 0) {
      console.error('[getUserAddressAction] API 오류:', data.message || 'Unknown error');
      return { address: null, name: null, phone: null, userId: null };
    }

    // API 응답에서 사용자 정보 추출
    const userInfo = data.item;
    console.log('[getUserAddressAction] 사용자 정보 조회 성공:', {
      name: userInfo?.name,
      phone: userInfo?.phone,
      address: userInfo?.address,
      hasAddress: !!userInfo?.address,
    });

    return {
      address: userInfo?.address || null,
      name: userInfo?.name || null,
      phone: userInfo?.phone || null,
      userId: userId,
    };
  } catch (error) {
    console.error('[getUserAddressAction] 예외 발생:', error);
    return { address: null, name: null, phone: null, userId: null };
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
