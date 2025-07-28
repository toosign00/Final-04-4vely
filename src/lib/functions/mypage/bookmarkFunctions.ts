/**
 * @fileoverview 북마크 관리를 위한 메인 함수들을 제공하는 모듈
 */

import { BookmarkItem, TransformedBookmarkItem } from '@/types/mypageBookmark.types';
import { getBookmarks } from './bookmarkApi';
import { transformCommunityBookmarks, transformProductBookmarks } from './bookmarkTransformers';
import { extractBookmarkArray } from './bookmarkUtils';

// 타입 재export
export type { BookmarkItem, TransformedBookmarkItem } from '@/types/mypageBookmark.types';

/**
 * 서버에서 사용자의 북마크 목록을 조회하고 UI에 최적화된 형태로 변환
 */
export async function getBookmarksFromServer(type: 'product' | 'community' | 'post'): Promise<{
  success: boolean;
  data?: TransformedBookmarkItem[];
  error?: string;
}> {
  try {
    const { getAuthInfo } = await import('@/lib/utils/auth.server');
    const authInfo = await getAuthInfo();

    if (!authInfo) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const response = await getBookmarks(type, authInfo.accessToken);

    if (!response.ok) {
      return {
        success: false,
        error: response.message || '북마크 목록을 불러올 수 없습니다.',
      };
    }

    // API 응답 데이터 정규화
    const bookmarkArray = extractBookmarkArray(response) as BookmarkItem[];

    let data: TransformedBookmarkItem[] = [];

    if (type === 'product') {
      data = await transformProductBookmarks(bookmarkArray);
    } else if (type === 'community' || type === 'post') {
      data = await transformCommunityBookmarks(bookmarkArray);
    }

    return { success: true, data };
  } catch (error) {
    console.error('북마크 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '북마크 목록 조회 중 오류가 발생했습니다.',
    };
  }
}
