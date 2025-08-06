// src/lib/actions/shop/reviewServerActions.ts

'use server';

import { getAuthInfo } from '@/lib/utils/auth.server';
import { ApiRes } from '@/types/api.types';
import { ProductReply, ReplyActionResult, UpdateReplyRequest } from '@/types/review.types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/**
 * 리뷰를 수정하는 서버 액션
 * @param {number} replyId - 리뷰 ID
 * @param {UpdateReplyRequest} updateData - 수정할 데이터
 * @returns {Promise<ReplyActionResult>} - 수정 결과
 */
export async function updateReplyAction(replyId: number, updateData: UpdateReplyRequest): Promise<ReplyActionResult> {
  try {
    // 액세스 토큰 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }
    const { accessToken } = authInfo;

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

    return {
      success: true,
      message: '리뷰가 수정되었습니다.',
      data: data.item,
    };
  } catch {
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
    // 액세스 토큰 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }
    const { accessToken } = authInfo;

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

    if (!res.ok || data.ok === 0) {
      return {
        success: false,
        message: data.message || '리뷰 삭제에 실패했습니다.',
      };
    }

    // 상품 상세 페이지 재검증
    revalidatePath(`/shop/products/${productId}`);

    return {
      success: true,
      message: '리뷰가 삭제되었습니다.',
    };
  } catch {
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
  } catch {
    return { id: null, name: null };
  }
}
