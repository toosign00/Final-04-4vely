'use server';

import { ApiRes } from '@/types/api.types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

console.log('[북마크 액션] 환경변수 확인:', { API_URL, CLIENT_ID });

// ============================================================================
// 서버 액션 (클라이언트에서 호출 가능)
// ============================================================================

/**
 * 상품 북마크를 토글합니다 (추가/제거)
 * @param productId - 상품 ID
 * @returns 처리 결과
 */
export async function toggleProductBookmarkAction(productId: number): Promise<ApiRes<{ action: 'added' | 'removed'; bookmarkId?: number }>> {
  try {
    const cookieStore = await cookies();
    const userAuthCookie = cookieStore.get('user-auth')?.value;

    if (!userAuthCookie) {
      return {
        ok: 0,
        message: '로그인이 필요한 기능입니다.',
      };
    }

    const userData = JSON.parse(userAuthCookie);
    const accessToken = userData?.state?.user?.token?.accessToken;

    if (!accessToken) {
      return {
        ok: 0,
        message: '인증 토큰이 없습니다.',
      };
    }

    console.log(`[북마크 토글] 상품 ID: ${productId} (타입: ${typeof productId}) 처리 시작`);

    // 1. 먼저 기존 북마크가 있는지 확인 (특정 상품 API 사용)
    const existingBookmark = await checkExistingBookmarkForProduct(productId, accessToken);

    console.log('[북마크 토글] 기존 북마크 확인 결과:', existingBookmark);

    if (existingBookmark) {
      // 기존 북마크가 있으면 삭제
      console.log(`[북마크 토글] 북마크 삭제 시도: ${existingBookmark._id}`);
      const deleteResult = await removeBookmark(existingBookmark._id, accessToken);

      if (deleteResult.ok) {
        console.log('[북마크 토글] 삭제 성공');
        // 관련 페이지들 재검증
        revalidatePath('/shop');
        revalidatePath(`/shop/products/${productId}`);
        revalidatePath('/my-page/bookmarks');

        return {
          ok: 1,
          item: { action: 'removed' },
        };
      } else {
        console.log('[북마크 토글] 삭제 실패:', deleteResult);
        return {
          ok: 0,
          message: deleteResult.message || '북마크 삭제에 실패했습니다.',
        };
      }
    } else {
      // 기존 북마크가 없으면 추가
      console.log('[북마크 토글] 북마크 추가 시도');
      const addResult = await addBookmark(productId, accessToken);

      if (addResult.ok) {
        console.log('[북마크 토글] 추가 성공');
        // 관련 페이지들 재검증
        revalidatePath('/shop');
        revalidatePath(`/shop/products/${productId}`);
        revalidatePath('/my-page/bookmarks');

        return {
          ok: 1,
          item: { action: 'added', bookmarkId: addResult.item?._id },
        };
      } else {
        console.log('[북마크 토글] 추가 실패:', addResult);
        return {
          ok: 0,
          message: addResult.message || '북마크 추가에 실패했습니다.',
        };
      }
    }
  } catch (error) {
    console.error('[북마크 토글 액션] 오류:', error);
    return {
      ok: 0,
      message: '북마크 처리 중 오류가 발생했습니다.',
    };
  }
}

// ============================================================================
// 내부 함수들 (서버 액션에서만 사용)
// ============================================================================

/**
 * 특정 상품의 북마크 확인 - 올바른 API 사용
 */
async function checkExistingBookmarkForProduct(productId: number, accessToken: string) {
  try {
    console.log(`[특정 상품 북마크 확인] 상품 ID: ${productId}`);

    const res = await fetch(`${API_URL}/bookmarks/product/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`[특정 상품 북마크 확인] API 응답 상태: ${res.status}`);

    if (res.ok) {
      const data = await res.json();
      console.log('[특정 상품 북마크 확인] API 응답 데이터:', JSON.stringify(data, null, 2));

      // 이 API는 단일 북마크 객체를 반환함
      if (data.ok && data.item) {
        console.log('[특정 상품 북마크 확인] 북마크 발견:', {
          _id: data.item._id,
          memo: data.item.memo,
          createdAt: data.item.createdAt,
          productId: data.item.product?._id,
        });
        return data.item;
      } else {
        console.log('[특정 상품 북마크 확인] 북마크 없음 (data.ok=false 또는 data.item=null)');
        return null;
      }
    } else {
      // 404는 북마크가 없다는 의미일 수 있음
      if (res.status === 404) {
        console.log('[특정 상품 북마크 확인] 404 - 북마크 없음');
        return null;
      }

      const errorData = await res.json();
      console.error('[특정 상품 북마크 확인] API 오류:', errorData);
      return null;
    }
  } catch (error) {
    console.error('[특정 상품 북마크 확인] 네트워크 오류:', error);
    return null;
  }
}

/**
 * 북마크 추가 - 수정된 타입 반환
 */
async function addBookmark(productId: number, accessToken: string): Promise<ApiRes<{ _id: number }>> {
  try {
    console.log(`[북마크 추가] 상품 ID: ${productId} (타입: ${typeof productId})`);

    const requestBody = {
      target_id: productId,
      memo: '', // 선택적 메모
    };

    console.log('[북마크 추가] 요청 본문:', JSON.stringify(requestBody, null, 2));

    const res = await fetch(`${API_URL}/bookmarks/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[북마크 추가] API 응답 상태: ${res.status}`);

    const data = await res.json();
    console.log('[북마크 추가] API 응답 데이터:', JSON.stringify(data, null, 2));

    if (!res.ok) {
      console.error('[북마크 추가] API 오류:', data);
      return {
        ok: 0,
        message: data.message || '북마크 추가에 실패했습니다.',
      };
    }

    console.log('[북마크 추가] 성공:', { productId, bookmarkId: data.item?._id });
    return {
      ok: 1,
      item: data.item,
    };
  } catch (error) {
    console.error('[북마크 추가] 네트워크 오류:', error);
    return {
      ok: 0,
      message: '북마크 추가 중 서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 북마크 삭제 - 수정된 타입 반환
 */
async function removeBookmark(bookmarkId: number, accessToken: string): Promise<ApiRes<{ message: string }>> {
  try {
    console.log(`[북마크 삭제] 삭제할 북마크 ID: ${bookmarkId} (타입: ${typeof bookmarkId})`);

    const res = await fetch(`${API_URL}/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`[북마크 삭제] API 응답 상태: ${res.status}`);

    const data = await res.json();
    console.log('[북마크 삭제] API 응답 데이터:', JSON.stringify(data, null, 2));

    if (!res.ok) {
      console.error('[북마크 삭제] API 오류:', data);
      return {
        ok: 0,
        message: data.message || '북마크 삭제에 실패했습니다.',
      };
    }

    console.log('[북마크 삭제] 성공:', { bookmarkId });
    return {
      ok: 1,
      item: { message: '북마크가 삭제되었습니다.' },
    };
  } catch (error) {
    console.error('[북마크 삭제] 네트워크 오류:', error);
    return {
      ok: 0,
      message: '북마크 삭제 중 서버 오류가 발생했습니다.',
    };
  }
}
