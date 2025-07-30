'use server';

import { MagazinePostData } from '@/app/green-magazine/_types/magazine.types';
import { ApiResPromise } from '@/types/api.types';

const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.CLIENT_ID || '';

export async function fetchMagazineDetail(id: number): ApiResPromise<MagazinePostData> {
  try {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      headers: {
        'Client-Id': CLIENT_ID,
      },
      cache: 'no-store',
    });

    return res.json();
  } catch {
    throw new Error('일시적인 네트워크 오류로 매거진 상세 데이터를 불러올 수 없습니다.');
  }
}
