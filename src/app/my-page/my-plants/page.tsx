import { getLatestDiariesBatch } from '@/lib/actions/diaryActions';
import { getMyPlants, Plant } from '@/lib/actions/plantActions';
import MyPlantsClient from './_components/MyPlantsClient';
import { Diary, mapDiaryReplyToDiary } from './_types/diary.types';
import { mapPlantPostsToPlants } from './_utils/plantUtils';

export default async function MyPlantsPage() {
  let plants: Plant[] = [];
  let error: string | null = null;
  const latestDiaries: { [plantId: number]: Diary | undefined } = {};

  try {
    const result = await getMyPlants();
    if (result.ok) {
      // PlantPost[] 배열을 Plant[] 배열로 변환
      plants = mapPlantPostsToPlants(result.item);
      // 전체 식물의 최신 일지를 배치로 조회
      const plantIds = plants.map((plant) => plant.id);
      const diariesBatch = await getLatestDiariesBatch(plantIds);

      // 배치 결과를 latestDiaries 객체로 변환
      Object.entries(diariesBatch).forEach(([plantIdStr, diaryReply]) => {
        const plantId = parseInt(plantIdStr);
        latestDiaries[plantId] = diaryReply ? mapDiaryReplyToDiary(diaryReply, plantId) : undefined;
      });
    } else {
      error = result.message || '식물 목록을 불러오는 중 오류가 발생했습니다.';
    }
  } catch {
    error = '식물 목록을 불러오는 중 오류가 발생했습니다.';
  }

  return <MyPlantsClient initialPlants={plants.slice(0, 20)} initialError={error} initialLatestDiaries={latestDiaries} />;
}
