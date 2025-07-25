// src/lib/actions/productActions.ts
'use server';

import { ApiRes, BookmarkApiData } from '@/types/product';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

// ============================================================================
// 북마크 관련 서버 액션들
// ============================================================================

/**
 * 북마크를 토글하는 서버 액션
 * @param state - 이전 상태(사용하지 않음)
 * @param formData - 북마크 정보를 담은 FormData 객체
 * @returns Promise<ApiRes<BookmarkApiData>> - 결과 응답 객체
 */
export async function toggleBookmark(state: ApiRes<BookmarkApiData> | null, formData: FormData): Promise<ApiRes<BookmarkApiData>> {
  const body = Object.fromEntries(formData.entries());

  try {
    // TODO: 실제 구현시 사용자 토큰 필요
    const res = await fetch(`${API_URL}/bookmarks/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.ok) {
      revalidatePath('/shop');
      revalidatePath('/my-page/bookmarks');
    }

    return data;
  } catch (error) {
    console.error('북마크 처리 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 북마크 처리에 실패했습니다.',
    };
  }
}

/**
 * 북마크 목록을 가져오는 함수
 * @param type - 북마크 타입 ('product')
 * @returns Promise<ApiRes<BookmarkApiData[]>> - 북마크 목록 응답
 */
export async function getBookmarks(type: string = 'product'): Promise<ApiRes<BookmarkApiData[]>> {
  try {
    // TODO: 실제 구현시 사용자 토큰 필요
    const res = await fetch(`${API_URL}/bookmarks/${type}`, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        // 'Authorization': `Bearer ${token}`,
      },
    });

    return res.json();
  } catch (error) {
    console.error('북마크 목록 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 북마크 목록 조회에 실패했습니다.',
    };
  }
}
