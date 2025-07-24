import EmptyPlantCard from './EmptyPlantCard';
import PlantCard, { Plant } from './PlantCard';

interface PlantListProps {
  plants: Plant[];
  emptyCards: number;
  onRegisterClick: () => void;
  onDelete?: (plantId: number) => void;
  deletingId?: number | null;
}

export default function PlantList({ plants, emptyCards, onRegisterClick, onDelete, deletingId }: PlantListProps) {
  return (
    <>
      {plants.map((plant) => (
        <PlantCard key={plant.id} plant={plant} onDelete={onDelete} isDeleting={deletingId === plant.id} />
      ))}
      {Array.from({ length: Math.max(0, Math.min(4, emptyCards)) }).map((_, idx) => (
        <EmptyPlantCard key={`register-card-${idx}`} onClick={onRegisterClick} />
      ))}
    </>
  );
}
