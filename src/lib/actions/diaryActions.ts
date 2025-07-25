'use server';

import { uploadFile } from '@/lib/actions/fileActions';
import { ApiRes } from '@/types/api.types';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 일지 댓글 타입 (API 응답 기반)
 */
export interface DiaryReply {
  _id: number;
  content: string;
  image?: string;
  user: {
    _id: number;
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
  extra?: {
    title?: string;
    date?: string;
    images?: string[]; // 다중 이미지 지원을 위한 확장
  };
}

/**
 * 다중 파일 업로드 함수
 */
async function uploadMultipleFiles(files: File[]): Promise<{ ok: boolean; paths?: string[]; message?: string }> {
  try {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('attach', file);
      const result = await uploadFile(formData);
      if (result.ok) {
        return result.item[0].path;
      } else {
        throw new Error(result.message);
      }
    });

    const paths = await Promise.all(uploadPromises);
    return { ok: true, paths };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : '파일 업로드에 실패했습니다.',
    };
  }
}

/**
 * 일지 목록 조회 (식물 게시물의 댓글로 조회)
 * @param plantId - 식물 게시물 ID
 * @returns ApiRes<DiaryReply[]>
 */
export async function getDiariesByPlantId(plantId: number): Promise<ApiRes<DiaryReply[]>> {
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
    const res = await fetch(`${API_URL}/posts/${plantId}/replies?sort={"createdAt":-1}`, {
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
        message: data.message || '일지 목록을 불러오는데 실패했습니다.',
      };
    }

    // 이미지 경로 보정
    if (data.ok && data.item) {
      data.item = data.item.map((diary: DiaryReply) => ({
        ...diary,
        user: {
          ...diary.user,
          image: diary.user.image ? `${API_URL}/${diary.user.image}` : undefined,
        },
        // extra.images 경로 보정
        extra: {
          ...diary.extra,
          images: diary.extra?.images?.map((img: string) => `${API_URL}/${img}`) || [],
        },
      }));
    }

    return data;
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 일지 목록을 불러오지 못했습니다.',
    };
  }
}

/**
 * 일지 생성 (식물 게시물에 댓글로 등록)
 * @param plantId - 식물 게시물 ID
 * @param formData - 일지 데이터가 담긴 FormData
 * @returns ApiRes<DiaryReply>
 */
export async function createDiary(plantId: number, formData: FormData): Promise<ApiRes<DiaryReply>> {
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

  let imagePaths: string[] = [];

  // 다중 이미지 처리
  const imageFiles: File[] = [];
  let index = 0;
  while (formData.has(`images[${index}]`)) {
    const file = formData.get(`images[${index}]`) as File;
    if (file && file.size > 0) {
      imageFiles.push(file);
    }
    index++;
  }

  if (imageFiles.length > 0) {
    const uploadResult = await uploadMultipleFiles(imageFiles);
    if (uploadResult.ok && uploadResult.paths) {
      imagePaths = uploadResult.paths;
    } else {
      return {
        ok: 0,
        message: uploadResult.message || '이미지 업로드에 실패했습니다.',
      };
    }
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const date = formData.get('date') as string;

  try {
    const res = await fetch(`${API_URL}/posts/${plantId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        content,
        extra: {
          title,
          date,
          // 모든 이미지를 extra.images에 저장
          ...(imagePaths.length > 0 ? { images: imagePaths } : {}),
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '일지를 작성하는데 실패했습니다.',
      };
    }

    // 이미지 경로 보정
    if (data.ok && data.item) {
      data.item = {
        ...data.item,
        user: {
          ...data.item.user,
          image: data.item.user.image ? `${API_URL}/${data.item.user.image}` : undefined,
        },
        // extra.images 경로 보정
        extra: {
          ...data.item.extra,
          images: data.item.extra?.images?.map((img: string) => `${API_URL}/${img}`) || [],
        },
      };
    }

    return data;
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 일지를 작성하지 못했습니다.',
    };
  }
}

/**
 * 일지 수정
 * @param plantId - 식물 게시물 ID
 * @param diaryId - 일지(댓글) ID
 * @param formData - 수정할 일지 데이터가 담긴 FormData
 * @returns ApiRes<DiaryReply>
 */
export async function updateDiary(plantId: number, diaryId: number, formData: FormData): Promise<ApiRes<DiaryReply>> {
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

  // 기존 이미지 처리 (삭제되지 않고 남겨둘 이미지들)
  const existingImages: string[] = [];
  let existingIndex = 0;
  while (formData.has(`existingImages[${existingIndex}]`)) {
    const existingImagePath = formData.get(`existingImages[${existingIndex}]`) as string;
    if (existingImagePath) {
      // API_URL이 포함된 전체 경로에서 상대 경로만 추출
      const relativePath = existingImagePath.replace(`${API_URL}/`, '');
      existingImages.push(relativePath);
    }
    existingIndex++;
  }

  // 새로 업로드된 이미지 처리
  let newImagePaths: string[] = [];
  const imageFiles: File[] = [];
  let newIndex = 0;
  while (formData.has(`newImages[${newIndex}]`)) {
    const file = formData.get(`newImages[${newIndex}]`) as File;
    if (file && file.size > 0) {
      imageFiles.push(file);
    }
    newIndex++;
  }

  if (imageFiles.length > 0) {
    const uploadResult = await uploadMultipleFiles(imageFiles);
    if (uploadResult.ok && uploadResult.paths) {
      newImagePaths = uploadResult.paths;
    } else {
      return {
        ok: 0,
        message: uploadResult.message || '이미지 업로드에 실패했습니다.',
      };
    }
  }

  // 기존 이미지와 새 이미지를 합쳐서 최종 이미지 배열 생성
  const finalImages = [...existingImages, ...newImagePaths];

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const date = formData.get('date') as string;

  try {
    const res = await fetch(`${API_URL}/posts/${plantId}/replies/${diaryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        content,
        extra: {
          title,
          date,
          // 기존 이미지와 새 이미지를 모두 포함
          images: finalImages,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '일지를 수정하는데 실패했습니다.',
      };
    }

    // 이미지 경로 보정
    if (data.ok && data.item) {
      data.item = {
        ...data.item,
        user: {
          ...data.item.user,
          image: data.item.user.image ? `${API_URL}/${data.item.user.image}` : undefined,
        },
        // extra.images 경로 보정
        extra: {
          ...data.item.extra,
          images: data.item.extra?.images?.map((img: string) => `${API_URL}/${img}`) || [],
        },
      };
    }

    return data;
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 일지를 수정하지 못했습니다.',
    };
  }
}

/**
 * 일지 삭제
 * @param plantId - 식물 게시물 ID
 * @param diaryId - 일지(댓글) ID
 * @returns ApiRes<void>
 */
export async function deleteDiary(plantId: number, diaryId: number): Promise<ApiRes<void>> {
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
    const res = await fetch(`${API_URL}/posts/${plantId}/replies/${diaryId}`, {
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
        message: data.message || '일지를 삭제하는데 실패했습니다.',
      };
    }

    return data;
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 일지를 삭제하지 못했습니다.',
    };
  }
}
