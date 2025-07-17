import { PlusCircle } from 'lucide-react';

interface EmptyPlantCardProps {
  onClick: () => void;
}

export default function EmptyPlantCard({ onClick }: EmptyPlantCardProps) {
  return (
    <div
      className='group relative flex h-[26.6rem] max-h-[26.6rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-md transition-shadow duration-300 hover:shadow-lg'
      onClick={onClick}
      tabIndex={0}
      role='button'
      aria-label='식물 등록'
    >
      <PlusCircle className='text-primary/50 group-hover:text-primary mb-2 h-12 w-12 transition-colors duration-300' />
      <span className='text-secondary/50 group-hover:text-secondary text-center'>
        기르고 계신
        <br />
        반려 식물을 등록해 보세요!
      </span>
    </div>
  );
}
