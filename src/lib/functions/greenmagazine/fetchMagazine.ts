'use server';

import { GreenMagazineRes, MagazinePostData } from '@/app/green-magazine/_types/magazine.types';
import { getBulkBookmarks } from '@/lib/functions/shop/bookmarkServerFunctions';
import { getAuthInfo } from '@/lib/utils/auth.server';

const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.CLIENT_ID || '';

export async function fetchMagazine(type: string, page: number, limit: number): Promise<GreenMagazineRes> {
  try {
    const res = await fetch(`${API_URL}/posts?type=${type}&page=${page}&limit=${limit}`, {
      headers: {
        'Client-Id': CLIENT_ID,
      },
      cache: 'no-store',
    });
    const data: GreenMagazineRes = await res.json();

    if (!data.ok || !data.item) return data;

    // 로그인한 경우에만 북마크 여부 조회
    const authInfo = await getAuthInfo();
    if (!authInfo) return data;

    // 북마크 대상 리스트 생성
    const targets = data.item.map((post) => ({
      id: post._id,
      type: 'post' as const,
    }));

    // 병렬 북마크 조회
    const bookmarkMap = await getBulkBookmarks(targets);

    // 각 게시글에 myBookmarkId 추가
    const updatedItems: MagazinePostData[] = data.item.map((post) => {
      const key = `post-${post._id}`;
      const bookmark = bookmarkMap.get(key);
      return {
        ...post,
        myBookmarkId: bookmark?._id,
      };
    });

    return {
      ...data,
      item: updatedItems,
    };
  } catch {
    throw new Error('일시적인 네트워크 오류로 매거진 데이터를 불러올 수 없습니다.');
  }
}
