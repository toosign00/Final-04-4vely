import { getLatestDiariesBatch } from '@/lib/actions/diaryActions';
import { getMyPlants, PaginationParams, Plant } from '@/lib/actions/plantActions';
import { redirect } from 'next/navigation';
import ErrorDisplay from '../_components/ErrorDisplay';
import MyPlantsClient from './_components/MyPlantsClient';
import { Diary, mapDiaryReplyToDiary } from './_types/diary.types';
import { mapPlantPostsToPlants } from './_utils/plantUtils';

/**
 * 나의 식물 페이지 컴포넌트의 props 타입 정의
 */
interface MyPlantsPageProps {
  searchParams: Promise<{
    page?: string; // URL 쿼리 파라미터로부터 받는 페이지 번호
  }>;
}

// 페이지당 표시할 식물 개수 설정
const PLANTS_PER_PAGE = 4;
// 전체 페이지 수 고정 (4개씩 10페이지 = 총 40개 슬롯)
const TOTAL_PAGES = 10;
// 기본 정렬 순서 (서버에서는 정렬하지 않고 클라이언트에서 처리)
// const DEFAULT_SORT = '{"createdAt": -1}';

export default async function MyPlantsPage({ searchParams }: MyPlantsPageProps) {
  // Promise 형태의 searchParams 를 해결하여 실제 값 추출
  const resolvedSearchParams = await searchParams;
  // 현재 페이지 번호 파싱 (기본값: 1)
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);

  // 페이지 범위 검증
  if (currentPage < 1 || currentPage > TOTAL_PAGES) {
    redirect('/my-page/my-plants');
  }

  // 페이지네이션 파라미터 설정 (서버에서는 정렬하지 않음)
  const paginationParams: PaginationParams = {
    page: currentPage,
    limit: PLANTS_PER_PAGE,
    // sort: DEFAULT_SORT, // 클라이언트에서 정렬 처리
    // 정렬 처리 로직이 좀 복잡하여 서버에서는 처리 불가능 할것 같음.
    // 클라이언트에서 처리하는 것이 좋을 것 같음. 왜냐하면 내 식물(Post)와 Reply 통합하여 최신 순으로 정렬해야하기 때문.
  };

  let plants: Plant[] = [];
  let error: string | null = null;
  let pagination = {
    page: currentPage,
    limit: PLANTS_PER_PAGE,
    total: 0,
    totalPages: TOTAL_PAGES,
  };
  const latestDiaries: { [plantId: number]: Diary | undefined } = {};

  try {
    const result = await getMyPlants(paginationParams);
    if (result.ok) {
      // PlantPost[] 배열을 Plant[] 배열로 변환
      plants = mapPlantPostsToPlants(result.item.plants);
      pagination = {
        ...result.item.pagination,
        totalPages: TOTAL_PAGES, // 고정된 총 페이지 수 사용
      };

      // 현재 페이지의 식물들의 최신 일지를 배치로 조회
      if (plants.length > 0) {
        const plantIds = plants.map((plant) => plant.id);
        const diariesBatch = await getLatestDiariesBatch(plantIds);

        // 배치 결과를 latestDiaries 객체로 변환
        Object.entries(diariesBatch).forEach(([plantIdStr, diaryReply]) => {
          const plantId = parseInt(plantIdStr);
          latestDiaries[plantId] = diaryReply ? mapDiaryReplyToDiary(diaryReply, plantId) : undefined;
        });
      }
    } else {
      error = result.message || '식물 목록을 불러오는 중 오류가 발생했습니다.';
    }
  } catch {
    error = '식물 목록을 불러오는 중 오류가 발생했습니다.';
  }

  // API 응답이 실패한 경우 에러 화면 표시
  if (error) {
    return <ErrorDisplay title='나의 식물을 불러오지 못했습니다' message={error} />;
  }

  return <MyPlantsClient initialPlants={plants} initialError={error} initialLatestDiaries={latestDiaries} pagination={pagination} />;
}
