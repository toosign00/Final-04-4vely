'use client';

import dynamic from 'next/dynamic';
import { Diary } from '../_types/diary.types';
import { Plant } from './PlantCard';

const MyPlantsClient = dynamic(() => import('./MyPlantsClient'), {
  ssr: false,
});

interface MyPlantsClientWrapperProps {
  initialPlants: Plant[];
  initialError?: string | null;
  initialLatestDiaries: { [plantId: number]: Diary | undefined };
}

export default function MyPlantsClientWrapper(props: MyPlantsClientWrapperProps) {
  return <MyPlantsClient {...props} />;
}
