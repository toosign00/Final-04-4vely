// src/lib/functions/shop/bookmarkServerFunctions.ts

/**
 * 북마크 서버 함수
 * @description 서버 컴포넌트에서 사용하는 북마크 관련 함수들
 * @module bookmarkServerFunctions
 */

import { Bookmark, BookmarkListApiResponse, BookmarkType } from '@/types/bookmark.types';
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
    console.error('서버 토큰 파싱 오류:', error);
    return null;
  }
}

/**
 * 특정 대상의 북마크 정보를 조회합니다
 * @param {number} targetId - 대상 ID (상품 ID, 게시글 ID 등)
 * @param {BookmarkType} type - 북마크 타입
 * @returns {Promise<Bookmark | null>} 북마크 정보 또는 null
 * @example
 * // 상품 북마크 조회
 * const productBookmark = await getBookmarkByTarget(1, 'product');
 *
 * // 게시글 북마크 조회
 * const postBookmark = await getBookmarkByTarget(1, 'post');
 */
export async function getBookmarkByTarget(targetId: number, type: BookmarkType): Promise<Bookmark | null> {
  try {
    const accessToken = await getServerAccessToken();
    if (!accessToken) return null;

    console.log(`[서버 북마크 조회] ${type} ID: ${targetId}`);

    const res = await fetch(`${API_URL}/bookmarks/${type}/${targetId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-cache',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.item) {
        console.log(`[서버 북마크 조회] ${type} 북마크 발견:`, data.item._id);
        return data.item;
      }
    } else if (res.status === 404) {
      console.log(`[서버 북마크 조회] ${type} 북마크 없음`);
    }

    return null;
  } catch (error) {
    console.error(`[서버 북마크 조회] ${type} 오류:`, error);
    return null;
  }
}

/**
 * 사용자의 북마크 목록을 조회합니다
 * @param {BookmarkType} type - 북마크 타입
 * @param {Object} options - 조회 옵션
 * @param {number} options.page - 페이지 번호
 * @param {number} options.limit - 페이지당 항목 수
 * @returns {Promise<BookmarkListApiResponse>} 북마크 목록
 * @example
 * // 상품 북마크 목록 조회
 * const productBookmarks = await getBookmarks('product');
 *
 * // 게시글 북마크 목록 조회 (페이지네이션)
 * const postBookmarks = await getBookmarks('post', { page: 1, limit: 10 });
 */
export async function getBookmarks(type: BookmarkType, options?: { page?: number; limit?: number }): Promise<BookmarkListApiResponse> {
  try {
    const accessToken = await getServerAccessToken();

    if (!accessToken) {
      return {
        ok: 0,
        message: '로그인이 필요합니다.',
      };
    }

    const queryParams = new URLSearchParams();
    if (options?.page) queryParams.append('page', options.page.toString());
    if (options?.limit) queryParams.append('limit', options.limit.toString());

    const queryString = queryParams.toString();
    const url = `${API_URL}/bookmarks/${type}${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '북마크 목록 조회에 실패했습니다.',
      };
    }

    console.log(`[서버 북마크 목록] ${type} 북마크 ${data.item?.length || 0}개 조회됨`);

    return {
      ok: 1,
      item: data.item || [],
    };
  } catch (error) {
    console.error(`[서버 북마크 목록] ${type} 오류:`, error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 북마크 목록 조회에 실패했습니다.',
    };
  }
}

/**
 * 사용자의 상품 북마크 목록을 조회합니다
 * @param {Object} options - 조회 옵션
 * @returns {Promise<BookmarkListApiResponse>} 상품 북마크 목록
 */
export async function getProductBookmarks(options?: { page?: number; limit?: number }): Promise<BookmarkListApiResponse> {
  return getBookmarks('product', options);
}

/**
 * 사용자의 게시글 북마크 목록을 조회합니다
 * @param {Object} options - 조회 옵션
 * @returns {Promise<BookmarkListApiResponse>} 게시글 북마크 목록
 */
export async function getPostBookmarks(options?: { page?: number; limit?: number }): Promise<BookmarkListApiResponse> {
  return getBookmarks('post', options);
}

/**
 * 여러 대상의 북마크 정보를 병렬로 조회합니다
 * @param {Array<{id: number, type: BookmarkType}>} targets - 조회할 대상들
 * @returns {Promise<Map<string, Bookmark>>} 북마크 맵 (key: `${type}-${id}`)
 * @example
 * const targets = [
 *   { id: 1, type: 'product' },
 *   { id: 1, type: 'post' }
 * ];
 * const bookmarkMap = await getBulkBookmarks(targets);
 * const productBookmark = bookmarkMap.get('product-1');
 */
export async function getBulkBookmarks(targets: Array<{ id: number; type: BookmarkType }>): Promise<Map<string, Bookmark>> {
  const accessToken = await getServerAccessToken();
  if (!accessToken) return new Map();

  const bookmarkPromises = targets.map(({ id, type }) =>
    getBookmarkByTarget(id, type).then((bookmark) => ({
      key: `${type}-${id}`,
      bookmark,
    })),
  );

  const results = await Promise.all(bookmarkPromises);
  const bookmarkMap = new Map<string, Bookmark>();

  results.forEach(({ key, bookmark }) => {
    if (bookmark) {
      bookmarkMap.set(key, bookmark);
    }
  });

  console.log(`[서버 벌크 북마크] ${bookmarkMap.size}/${targets.length}개 북마크 조회됨`);
  return bookmarkMap;
}

/**
 * 북마크가 존재하는지 확인합니다
 * @param {number} targetId - 대상 ID
 * @param {BookmarkType} type - 북마크 타입
 * @returns {Promise<boolean>} 북마크 존재 여부
 */
export async function isBookmarked(targetId: number, type: BookmarkType): Promise<boolean> {
  const bookmark = await getBookmarkByTarget(targetId, type);
  return !!bookmark;
}

export { getServerAccessToken };
