// src/lib/functions/shop/reviewServerFunctions.ts

import { getAuthInfo } from '@/lib/utils/auth.server';
import { ApiResPromise } from '@/types/api.types';
import { ProductReply } from '@/types/review.types';

const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/**
 * 특정 상품의 리뷰 목록을 가져옵니다
 * @param {number} productId - 상품 ID
 * @returns {Promise<ApiRes<ProductReply[]>>} - 리뷰 목록 응답 객체
 */
export async function getProductReplies(productId: number): ApiResPromise<ProductReply[]> {
  try {
    console.log(`[리뷰 조회] 상품 ID: ${productId}`);

    const res = await fetch(`${API_URL}/replies/products/${productId}?full_name=true`, { // full_name을 사용하여 작성자명의 마스킹 해제
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
      cache: 'no-cache',
    });

    const data = await res.json();
    console.log(`[리뷰 조회] 응답:`, {
      status: res.status,
      ok: data.ok,
      itemCount: data.item?.length || 0,
    });

    if (!res.ok) {
      console.error('[리뷰 조회] 오류:', data.message);
      return {
        ok: 0,
        message: data.message || '리뷰 조회에 실패했습니다.',
      };
    }

    return data;
  } catch (error) {
    console.error('[리뷰 조회] 네트워크 오류:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 리뷰 조회에 실패했습니다.',
    };
  }
}

/**
 * 특정 리뷰의 상세 정보를 가져옵니다
 * @param {number} replyId - 리뷰 ID
 * @returns {Promise<ApiRes<ProductReply>>} - 리뷰 상세 정보 응답 객체
 */
export async function getReply(replyId: number): ApiResPromise<ProductReply> {
  try {
    console.log(`[리뷰 상세 조회] 리뷰 ID: ${replyId}`);

    const res = await fetch(`${API_URL}/replies/${replyId}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
      cache: 'no-cache',
    });

    const data = await res.json();
    console.log(`[리뷰 상세 조회] 응답:`, { status: res.status, ok: data.ok });

    if (!res.ok) {
      console.error('[리뷰 상세 조회] 오류:', data.message);
      return {
        ok: 0,
        message: data.message || '리뷰 조회에 실패했습니다.',
      };
    }

    return data;
  } catch (error) {
    console.error('[리뷰 상세 조회] 네트워크 오류:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 리뷰 조회에 실패했습니다.',
    };
  }
}

/**
 * 현재 사용자가 특정 리뷰의 작성자인지 확인합니다
 * @param {number} replyUserId - 리뷰 작성자 ID
 * @returns {Promise<boolean>} - 작성자 여부
 */
export async function isReplyAuthor(replyUserId: number): Promise<boolean> {
  try {
    const authInfo = await getAuthInfo();

    if (!authInfo) return false;

    return authInfo.userId === replyUserId;
  } catch (error) {
    console.error('[리뷰 작성자 확인] 오류:', error);
    return false;
  }
}
