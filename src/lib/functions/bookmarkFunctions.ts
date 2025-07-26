// src/lib/functions/bookmarkFunctions.ts
import { ApiResPromise } from '@/types/api.types';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

// 북마크 관련 타입 정의
export interface Bookmark {
  _id: number;
  user_id: number;
  target_id: number;
  type: string;
  memo?: string;
  createdAt: string;
  product?: {
    _id: number;
    name: string;
    price: number;
    image?: {
      url: string;
      fileName: string;
      orgName: string;
    }[];
    extra?: {
      isNew?: boolean;
      isBest?: boolean;
      category?: string[];
    };
  };
}

export interface BookmarkListResponse {
  ok: number;
  item: Bookmark[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// 서버에서만 사용하는 함수들
// ============================================================================

/**
 * 서버에서 사용자의 액세스 토큰을 가져옵니다.
 */
async function getServerAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userAuthCookie = cookieStore.get('user-auth')?.value;

    if (!userAuthCookie) return null;

    const userData = JSON.parse(userAuthCookie);
    return userData?.state?.user?.token?.accessToken || null;
  } catch (error) {
    console.error('서버 토큰 파싱 오류:', error);
    return null;
  }
}

/**
 * 사용자의 북마크 목록을 조회합니다.
 * @param type - 북마크 타입 ('product' | 'user' | 'post')
 * @returns ApiResPromise<Bookmark[]>
 */
export async function getBookmarks(type: 'product' | 'user' | 'post'): ApiResPromise<Bookmark[]> {
  try {
    const accessToken = await getServerAccessToken();

    if (!accessToken) {
      return {
        ok: 0,
        message: '로그인이 필요합니다.',
      };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'client-id': CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    };

    const res = await fetch(`${API_URL}/bookmarks/${type}`, {
      headers,
      cache: 'no-store', // 북마크는 실시간 데이터이므로 캐시하지 않음
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '북마크 목록 조회에 실패했습니다.',
      };
    }

    return {
      ok: 1,
      item: data.item || [],
    };
  } catch (error) {
    console.error('북마크 목록 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 북마크 목록 조회에 실패했습니다.',
    };
  }
}

/**
 * 사용자의 상품 북마크 목록을 조회합니다.
 */
export async function getProductBookmarks(): ApiResPromise<Bookmark[]> {
  return getBookmarks('product');
}
