'use server';

import { uploadFile } from '@/lib/actions/fileActions';
import { ApiRes } from '@/types/api.types';
import { Post } from '@/types/post.types';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

// 식물 관련 Post 타입 (extra 필드와 image 필드 포함)
interface PlantPost extends Post {
  extra?: {
    species?: string;
    location?: string;
  };
  image?: string;
}

// 식물 데이터 타입
export interface Plant {
  id: number;
  name: string;
  species: string;
  location: string;
  imageUrl: string;
  date: string;
  memo: string;
}

// 인증 정보 추출 유틸 함수
async function getAuthInfo() {
  const cookieStore = await cookies();
  const userAuthCookie = cookieStore.get('user-auth')?.value;
  if (!userAuthCookie) return null;
  const userData = JSON.parse(userAuthCookie);
  const accessToken = userData.state?.user?.token?.accessToken;
  const userId = userData.state?.user?._id;
  return accessToken && userId ? { accessToken, userId } : null;
}

/**
 * 내 식물 목록 조회
 * @returns ApiRes<Plant[]>
 */
export async function getMyPlants(): Promise<ApiRes<Plant[]>> {
  const cookieStore = await cookies();
  const userAuthCookie = cookieStore.get('user-auth')?.value;

  if (!userAuthCookie) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const userData = JSON.parse(userAuthCookie);
  const accessToken = userData.state?.user?.token?.accessToken;

  if (!accessToken) {
    return {
      ok: 0,
      message: '인증 토큰이 없습니다.',
    };
  }

  try {
    const res = await fetch(`${API_URL}/posts/users?type=plant`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '식물 목록 조회에 실패했습니다.',
      };
    }

    // API 응답(PlantPost[])을 Plant 형태로 변환
    const plants: Plant[] =
      data.item?.map((post: PlantPost) => ({
        id: post._id,
        name: post.title,
        species: post.extra?.species || '',
        location: post.extra?.location || '',
        imageUrl: post.image ? `${API_URL}/${post.image}` : '',
        date: post.createdAt?.split('T')[0] || '',
        memo: post.content || '',
      })) || [];

    return {
      ok: 1,
      item: plants,
    };
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 식물 목록을 불러오지 못했습니다.',
    };
  }
}

/**
 * 특정 식물 조회
 * @param plantId - 식물 ID
 * @returns ApiRes<Plant>
 */
export async function getPlantById(plantId: number): Promise<ApiRes<Plant>> {
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }
  const { accessToken } = auth;

  try {
    const res = await fetch(`${API_URL}/posts/${plantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '식물 정보 조회에 실패했습니다.',
      };
    }

    // API 응답(PlantPost)을 Plant 형태로 변환
    const post: PlantPost = data.item;
    const plant: Plant = {
      id: post._id,
      name: post.title,
      species: post.extra?.species || '',
      location: post.extra?.location || '',
      imageUrl: post.image ? `${API_URL}/${post.image}` : '',
      date: post.createdAt?.split('T')[0] || '',
      memo: post.content || '',
    };

    return {
      ok: 1,
      item: plant,
    };
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 식물 정보를 불러오지 못했습니다.',
    };
  }
}

/**
 * 식물 등록 (이미지 업로드 포함)
 * @param formData - 식물 정보가 담긴 FormData 객체 (name, species, location, memo, attach)
 * @returns ApiRes<Plant>
 */
export async function createPlant(formData: FormData): Promise<ApiRes<Plant>> {
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }
  const { accessToken } = auth;

  let image: string | undefined;
  const attach = formData.get('attach') as File;
  if (attach && attach.size > 0) {
    const fileRes = await uploadFile(formData);
    if (fileRes.ok) {
      image = fileRes.item[0].path;
    } else {
      return fileRes as ApiRes<Plant>;
    }
  }

  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const location = formData.get('location') as string;
  const memo = formData.get('memo') as string;

  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        type: 'plant',
        title: name,
        content: memo,
        extra: {
          species,
          location,
        },
        ...(image ? { image } : {}),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '식물 등록에 실패했습니다.',
      };
    }

    // API 응답(PlantPost)을 Plant 형태로 변환
    const post: PlantPost = data.item;
    const plant: Plant = {
      id: post._id,
      name: post.title,
      species: post.extra?.species || '',
      location: post.extra?.location || '',
      imageUrl: post.image ? `${API_URL}/${post.image}` : '',
      date: post.createdAt?.split('T')[0] || '',
      memo: post.content || '',
    };

    return {
      ok: 1,
      item: plant,
    };
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 식물을 등록하지 못했습니다.',
    };
  }
}

/**
 * 식물 정보 수정 (이미지 업로드 포함)
 * @param plantId - 식물 ID
 * @param formData - 수정할 식물 정보가 담긴 FormData 객체
 * @returns ApiRes<Plant>
 */
export async function updatePlant(plantId: number, formData: FormData): Promise<ApiRes<Plant>> {
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }
  const { accessToken } = auth;

  let image: string | undefined;
  const attach = formData.get('attach') as File;
  if (attach && attach.size > 0) {
    const fileRes = await uploadFile(formData);
    if (fileRes.ok) {
      image = fileRes.item[0].path;
    } else {
      return fileRes as ApiRes<Plant>;
    }
  }

  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const location = formData.get('location') as string;
  const memo = formData.get('memo') as string;

  try {
    const res = await fetch(`${API_URL}/posts/${plantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: name,
        content: memo,
        extra: {
          species,
          location,
        },
        ...(image ? { image } : {}),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '식물 정보 수정에 실패했습니다.',
      };
    }

    // API 응답(PlantPost)을 Plant 형태로 변환
    const post: PlantPost = data.item;
    const plant: Plant = {
      id: post._id,
      name: post.title,
      species: post.extra?.species || '',
      location: post.extra?.location || '',
      imageUrl: post.image ? `${API_URL}/${post.image}` : '',
      date: post.createdAt?.split('T')[0] || '',
      memo: post.content || '',
    };

    return {
      ok: 1,
      item: plant,
    };
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 식물 정보를 수정하지 못했습니다.',
    };
  }
}

/**
 * 식물 삭제
 * @param plantId - 삭제할 식물 ID
 * @returns ApiRes<void>
 */
export async function deletePlant(plantId: number): Promise<ApiRes<void>> {
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }
  const { accessToken } = auth;

  try {
    const res = await fetch(`${API_URL}/posts/${plantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '식물 삭제에 실패했습니다.',
      };
    }

    return {
      ok: 1,
      item: undefined,
    };
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 식물을 삭제하지 못했습니다.',
    };
  }
}
