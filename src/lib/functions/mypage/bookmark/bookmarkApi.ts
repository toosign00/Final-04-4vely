/**
 * @fileoverview 북마크 API 관련 함수들
 */

'use server';

import { ApiRes } from '@/types/api.types';
import { BookmarkItem, PostDetail, ProductDetail } from '@/types/mypageBookmark.types';

const API_BASE_URL = process.env.API_SERVER || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * API 요청 공통 함수
 */
async function apiRequest<T>(endpoint: string, headers: Record<string, string> = {}): Promise<ApiRes<T> | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        ...headers,
      },
    });
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * 사용자의 북마크 목록 조회
 */
export async function getBookmarks(type: 'product' | 'post', accessToken?: string): Promise<ApiRes<BookmarkItem[]>> {
  if (!accessToken) {
    return { ok: 0, message: '로그인이 필요합니다.' };
  }

  const result = await apiRequest<BookmarkItem[]>(`/bookmarks/${type}`, { Authorization: `Bearer ${accessToken}` });

  return result || { ok: 0, message: '일시적인 네트워크 문제로 북마크 목록 조회에 실패했습니다.' };
}

/**
 * 개별 상품의 상세 정보 조회
 */
export async function getProductDetail(productId: number): Promise<ProductDetail | null> {
  const result = await apiRequest<ProductDetail>(`/products/${productId}`);
  return result?.ok ? result.item : null;
}

/**
 * 개별 게시글의 상세 정보 조회
 */
export async function getPostDetail(postId: number): Promise<PostDetail | null> {
  const result = await apiRequest<PostDetail>(`/posts/${postId}`);
  return result?.ok ? result.item : null;
}
