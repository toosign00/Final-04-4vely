import { getDiariesByPlantId } from '@/lib/actions/mypage/myPlant/diaryActions';
import { getPlantById } from '@/lib/actions/mypage/myPlant/plantActions';
import { notFound } from 'next/navigation';
import { Diary, mapDiaryReplyToDiary } from '../_types/diary.types';
import { mapPlantPostToPlant } from '../_utils/plantUtils';
import PlantDiaryClientWrapper from './_components/PlantDiaryClientWrapper';

/**
 * 동적 라우트 파라미터 타입 정의
 * @interface PageParams
 */
interface PageParams {
  /** 식물 ID (URL 파라미터) */
  plantId: string;
}

/**
 * 페이지 컴포넌트 Props 타입 정의
 * @interface PlantDiaryPageProps
 */
interface PlantDiaryPageProps {
  /** 동적 라우트 파라미터 (Next.js 15부터 Promise 타입) */
  params: Promise<PageParams>;
}

/**
 * 식물 상세 페이지 - 식물 정보와 일지 목록을 표시하는 서버 컴포넌트
 *
 * @description
 * - 서버에서 식물 데이터와 일지 데이터를 미리 페칭하여 초기 로딩 성능 최적화
 * - 클라이언트 상호작용이 필요한 부분은 별도 클라이언트 컴포넌트로 분리
 * - SEO 최적화를 위한 서버 사이드 렌더링 활용
 *
 * @param {PlantDiaryPageProps} props - 페이지 props
 * @returns {Promise<JSX.Element>} 렌더링된 페이지 컴포넌트
 *
 * @example
 * // URL: /my-page/my-plants/123
 * // params.plantId = "123"
 *
 * @performance
 * - 서버에서 데이터 프리페칭으로 초기 로딩 시간 단축
 * - 클라이언트 hydration 최적화
 * - 불필요한 클라이언트 번들 크기 감소
 *
 * @error_handling
 * - 잘못된 plantId 형식 시 404 페이지 리다이렉트
 * - 존재하지 않는 식물 시 404 처리
 * - API 오류 시 에러 상태를 클라이언트로 전달
 */
export default async function PlantDiaryPage({ params }: PlantDiaryPageProps) {
  // URL 파라미터 await 및 식물 ID 추출
  const resolvedParams = await params;
  const plantId = Number(resolvedParams.plantId);

  // 잘못된 ID 형식인 경우 404 처리
  if (isNaN(plantId) || plantId <= 0) {
    notFound();
  }

  // 서버에서 식물 데이터와 일지 데이터를 병렬로 페칭
  const [plantResult, diariesResult] = await Promise.allSettled([getPlantById(plantId), getDiariesByPlantId(plantId)]);

  // 식물 데이터 처리
  let plant = null;
  let plantError: string | null = null;

  if (plantResult.status === 'fulfilled') {
    if (plantResult.value.ok && plantResult.value.item) {
      // PlantPost를 Plant로 변환
      plant = mapPlantPostToPlant(plantResult.value.item);
    } else {
      plantError = '식물 정보를 불러올 수 없습니다.';
    }
  } else {
    plantError = '식물 정보를 불러오는 중 오류가 발생했습니다.';
  }

  // 식물이 존재하지 않는 경우 404 처리
  if (!plant && !plantError) {
    notFound();
  }

  // 일지 데이터 처리
  let diaries: Diary[] = [];
  let diaryError: string | null = null;

  if (diariesResult.status === 'fulfilled') {
    if (diariesResult.value.ok && diariesResult.value.item) {
      // DiaryReply[]를 Diary[]로 변환
      diaries = diariesResult.value.item.map((reply) => mapDiaryReplyToDiary(reply, plantId));
    } else {
      diaryError = '일지 목록을 불러올 수 없습니다.';
    }
  } else {
    diaryError = '일지 목록을 불러오는 중 오류가 발생했습니다.';
  }

  // 클라이언트 컴포넌트에 초기 데이터 전달
  return <PlantDiaryClientWrapper plantId={plantId} initialPlant={plant} initialDiaries={diaries} plantError={plantError} diaryError={diaryError} />;
}

/**
 * 메타데이터 생성 함수
 * @description SEO 최적화를 위한 동적 메타데이터 생성
 */
export async function generateMetadata({ params }: PlantDiaryPageProps) {
  const resolvedParams = await params;
  const plantId = Number(resolvedParams.plantId);

  if (isNaN(plantId) || plantId <= 0) {
    return {
      title: '식물을 찾을 수 없습니다 | 4vely',
    };
  }

  try {
    const result = await getPlantById(plantId);

    if (result.ok && result.item) {
      const plant = mapPlantPostToPlant(result.item);
      return {
        title: `${plant.name} 일지 | 4vely`,
        description: `${plant.name} (${plant.species})의 성장 일지를 확인해보세요.`,
      };
    }
  } catch (error) {
    console.error('메타데이터 생성 오류:', error);
  }

  return {
    title: '식물 일지 | 4vely',
    description: '식물의 성장 일지를 확인해보세요.',
  };
}
