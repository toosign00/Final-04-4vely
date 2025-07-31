'use server';

import { GreenMagazineRes, MagazinePostData } from '@/app/green-magazine/_types/magazine.types';

const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.CLIENT_ID || '';

export async function magazineForHome(limit = 5): Promise<MagazinePostData[]> {
  try {
    const sortParam = encodeURIComponent(JSON.stringify({ createdAt: -1 }));

    const res = await fetch(`${API_URL}/posts?type=magazine&limit=${limit}&sort=${sortParam}`, {
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
