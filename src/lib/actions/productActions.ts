'use server';

import { ApiRes, ApiResPromise } from '@/types/product';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

// 서버 액션용 타입 정의
interface CartItem {
  _id: number;
  product_id: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewItem {
  _id: number;
  user_id: number;
  product_id: number;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  _id: number;
  user_id: number;
  products: Array<{
    _id: number;
    quantity: number;
    price: number;
  }>;
  cost: {
    products: number;
    shippingFees: number;
    discount: {
      products: number;
      shippingFees: number;
    };
    total: number;
  };
  address: {
    name: string;
    value: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 장바구니에 상품을 추가하는 서버 액션
 * @param state - 이전 상태(사용하지 않음)
 * @param formData - 상품 정보를 담은 FormData 객체
 * @returns Promise<ApiRes<CartItem>> - 추가 결과 응답 객체
 */
export async function addToCart(state: ApiRes<CartItem> | null, formData: FormData): ApiResPromise<CartItem> {
  const body = Object.fromEntries(formData.entries());

  let res: Response;
  let data: ApiRes<CartItem>;

  try {
    res = await fetch(`${API_URL}/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        // TODO: 실제 구현시 사용자 토큰 추가
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.error('장바구니 추가 실패:', error);
    return { ok: 0, message: '일시적인 네트워크 문제로 장바구니 추가에 실패했습니다.' };
  }

  if (data.ok) {
    revalidatePath('/cart');
  }

  return data;
}

/**
 * 상품 리뷰를 작성하는 서버 액션
 * @param state - 이전 상태(사용하지 않음)
 * @param formData - 리뷰 정보를 담은 FormData 객체
 * @returns Promise<ApiRes<ReviewItem>> - 작성 결과 응답 객체
 */
export async function createReview(state: ApiRes<ReviewItem> | null, formData: FormData): ApiResPromise<ReviewItem> {
  const body = Object.fromEntries(formData.entries());

  let res: Response;
  let data: ApiRes<ReviewItem>;

  try {
    res = await fetch(`${API_URL}/products/${body.product_id}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        // TODO: 실제 구현시 사용자 토큰 추가
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.error('리뷰 작성 실패:', error);
    return { ok: 0, message: '일시적인 네트워크 문제로 리뷰 작성에 실패했습니다.' };
  }

  if (data.ok) {
    revalidatePath(`/shop/products/${body.product_id}`);
  }

  return data;
}

/**
 * 상품 리뷰를 수정하는 서버 액션
 * @param state - 이전 상태(사용하지 않음)
 * @param formData - 수정할 리뷰 정보를 담은 FormData 객체
 * @returns Promise<ApiRes<ReviewItem>> - 수정 결과 응답 객체
 */
export async function updateReview(state: ApiRes<ReviewItem> | null, formData: FormData): ApiResPromise<ReviewItem> {
  const body = Object.fromEntries(formData.entries());

  let res: Response;
  let data: ApiRes<ReviewItem>;

  try {
    res = await fetch(`${API_URL}/products/${body.product_id}/replies/${body.reply_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        // TODO: 실제 구현시 사용자 토큰 추가
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    return { ok: 0, message: '일시적인 네트워크 문제로 리뷰 수정에 실패했습니다.' };
  }

  if (data.ok) {
    revalidatePath(`/shop/products/${body.product_id}`);
  }

  return data;
}

/**
 * 상품 리뷰를 삭제하는 서버 액션
 * @param state - 이전 상태(사용하지 않음)
 * @param formData - 삭제할 리뷰 정보를 담은 FormData 객체
 * @returns Promise<ApiRes<{ deletedId: number }>> - 삭제 결과 응답 객체
 */
export async function deleteReview(state: ApiRes<{ deletedId: number }> | null, formData: FormData): ApiResPromise<{ deletedId: number }> {
  const body = Object.fromEntries(formData.entries());

  let res: Response;
  let data: ApiRes<{ deletedId: number }>;

  try {
    res = await fetch(`${API_URL}/products/${body.product_id}/replies/${body.reply_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        // TODO: 실제 구현시 사용자 토큰 추가
        // 'Authorization': `Bearer ${token}`,
      },
    });

    data = await res.json();
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    return { ok: 0, message: '일시적인 네트워크 문제로 리뷰 삭제에 실패했습니다.' };
  }

  if (data.ok) {
    revalidatePath(`/shop/products/${body.product_id}`);
  }

  return data;
}

/**
 * 상품을 구매하는 서버 액션
 * @param state - 이전 상태(사용하지 않음)
 * @param formData - 구매 정보를 담은 FormData 객체
 * @returns Promise<ApiRes<OrderItem>> - 구매 결과 응답 객체
 */
export async function purchaseProduct(state: ApiRes<OrderItem> | null, formData: FormData): ApiResPromise<OrderItem> {
  const body = Object.fromEntries(formData.entries());

  let res: Response;
  let data: ApiRes<OrderItem>;

  try {
    res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        // TODO: 실제 구현시 사용자 토큰 추가
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.error('상품 구매 실패:', error);
    return { ok: 0, message: '일시적인 네트워크 문제로 상품 구매에 실패했습니다.' };
  }

  // redirect는 예외를 throw 하는 방식이라서 try 문에서 사용하면 catch로 처리되므로 제대로 동작하지 않음
  if (data.ok) {
    revalidatePath('/my-page/order-history');
    redirect('/order/complete');
  } else {
    return data;
  }
}
