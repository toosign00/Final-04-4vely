'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { OrderHistoryListProps } from '../_types';
import OrderHistoryCard from './OrderHistoryCard';

export default function OrderHistoryList({ orders, pagination }: OrderHistoryListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { page: currentPage, totalPages } = pagination;

  // Optimized page change handler with useCallback to prevent unnecessary re-renders
  const handlePageChange = useCallback(
    (page: number) => {
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

  // This component should not render if orders are empty
  // Empty state is handled in the parent page component
  if (orders.length === 0) {
    return null;
  }

  return (
    <>
      {/* Order history cards */}
      {orders.map((order) => (
        <OrderHistoryCard key={order.id} order={order} />
      ))}

      {/* Pagination UI - only show if more than one page */}
      {totalPages > 1 && (
        <div className='mt-10 mb-6 flex justify-center'>
          <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={handlePageChange} className='w-full max-w-md' />
        </div>
      )}
    </>
  );
}
