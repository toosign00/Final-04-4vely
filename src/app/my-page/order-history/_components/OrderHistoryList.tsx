'use client';

import OrderHistorySkeletonUI from '@/app/my-page/_components/skeletons/OrderHistorySkeletonUI';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { OrderHistoryListProps } from '../_types';
import OrderHistoryCard from './OrderHistoryCard';

export default function OrderHistoryList({ orders: initialOrders, pagination }: OrderHistoryListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { page: currentPage, totalPages } = pagination;

  // 로딩 상태 관리
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [orders, setOrders] = useState(initialOrders);

  // 부모로부터 받은 데이터가 변경될 때 상태 동기화
  useEffect(() => {
    setOrders(initialOrders);
    setIsPageLoading(false);
  }, [initialOrders]);

  const handlePageChange = useCallback(
    (page: number) => {
      // 로딩 상태 시작
      setIsPageLoading(true);

      // 스크롤을 즉시 최상단으로 이동
      window.scrollTo({ top: 0, behavior: 'auto' });

      const params = new URLSearchParams(searchParams.toString());

      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }

      const queryString = params.toString();
      const newUrl = queryString ? `/my-page/order-history?${queryString}` : '/my-page/order-history';

      router.push(newUrl);
    },
    [router, searchParams],
  );

  if (orders.length === 0) {
    return null;
  }

  // 페이지 로딩 중일 때 스켈레톤 UI 표시
  if (isPageLoading) {
    return <OrderHistorySkeletonUI />;
  }

  return (
    <>
      {orders.map((order) => (
        <OrderHistoryCard key={order.id} order={order} />
      ))}

      {totalPages > 1 && (
        <div className='mt-10 mb-6 flex justify-center'>
          <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={handlePageChange} className='w-full max-w-md' />
        </div>
      )}
    </>
  );
}
