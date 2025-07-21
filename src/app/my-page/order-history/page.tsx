'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useState } from 'react';
import OrderHistoryCard from './_components/OrderHistoryCard';

export default function OrderHistoryPage() {
  // 예시 주문 데이터
  const ordersData = [
    {
      id: 1,
      imageUrl: '/images/insam_black.webp',
      name: '인삼',
      option: '검정 화분',
      quantity: 1,
      orderDate: '2025-07-15',
      totalPrice: '18,000원',
      deliveryStatus: 'completed' as const,
    },
    {
      id: 2,
      imageUrl: '/images/african_violet_black.webp',
      name: '아프리카 바이올렛',
      option: '흰색 화분',
      quantity: 2,
      orderDate: '2025-07-16',
      totalPrice: '36,000원',
      deliveryStatus: 'shipping' as const,
    },
    {
      id: 3,
      imageUrl: '/images/aglaonema_siam_black.webp',
      name: '아글라오네마',
      option: '갈색 화분',
      quantity: 1,
      orderDate: '2025-07-17',
      totalPrice: '18,000원',
      deliveryStatus: 'preparing' as const,
    },
    {
      id: 4,
      imageUrl: '/images/acadia_palenopsis_orchid.webp',
      name: '팔레놉시스 난초',
      option: '초록 화분',
      quantity: 3,
      orderDate: '2025-07-18',
      totalPrice: '54,000원',
      deliveryStatus: 'completed' as const,
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
    <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
      {/* 주문 내역 카드 - 여러 개일 경우 map으로 반복 */}
      {displayItems.map((order) => (
        <OrderHistoryCard key={order.id} order={order} />
      ))}
      {/* 페이지네이션 UI */}
      <div className='mt-8 flex justify-center'>
        <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}
