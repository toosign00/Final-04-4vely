'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useState } from 'react';
import PlantList from './_components/PlantList';
import PlantRegisterModal from './_components/PlantRegisterModal';

// 전체 식물 데이터 배열 (예시 데이터)
const plantsData = [
  {
    id: 1,
    imageUrl: '/images/insam_black.webp',
    name: '한국인삼공사',
    species: '인삼',
    location: '거실',
    date: '2025-07-16',
    memo: '오늘 인삼을 먹었어요',
  },
  {
    id: 2,
    imageUrl: '/images/hoya_heart_black.webp',
    name: '야호',
    species: '호야',
    location: '침실',
    date: '2025-07-16',
    memo: '야호!!! 분갈이 완료',
  },
  {
    id: 3,
    imageUrl: '/images/sansevieria_black.webp',
    name: '베리베리',
    species: '산세베리아',
    location: '베란다',
    date: '2025-07-16',
    memo: '베리베리의 잎이 무성해짐',
  },
  {
    id: 4,
    imageUrl: '/images/nabiran_gray.webp',
    name: '비란비란',
    species: '나비란',
    location: '안방 ',
    date: '2025-07-16',
    memo: '나비란 잎이 떨어졌어요 ㅠㅠ 물을 자주 안줘서 그런가봐요',
  },
  {
    id: 5,
    imageUrl: '/images/coffee_plant_black.webp',
    name: '카페인제조기',
    species: '커피나무',
    location: '현관',
    date: '2025-07-16',
    memo: '커피나무 잎 끝이 마름',
  },
];

export default function MyPlants() {
  const [open, setOpen] = useState(false);

  // 한 페이지에 보여줄 아이템 개수
  const ITEMS_PER_PAGE = 4;

  // 현재 페이지 번호 (1부터 시작)
  const [currentPage, setCurrentPage] = useState(1);

  // 전체 페이지 수
  const totalPages = Math.ceil(plantsData.length / ITEMS_PER_PAGE);

  // 현재 페이지의 첫 아이템 인덱스
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;

  // 현재 페이지에 보여줄 데이터 배열
  const displayItems = plantsData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // 빈 카드 개수 계산
  const emptyCards = ITEMS_PER_PAGE - displayItems.length;

  return (
    <>
      <div className='mx-auto grid max-w-4xl auto-rows-fr grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-5 lg:p-6'>
        <PlantList plants={displayItems} emptyCards={emptyCards} onRegisterClick={() => setOpen(true)} />
      </div>
      {/* 페이지네이션 UI */}
      <div className='mt-8 flex justify-center'>
        <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
      <PlantRegisterModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
