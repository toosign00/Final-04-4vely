'use server';

import { uploadFile } from '@/lib/actions/fileActions';
import { ApiRes } from '@/types/api.types';
import { Post } from '@/types/post.types';
import { getAuthInfo } from '@/lib/utils/auth.server';

// 환경 변수를 통해 API URL과 클라이언트 ID 설정
const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 식물 관련 API 응답 타입 (Post 확장)
 * @description API에서 반환되는 식물 게시물 원본 데이터 구조
 * @interface PlantPost
 */
export interface PlantPost extends Post {
  /** 식물 추가 정보 객체 */
  extra?: {
    /** 식물의 종/품종 정보 */
    species?: string;
    /** 식물이 위치한 장소 정보 */
    location?: string;
    /** 식물 메모 제목 */
    memoTitle?: string;
    /** 사용자 지정 분양일 */
    date?: string;
  };
  /** 식물 이미지 파일의 상대 경로 */
  image?: string;
}

/**
 * 클라이언트에서 사용하는 변환된 식물 데이터 타입
 * @description PlantPost를 클라이언트에서 사용하기 편한 형태로 변환한 구조
 * @interface Plant
 */
export interface Plant {
  /** 식물 게시물 ID (PlantPost._id에서 변환) */
  id: number;
  /** 식물 별명 (PlantPost.title에서 변환) */
  name: string;
  /** 식물 종/품종 (PlantPost.extra.species에서 변환) */
  species: string;
  /** 식물 위치 (PlantPost.extra.location에서 변환) */
  location: string;
  /** 완전한 이미지 URL (API_URL + PlantPost.image) */
  imageUrl: string;
  /** 등록일 (PlantPost.createdAt에서 변환, YYYY.MM.DD 형식) */
  date: string;
  /** 식물 메모 (PlantPost.content에서 변환) */
  memo: string;
  /** 식물 메모 제목 (PlantPost.extra.memoTitle에서 변환) */
  memoTitle: string;
}

// getAuthInfo 함수는 @/lib/utils/auth.server.ts로 이동됨

/**
 * 사용자의 식물 목록을 조회하는 서버 액션
 * @description 인증된 사용자의 모든 식물 게시물을 API에서 조회하여 원본 데이터 반환
 * @returns {Promise<ApiRes<PlantPost[]>>} 식물 목록 API 응답
 * @throws API 호출 실패 시 에러 메시지 반환
 * @performance 인증 정보 추출 로직을 getAuthInfo로 분리하여 중복 제거
 */
export async function getMyPlants(): Promise<ApiRes<PlantPost[]>> {
  // 인증 정보 검증
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const { accessToken } = auth;

  try {
    // 사용자별 식물 타입 게시물 조회 API 호출
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

    // 이미지 경로 보정 (상대 경로를 절대 URL로 변환)
    if (data.ok && data.item && Array.isArray(data.item)) {
      data.item = data.item.map((plant: PlantPost) => ({
        ...plant,
        image: plant.image ? `${API_URL}/${plant.image}` : undefined,
      }));
    }

    return data;
  } catch (error) {
    console.error('식물 목록 조회 중 오류:', error);
    return {
      ok: 0,
      message: '서버 오류로 식물 목록을 불러오지 못했습니다.',
    };
  }
}

/**
 * ID로 특정 식물의 상세 정보를 조회하는 서버 액션
 * @description 식물 게시물 ID를 통해 해당 식물의 상세 정보를 API에서 조회
 * @param {number} plantId - 조회할 식물 게시물의 고유 ID
 * @returns {Promise<ApiRes<PlantPost>>} 식물 상세 정보 API 응답
 * @throws API 호출 실패 또는 존재하지 않는 식물 ID 시 에러 메시지 반환
 * @validation plantId는 양의 정수여야 함
 */
export async function getPlantById(plantId: number): Promise<ApiRes<PlantPost>> {
  // 입력값 검증
  if (!plantId || plantId <= 0) {
    return {
      ok: 0,
      message: '유효하지 않은 식물 ID입니다.',
    };
  }

  // 인증 정보 검증
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const { accessToken } = auth;

  try {
    // 특정 게시물 조회 API 호출
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

    // 이미지 경로 보정 (상대 경로를 절대 URL로 변환)
    if (data.ok && data.item) {
      data.item = {
        ...data.item,
        image: data.item.image ? `${API_URL}/${data.item.image}` : undefined,
      };
    }

    return data;
  } catch (error) {
    console.error(`식물 ID ${plantId} 조회 중 오류:`, error);
    return {
      ok: 0,
      message: '서버 오류로 식물 정보를 불러오지 못했습니다.',
    };
  }
}

/**
 * 새로운 식물을 등록하는 서버 액션 (이미지 업로드 포함)
 * @description FormData에서 식물 정보를 추출하여 새 식물 게시물 생성
 * @param {FormData} formData - 식물 등록 정보가 담긴 FormData 객체
 * @param {string} formData.name - 식물 별명 (필수)
 * @param {string} formData.species - 식물 종/품종 (필수)
 * @param {string} formData.location - 식물 위치 (필수)
 * @param {string} formData.memo - 식물 메모 (필수)
 * @param {File} [formData.attach] - 식물 이미지 파일 (선택사항)
 * @returns {Promise<ApiRes<PlantPost>>} 새로 생성된 식물 정보 API 응답
 * @throws 이미지 업로드 실패, API 호출 실패 시 에러 메시지 반환
 * @performance 이미지가 있는 경우에만 업로드 수행하여 불필요한 네트워크 요청 방지
 */
export async function createPlant(formData: FormData): Promise<ApiRes<PlantPost>> {
  // 인증 정보 검증
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const { accessToken } = auth;

  // FormData에서 필수 정보 추출 및 검증
  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const location = formData.get('location') as string;
  const date = formData.get('date') as string;
  const memo = formData.get('memo') as string;
  const memoTitle = formData.get('memoTitle') as string;

  // 필수 필드 검증
  if (!name?.trim() || !species?.trim() || !location?.trim() || !date?.trim() || !memo?.trim() || !memoTitle?.trim()) {
    return {
      ok: 0,
      message: '모든 필수 정보를 입력해주세요.',
    };
  }

  // 이미지 파일 처리 (선택사항)
  let image: string | undefined;
  const attach = formData.get('attach') as File;

  if (attach && attach.size > 0) {
    try {
      const fileRes = await uploadFile(formData);
      if (fileRes.ok && fileRes.item?.[0]?.path) {
        image = fileRes.item[0].path;
      } else {
        return {
          ok: 0,
          message: '이미지 업로드에 실패했습니다.',
        } as ApiRes<PlantPost>;
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      return {
        ok: 0,
        message: '이미지 업로드 중 오류가 발생했습니다.',
      };
    }
  }

  try {
    // 식물 게시물 생성 API 호출
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        type: 'plant',
        title: name.trim(),
        content: memo.trim(),
        extra: {
          species: species.trim(),
          location: location.trim(),
          memoTitle: memoTitle.trim(),
          date: date.trim(),
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

    // 이미지 경로 보정 (상대 경로를 절대 URL로 변환)
    if (data.ok && data.item) {
      data.item = {
        ...data.item,
        image: data.item.image ? `${API_URL}/${data.item.image}` : undefined,
      };
    }

    return data;
  } catch (error) {
    console.error('식물 등록 중 오류:', error);
    return {
      ok: 0,
      message: '서버 오류로 식물을 등록하지 못했습니다.',
    };
  }
}

/**
 * 기존 식물 정보를 수정하는 서버 액션 (이미지 업로드 포함)
 * @description 식물 ID와 수정할 정보를 받아 해당 식물 게시물 업데이트
 * @param {number} plantId - 수정할 식물 게시물의 고유 ID
 * @param {FormData} formData - 수정할 식물 정보가 담긴 FormData 객체
 * @param {string} formData.name - 수정할 식물 별명
 * @param {string} formData.species - 수정할 식물 종/품종
 * @param {string} formData.location - 수정할 식물 위치
 * @param {string} formData.memo - 수정할 식물 메모
 * @param {File} [formData.attach] - 새로운 식물 이미지 파일 (선택사항)
 * @returns {Promise<ApiRes<PlantPost>>} 수정된 식물 정보 API 응답
 * @throws 이미지 업로드 실패, API 호출 실패, 권한 없음 시 에러 메시지 반환
 * @validation plantId는 양의 정수여야 하며, 필수 필드는 비어있으면 안됨
 */
export async function updatePlant(plantId: number, formData: FormData): Promise<ApiRes<PlantPost>> {
  // 입력값 검증
  if (!plantId || plantId <= 0) {
    return {
      ok: 0,
      message: '유효하지 않은 식물 ID입니다.',
    };
  }

  // 인증 정보 검증
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const { accessToken } = auth;

  // FormData에서 수정할 정보 추출 및 검증
  const name = formData.get('name') as string;
  const species = formData.get('species') as string;
  const location = formData.get('location') as string;
  const memo = formData.get('memo') as string;
  const memoTitle = formData.get('memoTitle') as string;

  // 필수 필드 검증
  if (!name?.trim() || !species?.trim() || !location?.trim() || !memo?.trim() || !memoTitle?.trim()) {
    return {
      ok: 0,
      message: '모든 필수 정보를 입력해주세요.',
    };
  }

  // 새로운 이미지 파일 처리 (선택사항)
  let image: string | undefined;
  const attach = formData.get('attach') as File;

  if (attach && attach.size > 0) {
    try {
      const fileRes = await uploadFile(formData);
      if (fileRes.ok && fileRes.item?.[0]?.path) {
        image = fileRes.item[0].path;
      } else {
        return {
          ok: 0,
          message: '이미지 업로드에 실패했습니다.',
        } as ApiRes<PlantPost>;
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      return {
        ok: 0,
        message: '이미지 업로드 중 오류가 발생했습니다.',
      };
    }
  }

  try {
    // 식물 게시물 수정 API 호출
    const res = await fetch(`${API_URL}/posts/${plantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: name.trim(),
        content: memo.trim(),
        extra: {
          species: species.trim(),
          location: location.trim(),
          memoTitle: memoTitle.trim(),
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

    // 이미지 경로 보정 (상대 경로를 절대 URL로 변환)
    if (data.ok && data.item) {
      data.item = {
        ...data.item,
        image: data.item.image ? `${API_URL}/${data.item.image}` : undefined,
      };
    }

    return data;
  } catch (error) {
    console.error(`식물 ID ${plantId} 수정 중 오류:`, error);
    return {
      ok: 0,
      message: '서버 오류로 식물 정보를 수정하지 못했습니다.',
    };
  }
}

/**
 * 식물을 삭제하는 서버 액션
 * @description 식물 게시물 ID를 통해 해당 식물과 관련된 모든 데이터를 영구 삭제
 * @param {number} plantId - 삭제할 식물 게시물의 고유 ID
 * @returns {Promise<ApiRes<void>>} 삭제 작업 결과 API 응답
 * @throws API 호출 실패, 권한 없음, 존재하지 않는 ID 시 에러 메시지 반환
 * @warning 이 작업은 되돌릴 수 없으며, 관련된 일지도 함께 삭제될 수 있음
 * @validation plantId는 양의 정수여야 함
 */
export async function deletePlant(plantId: number): Promise<ApiRes<void>> {
  // 입력값 검증
  if (!plantId || plantId <= 0) {
    return {
      ok: 0,
      message: '유효하지 않은 식물 ID입니다.',
    };
  }

  // 인증 정보 검증
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const { accessToken } = auth;

  try {
    // 식물 게시물 삭제 API 호출
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

    // 삭제 성공 응답
    return {
      ok: 1,
      item: undefined,
    };
  } catch (error) {
    console.error(`식물 ID ${plantId} 삭제 중 오류:`, error);
    return {
      ok: 0,
      message: '서버 오류로 식물을 삭제하지 못했습니다.',
    };
  }
}
