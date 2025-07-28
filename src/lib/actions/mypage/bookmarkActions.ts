/**
 * @fileoverview 마이페이지 북마크 관련 서버 액션들
 * @description 북마크 삭제 기능을 제공합니다.
 */

'use server';

import { getAuthInfo } from '@/lib/utils/auth.server';

// API 서버 설정
const API_BASE_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/**
 * 북마크 삭제 API 요청 함수
 */
async function deleteBookmarkApi(bookmarkId: number, accessToken: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || '북마크 삭제에 실패했습니다.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('북마크 삭제 API 오류:', error);
    return {
      success: false,
      message: '네트워크 오류로 북마크 삭제에 실패했습니다.',
    };
  }
}

/**
 * 북마크 삭제 서버 액션
 * @param bookmarkId 삭제할 북마크 ID
 * @returns 삭제 결과
 */
export async function deleteBookmark(bookmarkId: number): Promise<{ success: boolean; message?: string }> {
  try {
    // 인증 정보 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // 북마크 삭제 API 호출
    const result = await deleteBookmarkApi(bookmarkId, authInfo.accessToken);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      message: '북마크가 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    console.error('북마크 삭제 중 오류 발생:', error);
    return {
      success: false,
      message: '북마크 삭제 중 오류가 발생했습니다.',
    };
  }
}
