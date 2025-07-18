import EmptyPlantCard from './EmptyPlantCard';
import PlantCard, { Plant } from './PlantCard';

interface PlantListProps {
  plants: Plant[];
  emptyCards: number;
  onRegisterClick: () => void;
}

export default function PlantList({ plants, emptyCards, onRegisterClick }: PlantListProps) {
  return (
    <>
      {plants.map((plant) => (
        <PlantCard key={plant.id} plant={plant} onDelete={() => {}} onViewJournal={() => {}} />
      ))}
      {Array.from({ length: Math.max(0, Math.min(4, emptyCards)) }).map((_, idx) => (
        <EmptyPlantCard key={`register-card-${idx}`} onClick={onRegisterClick} />
      ))}
    </>
  );
}
