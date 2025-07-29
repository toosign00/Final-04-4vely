'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useState } from 'react';
import { OrderHistoryListProps } from '../_types';
import OrderHistoryCard from './OrderHistoryCard';

export default function OrderHistoryList({ orders }: OrderHistoryListProps) {
  // 한 페이지에 보여줄 아이템 개수
  const ITEMS_PER_PAGE = 3;

  // 현재 페이지 번호 (1부터 시작)
  const [currentPage, setCurrentPage] = useState(1);

  // 전체 페이지 수
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  // 현재 페이지의 첫 아이템 인덱스
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;

  // 현재 페이지에 보여줄 데이터 배열
  const displayItems = orders.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (orders.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>주문 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      {/* 주문 내역 카드 */}
      {displayItems.map((order) => (
        <OrderHistoryCard key={order.id} order={order} />
      ))}

      {/* 페이지네이션 UI */}
      {totalPages > 1 && (
        <div className='mt-8 flex justify-center'>
          <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
      )}
    </>
  );
}
