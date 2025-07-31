'use server';

import { GreenMagazineRes, MagazinePostData } from '@/app/green-magazine/_types/magazine.types';

const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.CLIENT_ID || '';

// 최신순 기준으로 매거진 게시글 가져옴
export async function magazineForHome(limit = 5): Promise<MagazinePostData[]> {
  try {
    const params = new URLSearchParams({
      type: 'magazine',
      limit: limit.toString(),
      sort: JSON.stringify({ createdAt: -1 }),
    });

    const res = await fetch(`${API_URL}/posts?${params.toString()}`, {
      headers: {
        'Client-Id': CLIENT_ID,
      },
      cache: 'force-cache',
    });

    const data: GreenMagazineRes = await res.json();

    if (!data.ok || !data.item) return [];

    return data.item;
  } catch {
    throw new Error('홈의 Green Magazine 데이터를 불러오는 데 실패했습니다.');
  }
}
