/**
 * @fileoverview 북마크 API 관련 함수들
 */

import { BookmarkItem, PostDetail, ProductDetail } from '@/types/mypageBookmark.types';

// API 서버 설정
const API_BASE_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/**
 * API 요청 헬퍼 함수
 */
async function apiRequest<T>(endpoint: string, headers: Record<string, string> = {}): Promise<T | null> {
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
 * 사용자의 북마크 목록 조회 (클라이언트용)
 */
export async function getBookmarks(type: 'product' | 'community' | 'post', accessToken?: string): Promise<{ ok: number; item?: BookmarkItem[]; message?: string }> {
  if (!accessToken) {
    return { ok: 0, message: '로그인이 필요합니다.' };
  }

  // community 타입은 API에서 'post'로 요청
  const apiType = type === 'community' ? 'post' : type;

  const result = await apiRequest<{ ok: number; item: BookmarkItem[] }>(`/bookmarks/${apiType}`, { Authorization: `Bearer ${accessToken}` });

  return result || { ok: 0, message: '일시적인 네트워크 문제로 북마크 목록 조회에 실패했습니다.' };
}

/**
 * 개별 상품의 상세 정보 조회
 */
export async function getProductDetail(productId: number): Promise<ProductDetail | null> {
  const result = await apiRequest<{ ok: number; item: ProductDetail }>(`/products/${productId}`);
  return result?.ok ? result.item : null;
}

/**
 * 개별 커뮤니티 게시글의 상세 정보 조회
 */
export async function getPostDetail(postId: number): Promise<PostDetail | null> {
  const result = await apiRequest<{ ok: number; item: PostDetail }>(`/posts/${postId}`);
  return result?.ok ? result.item : null;
}
