'use client';

import dynamic from 'next/dynamic';
import { Diary } from '../_types/diary.types';
import { Plant } from './PlantCard';

const MyPlantsClient = dynamic(() => import('./MyPlantsClient'), {
  ssr: false,
  loading: () => <div className='flex min-h-[25rem] items-center justify-center'>로딩 중...</div>,
});

interface MyPlantsClientWrapperProps {
  initialPlants: Plant[];
  initialError?: string | null;
  initialLatestDiaries: { [plantId: number]: Diary | undefined };
}

export default function MyPlantsClientWrapper(props: MyPlantsClientWrapperProps) {
  return <MyPlantsClient {...props} />;
}
