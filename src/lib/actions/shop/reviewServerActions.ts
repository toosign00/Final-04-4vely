// src/lib/actions/shop/reviewServerActions.ts

'use server';

import { ApiRes } from '@/types/api.types';
import { ProductReply, ReplyActionResult, UpdateReplyRequest } from '@/types/review.types';
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
    console.error('[Reply 서버 액션] 토큰 파싱 오류:', error);
    return null;
  }
}

/**
 * 리뷰를 수정하는 서버 액션
 * @param {number} replyId - 리뷰 ID
 * @param {UpdateReplyRequest} updateData - 수정할 데이터
 * @returns {Promise<ReplyActionResult>} - 수정 결과
 */
export async function updateReplyAction(replyId: number, updateData: UpdateReplyRequest): Promise<ReplyActionResult> {
  try {
    console.log('[Reply 서버 액션] 리뷰 수정 시작:', { replyId, updateData });

    // 액세스 토큰 확인
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log('[Reply 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // API 요청
    const res = await fetch(`${API_URL}/replies/${replyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData),
    });

    const data: ApiRes<ProductReply> = await res.json();
    console.log('[Reply 서버 액션] API 응답:', { status: res.status, ok: data.ok });

    if (!res.ok || data.ok === 0) {
      return {
        success: false,
        message: '리뷰 수정에 실패했습니다.',
      };
    }

    // 상품 상세 페이지 재검증
    if (data.item) {
      revalidatePath(`/shop/products/${data.item.product_id}`);
    }

    console.log('[Reply 서버 액션] 리뷰 수정 성공');
    return {
      success: true,
      message: '리뷰가 수정되었습니다.',
      data: data.item,
    };
  } catch (error) {
    console.error('[Reply 서버 액션] 네트워크 오류:', error);
    return {
      success: false,
      message: '일시적인 네트워크 문제로 리뷰 수정에 실패했습니다.',
    };
  }
}

/**
 * 리뷰를 삭제하는 서버 액션
 * @param {number} replyId - 리뷰 ID
 * @param {number} productId - 상품 ID (재검증용)
 * @returns {Promise<ReplyActionResult>} - 삭제 결과
 */
export async function deleteReplyAction(replyId: number, productId: number): Promise<ReplyActionResult> {
  try {
    console.log('[Reply 서버 액션] 리뷰 삭제 시작:', { replyId, productId });

    // 액세스 토큰 확인
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log('[Reply 서버 액션] 로그인 필요');
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // API 요청
    const res = await fetch(`${API_URL}/replies/${replyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    console.log('[Reply 서버 액션] API 응답:', { status: res.status, ok: data.ok });

    if (!res.ok || data.ok === 0) {
      return {
        success: false,
        message: data.message || '리뷰 삭제에 실패했습니다.',
      };
    }

    // 상품 상세 페이지 재검증
    revalidatePath(`/shop/products/${productId}`);

    console.log('[Reply 서버 액션] 리뷰 삭제 성공');
    return {
      success: true,
      message: '리뷰가 삭제되었습니다.',
    };
  } catch (error) {
    console.error('[Reply 서버 액션] 네트워크 오류:', error);
    return {
      success: false,
      message: '일시적인 네트워크 문제로 리뷰 삭제에 실패했습니다.',
    };
  }
}

/**
 * 현재 사용자 정보를 가져오는 서버 액션
 * @returns {Promise<{id: number | null, name: string | null}>} - 사용자 정보
 */
export async function getCurrentUserAction(): Promise<{ id: number | null; name: string | null }> {
  try {
    const cookieStore = await cookies();
    const userAuthCookie = cookieStore.get('user-auth')?.value;

    if (!userAuthCookie) {
      return { id: null, name: null };
    }

    const userData = JSON.parse(userAuthCookie);
    const user = userData?.state?.user;

    return {
      id: user?._id || null,
      name: user?.name || null,
    };
  } catch (error) {
    console.error('[Reply 서버 액션] 사용자 정보 조회 오류:', error);
    return { id: null, name: null };
  }
}
