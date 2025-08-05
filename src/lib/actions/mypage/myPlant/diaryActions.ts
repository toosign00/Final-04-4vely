'use server';

import { uploadFile } from '@/lib/actions/fileActions';
import { ApiRes } from '@/types/api.types';
import { getAuthInfo } from '@/lib/utils/auth.server';

// 환경 변수를 통해 API URL과 클라이언트 ID 설정
const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 일지(다이어리) 댓글 API 응답 타입
 * @description 식물 게시물에 대한 댓글 형태로 저장되는 일지 데이터의 원본 구조
 * @interface DiaryReply
 */
export interface DiaryReply {
  /** 일지 댓글의 고유 ID */
  _id: number;
  /** 일지 내용 텍스트 */
  content: string;
  /** 단일 이미지 경로 */
  image?: string;
  /** 일지 작성자 정보 */
  user: {
    /** 작성자 사용자 ID */
    _id: number;
    /** 작성자 사용자명 */
    name: string;
    /** 작성자 프로필 이미지 경로 */
    image?: string;
  };
  /** 일지 생성 일시 (ISO 8601 형식) */
  createdAt: string;
  /** 일지 최종 수정 일시 (ISO 8601 형식) */
  updatedAt: string;
  /** 일지 추가 정보 객체 */
  extra?: {
    /** 일지 제목 */
    title?: string;
    /** 일지 작성 대상 날짜 (YYYY-MM-DD 형식) */
    date?: string;
    /** 다중 이미지 경로 배열 (메인 이미지 저장소) */
    images?: string[];
  };
}

/**
 * 다중 파일을 병렬로 업로드하는 유틸리티 함수
 * @description 여러 이미지 파일을 동시에 업로드하여 성능 최적화
 * @param {File[]} files - 업로드할 파일 배열
 * @returns {Promise<{ok: boolean, paths?: string[], message?: string}>} 업로드 결과 객체
 * @throws 파일 업로드 실패 시 에러 메시지 반환
 * @performance Promise.all을 사용하여 병렬 업로드로 처리 시간 단축
 */
async function uploadMultipleFiles(files: File[]): Promise<{ ok: boolean; paths?: string[]; message?: string }> {
  // 입력값 검증
  if (!files || files.length === 0) {
    return { ok: true, paths: [] };
  }

  try {
    // 각 파일을 병렬로 업로드
    const uploadPromises = files.map(async (file, index) => {
      try {
        const formData = new FormData();
        formData.append('attach', file);
        const result = await uploadFile(formData);

        if (result.ok && result.item?.[0]?.path) {
          return result.item[0].path;
        } else {
          throw new Error(`파일 ${index + 1} 업로드 실패`);
        }
      } catch (error) {
        throw new Error(`파일 ${index + 1} 처리 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    });

    const paths = await Promise.all(uploadPromises);
    return { ok: true, paths };
  } catch (error) {
    console.error('다중 파일 업로드 중 오류:', error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : '파일 업로드에 실패했습니다.',
    };
  }
}

/**
 * 특정 식물의 일지 목록을 조회하는 서버 액션
 * @description 식물 게시물의 댓글 형태로 저장된 일지들을 최신순으로 조회하여 데이터 반환
 * @param {number} plantId - 일지를 조회할 식물 게시물의 고유 ID
 * @returns {Promise<ApiRes<DiaryReply[]>>} 일지 목록 API 응답
 * @throws API 호출 실패, 인증 실패 시 에러 메시지 반환
 * @validation plantId는 양의 정수여야 함
 */
export async function getDiariesByPlantId(plantId: number): Promise<ApiRes<DiaryReply[]>> {
  // 입력값 검증
  if (!plantId || plantId <= 0) {
    return {
      ok: 0,
      message: '유효하지 않은 식물 ID입니다.',
    };
  }

  // 인증 정보 추출 및 검증
  const authInfo = await getAuthInfo();

  if (!authInfo) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const { accessToken } = authInfo;

  try {
    // 일지 목록 조회 API 호출 (최신순 정렬)
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

    return data;
  } catch (error) {
    console.error(`식물 ID ${plantId} 일지 목록 조회 중 오류:`, error);
    return {
      ok: 0,
      message: '서버 오류로 일지 목록을 불러오지 못했습니다.',
    };
  }
}

/**
 * 새로운 일지를 생성하는 서버 액션 (다중 이미지 업로드 지원)
 * @description 식물 게시물에 댓글 형태로 일지를 등록하고 다중 이미지 업로드 처리
 * @param {number} plantId - 일지를 등록할 식물 게시물의 고유 ID
 * @param {FormData} formData - 일지 생성 정보가 담긴 FormData 객체
 * @param {string} formData.title - 일지 제목
 * @param {string} formData.content - 일지 내용
 * @param {string} formData.date - 일지 날짜 (YYYY-MM-DD 형식)
 * @param {File[]} formData.images[n] - 다중 이미지 파일들 (선택사항)
 * @returns {Promise<ApiRes<DiaryReply>>} 생성된 일지 정보 API 응답
 * @throws 이미지 업로드 실패, API 호출 실패, 인증 실패 시 에러 메시지 반환
 * @validation plantId는 양의 정수, 필수 필드는 비어있으면 안됨
 */
export async function createDiary(plantId: number, formData: FormData): Promise<ApiRes<DiaryReply>> {
  // 입력값 검증
  if (!plantId || plantId <= 0) {
    return {
      ok: 0,
      message: '유효하지 않은 식물 ID입니다.',
    };
  }

  // 인증 정보 추출 및 검증
  const authInfo = await getAuthInfo();

  if (!authInfo) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const { accessToken } = authInfo;

  // FormData에서 필수 필드 추출 및 검증
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const date = formData.get('date') as string;

  if (!title?.trim() || !content?.trim() || !date?.trim()) {
    return {
      ok: 0,
      message: '제목, 내용, 날짜는 필수 입력 항목입니다.',
    };
  }

  // 다중 이미지 파일 수집 및 업로드 처리
  let imagePaths: string[] = [];
  const imageFiles: File[] = [];

  // FormData에서 images[n] 형태의 파일들을 순차적으로 수집
  let index = 0;
  while (formData.has(`images[${index}]`)) {
    const file = formData.get(`images[${index}]`) as File;
    if (file && file.size > 0) {
      imageFiles.push(file);
    }
    index++;
  }

  // 수집된 이미지가 있으면 업로드 수행
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

  try {
    // 일지 생성 API 호출
    const res = await fetch(`${API_URL}/posts/${plantId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        content: content.trim(),
        extra: {
          title: title.trim(),
          date: date.trim(),
          // 업로드된 이미지 경로들을 extra.images에 저장
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

    return data;
  } catch (error) {
    console.error(`식물 ID ${plantId} 일지 생성 중 오류:`, error);
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
 * @returns ApiRes<DiaryReply> 원본 API 데이터
 */
export async function updateDiary(plantId: number, diaryId: number, formData: FormData): Promise<ApiRes<DiaryReply>> {
  const authInfo = await getAuthInfo();

  if (!authInfo) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const { accessToken } = authInfo;

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

    return data;
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 일지를 수정하지 못했습니다.',
    };
  }
}

/**
 * 일지를 삭제하는 서버 액션
 * @description 식물 게시물의 댓글 형태로 저장된 일지를 영구 삭제
 * @param {number} plantId - 일지가 속한 식물 게시물의 고유 ID
 * @param {number} diaryId - 삭제할 일지(댓글)의 고유 ID
 * @returns {Promise<ApiRes<void>>} 삭제 작업 결과 API 응답
 * @throws API 호출 실패, 권한 없음, 존재하지 않는 ID 시 에러 메시지 반환
 * @validation plantId와 diaryId는 모두 양의 정수여야 함
 */

/**
 * 여러 식물의 최신 일지를 배치로 조회하는 서버 액션
 * @description 여러 식물 ID를 받아 각각의 최신 일지를 한 번에 조회하여 성능 최적화
 * @param {number[]} plantIds - 일지를 조회할 식물 ID 배열
 * @returns {Promise<{[plantId: number]: DiaryReply | null}>} 식물 ID를 키로 하는 최신 일지 객체
 */
export async function getLatestDiariesBatch(plantIds: number[]): Promise<{ [plantId: number]: DiaryReply | null }> {
  if (!plantIds || plantIds.length === 0) {
    return {};
  }

  try {
    // 각 식물의 최신 일지를 병렬로 조회
    const diaryPromises = plantIds.map(async (plantId) => {
      const result = await getDiariesByPlantId(plantId);
      const latestDiary = result.ok && result.item && result.item.length > 0 ? result.item[0] : null;
      return { plantId, diary: latestDiary };
    });

    const results = await Promise.all(diaryPromises);

    // 결과를 객체로 변환
    const diaryMap: { [plantId: number]: DiaryReply | null } = {};
    results.forEach(({ plantId, diary }) => {
      diaryMap[plantId] = diary;
    });

    return diaryMap;
  } catch (error) {
    console.error('배치 일지 조회 중 오류:', error);
    return {};
  }
}

export async function deleteDiary(plantId: number, diaryId: number): Promise<ApiRes<void>> {
  // 입력값 검증
  if (!plantId || plantId <= 0) {
    return {
      ok: 0,
      message: '유효하지 않은 식물 ID입니다.',
    };
  }

  if (!diaryId || diaryId <= 0) {
    return {
      ok: 0,
      message: '유효하지 않은 일지 ID입니다.',
    };
  }

  // 인증 정보 추출 및 검증
  const authInfo = await getAuthInfo();

  if (!authInfo) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const { accessToken } = authInfo;

  try {
    // 일지 삭제 API 호출
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
  } catch (error) {
    console.error(`식물 ID ${plantId}, 일지 ID ${diaryId} 삭제 중 오류:`, error);
    return {
      ok: 0,
      message: '서버 오류로 일지를 삭제하지 못했습니다.',
    };
  }
}
