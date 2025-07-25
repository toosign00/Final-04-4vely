import { getDiariesByPlantId } from '@/lib/actions/diaryActions';
import { getMyPlants, Plant } from '@/lib/actions/plantActions';
import MyPlantsClient from './_components/MyPlantsClient';
import { Diary, mapDiaryReplyToDiary } from './_types/diary.types';

export default async function MyPlantsPage() {
  let plants: Plant[] = [];
  let error: string | null = null;
  const latestDiaries: { [plantId: number]: Diary | undefined } = {};

  try {
    const result = await getMyPlants();
    if (result.ok) {
      plants = result.item;
      // 각 식물별 최신 일지 서버에서 패칭
      const diaryPromises = plants.map(async (plant) => {
        const diaryRes = await getDiariesByPlantId(plant.id);
        if (diaryRes.ok && diaryRes.item && diaryRes.item.length > 0) {
          return { plantId: plant.id, diary: mapDiaryReplyToDiary(diaryRes.item[0], plant.id) };
        }
        return { plantId: plant.id, diary: undefined };
      });
      const diaries = await Promise.all(diaryPromises);
      diaries.forEach(({ plantId, diary }: { plantId: number; diary: Diary | undefined }) => {
        latestDiaries[plantId] = diary;
      });
    } else {
      error = result.message || '식물 목록을 불러오는 중 오류가 발생했습니다.';
    }
  } catch {
    error = '식물 목록을 불러오는 중 오류가 발생했습니다.';
  }

  return <MyPlantsClient initialPlants={plants.slice(0, 20)} initialError={error} initialLatestDiaries={latestDiaries} />;
}
