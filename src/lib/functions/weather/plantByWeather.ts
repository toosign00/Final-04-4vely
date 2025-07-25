// 브루노랑 url 경로 차이나서 확인 필요

// 'use server';

// import { ApiRes } from '@/types/api.types';
// import { ProductApiData } from '@/types/product';

// const API_URL = process.env.API_URL;
// const CLIENT_ID = process.env.CLIENT_ID || '';

// /**
//  * 날씨 조건별 팁과 해당 조건에 맞는 식물 추천
//  */
// export async function plantByWeather(tags?: string[]): Promise<ApiRes<ProductApiData[]>> {
//   try {
//     const res = await fetch(`${API_URL}/products?custom={"extra.tags": {"$all":${tags}}}`, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Client-Id': CLIENT_ID,
//       },
//       cache: 'force-cache',
//     });

//     if (!res.ok) {
//       return {
//         ok: 0,
//         message: `요청은 되었지만 식물 데이터를 불러오지 못했습니다. (status: ${res.status})`,
//       };
//     }

//     const result = await res.json();

//     return result;
//   } catch (error) {
//     return {
//       ok: 0,
//       message: '일시적인 네트워크 문제로 식물 데이터를 불러올 수 없습니다.',
//     };
//   }
// }

'use server';

import { ApiRes } from '@/types/api.types';
import { ProductApiData } from '@/types/product';

const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.CLIENT_ID || '';

/** 조건에 현재 in으로 되어 있는데 추후 all로 변경해야 함 (현재 상품 10개 뿐이라 정확하지 않음)
 * 날씨 조건에 맞는 추천 식물 데이터 가져옴
 * - 클라이언트에서 encodeURIComponent를 사용하여 쿼리 인코딩
 */
export async function plantByWeather(tags?: string[]): Promise<ApiRes<ProductApiData[]>> {
  try {
    const res = await fetch(`${API_URL}/products?custom=${encodeURIComponent(JSON.stringify({ 'extra.tags': { $all: tags } }))}`, {
      headers: {
        'Content-Type': 'application/json',
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
