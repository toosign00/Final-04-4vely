import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  className?: string;
}

export default function PaginationWrapper({ currentPage, totalPages, setCurrentPage, className }: PaginationWrapperProps) {
  const [inputPage, setInputPage] = useState('');
  // 현재 페이지 중심 페이지네이션 로직
  const getVisiblePages = (current: number, total: number, isMobile: boolean = false, isVerySmall: boolean = false): (number | string)[] => {
    // 매우 작은 화면: 현재 페이지만 + 첫/끝
    // 모바일: 현재 페이지 양옆에 1개씩 (총 3개 + 첫/끝 + 생략)
    // 데스크탑: 현재 페이지 양옆에 2개씩 (총 5개 + 첫/끝 + 생략)
    let range = isMobile ? 1 : 2;
    let threshold = isMobile ? 5 : 7;

    // 매우 작은 화면에서는 더 제한적으로
    if (isVerySmall) {
      range = 0; // 현재 페이지만
      threshold = 3;
    }

    if (total <= threshold) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // 항상 첫 페이지 표시
    pages.push(1);

    // 현재 페이지 주변 범위 계산
    const startPage = Math.max(current - range, 2);
    const endPage = Math.min(current + range, total - 1);

    // 첫 페이지와 범위 사이에 간격이 있으면 생략 표시
    if (startPage > 2) {
      pages.push('...');
    }

    // 현재 페이지 주변 페이지들 추가
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // 범위와 끝 페이지 사이에 간격이 있으면 생략 표시
    if (endPage < total - 1) {
      pages.push('...');
    }

    // 항상 끝 페이지 표시 (1페이지가 아닌 경우)
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  };

  const desktopVisiblePages = getVisiblePages(currentPage, totalPages, false, false);
  const mobileVisiblePages = getVisiblePages(currentPage, totalPages, true, false);
  const verySmallVisiblePages = getVisiblePages(currentPage, totalPages, true, true);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // 직접 페이지 이동 핸들러
  const handleDirectNavigation = () => {
    const pageNum = parseInt(inputPage, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setInputPage('');
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDirectNavigation();
    }
  };

  return (
    <Pagination className={cn('select-none', className)}>
      <div className='w-full space-y-2'>
        <PaginationContent className='w-full min-w-fit list-none justify-center gap-1 sm:gap-3'>
          {/* 이전 버튼 */}
          <PaginationItem className='flex-shrink-0'>
            <PaginationPrevious
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : 0}
              onClick={() => handlePageChange(currentPage - 1)}
              className={cn(currentPage === 1 ? 'cursor-not-allowed opacity-50' : '', 'px-2 py-1.5 sm:px-2.5 sm:py-2')}
            />
          </PaginationItem>

          {/* 데스크탑 */}
          <div className='hidden md:flex md:gap-3'>
            {desktopVisiblePages.map((page, idx) => (
              <PaginationItem key={`desktop-page-${idx}-${page}`}>
                {page === '...' ? (
                  <span className='px-3 py-2 text-gray-500'>...</span>
                ) : (
                  <PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page as number)}>
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
          </div>

          {/* 중간 크기 모바일 (sm 이상) */}
          <div className='hidden sm:flex sm:gap-2 md:hidden'>
            {mobileVisiblePages.map((page, idx) => (
              <PaginationItem key={`mobile-page-${idx}-${page}`}>
                {page === '...' ? (
                  <span className='px-2 py-1.5 text-sm text-gray-500'>...</span>
                ) : (
                  <PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page as number)} className='px-2.5 py-1.5 text-sm'>
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
          </div>

          {/* 매우 작은 화면 */}
          <div className='flex gap-1 sm:hidden'>
            {verySmallVisiblePages.map((page, idx) => (
              <PaginationItem key={`small-page-${idx}-${page}`} className='flex-shrink-0'>
                {page === '...' ? (
                  <span className='px-1.5 py-1 text-xs text-gray-500'>...</span>
                ) : (
                  <PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page as number)} className='min-w-[32px] px-2 py-1 text-xs'>
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
          </div>

          {/* 다음 버튼 */}
          <PaginationItem className='flex-shrink-0'>
            <PaginationNext
              aria-disabled={currentPage === totalPages}
              tabIndex={currentPage === totalPages ? -1 : 0}
              onClick={() => handlePageChange(currentPage + 1)}
              className={cn(currentPage === totalPages ? 'cursor-not-allowed opacity-50' : '', 'px-2 py-1.5 sm:px-2.5 sm:py-2')}
            />
          </PaginationItem>
        </PaginationContent>

        {/* 매우 작은 화면에서만 보이는 직접 이동 컨트롤 */}
        {totalPages > 3 && (
          <div className='flex items-center justify-center gap-2 sm:hidden'>
            <input
              type='number'
              min='1'
              max={totalPages}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={handleInputKeyPress}
              placeholder='1'
              className='focus-visible h-8 w-10 [appearance:textfield] rounded border border-gray-300 bg-white px-2 text-center text-sm outline-none focus:ring-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            />
            <span className='text-secondary text-sm'>/{totalPages}</span>
            <Button onClick={handleDirectNavigation} disabled={!inputPage || parseInt(inputPage, 10) < 1 || parseInt(inputPage, 10) > totalPages} size='sm' variant='default' className='h-8 px-3 text-xs'>
              이동
            </Button>
          </div>
        )}
      </div>
    </Pagination>
  );
}
