'use server';

import { MagazinePostData } from '@/app/green-magazine/_types/magazine.types';
import { ApiResPromise } from '@/types/api.types';

const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.CLIENT_ID || '';

export async function fetchMagazine(magazine: string): ApiResPromise<MagazinePostData[]> {
  try {
    const res = await fetch(`${API_URL}/posts?type=${magazine}`, {
      headers: {
        'Client-Id': CLIENT_ID,
      },
      cache: 'force-cache',
    });
    return res.json();
  } catch (error) {
    console.error(error);
    return { ok: 0, message: '일시적인 네트워크 문제로 목록을 불러올 수 없습니다.' };
  }
}
