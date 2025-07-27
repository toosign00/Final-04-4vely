'use server';

import { ApiRes } from '@/types/api.types';
import { ProductApiData } from '@/types/product';

const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 날씨 조건별 팁과 해당 조건에 맞는 식물 추천
 */
export async function plantByWeather(tags?: string[]): Promise<ApiRes<ProductApiData[]>> {
  try {
    const params = new URLSearchParams({
      custom: JSON.stringify({ 'extra.tags': { $all: tags } }),
    });

    const res = await fetch(`${API_URL}/products?${params}`, {
      headers: {
        'Client-Id': CLIENT_ID,
      },
      cache: 'force-cache',
    });

    if (!res.ok) {
      return {
        ok: 0,
        message: `요청은 되었지만 식물 데이터를 불러오지 못했습니다. (status: ${res.status})`,
      };
    }

    const result = await res.json();

    return result;
  } catch (error) {
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 식물 데이터를 불러올 수 없습니다.',
    };
  }
}
