import { Diary } from '../_types/diary.types';
import PlantCard, { Plant } from './PlantCard';

interface PlantListProps {
  displayItems: Plant[];
  latestDiaries: { [plantId: number]: Diary | undefined };
  onRegisterClick: () => void;
  onDelete?: (plantId: number) => void;
  deletingId?: number | null;
}

export default function PlantList({ displayItems, latestDiaries, onDelete, deletingId }: PlantListProps) {
  return (
    <>
      {displayItems.map((plant, idx) => (
        <PlantCard
          key={plant.id}
          plant={plant}
          latestDiary={latestDiaries[plant.id]}
          onDelete={onDelete}
          isDeleting={deletingId === plant.id}
          isPriority={idx < 2} // 첫 번째와 두 번째 카드만 priority로 설정
        />
      ))}
    </>
  );
}
