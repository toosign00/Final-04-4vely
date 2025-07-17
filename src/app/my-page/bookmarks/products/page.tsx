'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useState } from 'react';
import ProductCard from './_components/ProductCard';

export default function ProductsPage() {
  // 예시 북마크 데이터
  const ordersData = [
    {
      id: 1,
      imageUrl: '/images/insam_black.webp',
      name: '인삼',
      description:
        '건강에 좋은 인삼입니다. 다양한 영양소가 풍부하게 함유되어 있어 면역력 증진에 도움이 됩니다.  건강에 좋은 인삼입니다. 다양한 영양소가 풍부하게 함유되어 있어 면역력 증진에 도움이 됩니다. 건강에 좋은 인삼입니다. 다양한 영양소가 풍부하게 함유되어 있어 면역력 증진에 도움이 됩니다.',
    },
    {
      id: 2,
      imageUrl: '/images/african_violet_black.webp',
      name: '아프리카 바이올렛',
      description: '아름다운 꽃을 피우는 실내 식물입니다. 작은 공간에서도 잘 자라며 관리가 쉬워 초보자에게 추천합니다.',
    },
    {
      id: 3,
      imageUrl: '/images/aglaonema_siam_black.webp',
      name: '아글라오네마',
      description: '공기 정화 효과가 뛰어난 관엽식물입니다. 실내 공기를 깨끗하게 만들어주며 인테리어 효과도 좋습니다.',
    },
    {
      id: 4,
      imageUrl: '/images/acadia_palenopsis_orchid.webp',
      name: '팔레놉시스 난초',
      description: '우아하고 고급스러운 난초입니다. 오랫동안 꽃을 피우며 선물용으로도 인기가 많습니다.',
    },
  ];

  // 한 페이지에 보여줄 아이템 개수
  const ITEMS_PER_PAGE = 3;

  // 현재 페이지 번호 (1부터 시작)
  const [currentPage, setCurrentPage] = useState(1);

  // 전체 페이지 수
  const totalPages = Math.ceil(ordersData.length / ITEMS_PER_PAGE);

  // 현재 페이지의 첫 아이템 인덱스
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;

  // 현재 페이지에 보여줄 데이터 배열
  const displayItems = ordersData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className='grid gap-6 p-2 sm:p-0'>
      {/* 북마크 상품 카드 - 여러 개일 경우 map으로 반복 */}
      {displayItems.map((order) => (
        <ProductCard key={order.id} order={order} />
      ))}
      {/* 페이지네이션 UI */}
      <div className='mt-8 flex justify-center'>
        <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}
