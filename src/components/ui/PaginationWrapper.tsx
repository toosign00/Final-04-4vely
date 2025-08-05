import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  className?: string;
}

export default function PaginationWrapper({ currentPage, totalPages, setCurrentPage, className }: PaginationWrapperProps) {
  // 현재 페이지 중심 페이지네이션 로직
  const getVisiblePages = (current: number, total: number): (number | string)[] => {
    // 데스크톱: 현재 페이지 양옆에 2개씩 (총 5개 + 첫/끝 + 생략)
    // 모바일: 현재 페이지 양옆에 1개씩 (총 3개 + 첫/끝 + 생략)
    const desktopRange = 2; // 양옆에 2개씩

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // 항상 첫 페이지 표시
    pages.push(1);

    // 현재 페이지 주변 범위 계산
    const startPage = Math.max(current - desktopRange, 2);
    const endPage = Math.min(current + desktopRange, total - 1);

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

  const visiblePages = getVisiblePages(currentPage, totalPages);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <Pagination className={cn('select-none', className)}>
      <div className='flex w-full flex-col items-center gap-2 md:flex-row'>
        {/* 모바일: 이전/다음 버튼을 위에 배치 */}
        <PaginationContent className='mb-1 w-full list-none justify-center gap-3 md:hidden'>
          <PaginationItem>
            <PaginationPrevious aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : 0} onClick={() => handlePageChange(currentPage - 1)} className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''} />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : 0} onClick={() => handlePageChange(currentPage + 1)} className={currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''} />
          </PaginationItem>
        </PaginationContent>
        {/* 페이지 번호 row (모바일/데스크탑 모두) */}
        <PaginationContent className='w-full list-none justify-center gap-3'>
          {/* 데스크탑에서만 보이는 이전 버튼 */}
          <PaginationItem className='hidden md:block'>
            <PaginationPrevious aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : 0} onClick={() => handlePageChange(currentPage - 1)} className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''} />
          </PaginationItem>
          {/* 페이지 번호들 */}
          {visiblePages.map((page, idx) => {
            const isFirstOrLast = page === 1 || page === totalPages;
            const isCurrent = page === currentPage;
            const isEllipsis = page === '...';
            let shouldHideOnMobile = false;

            // 7페이지 이하이면 모바일에서도 모든 페이지 보여주기
            if (totalPages > 7 && !isFirstOrLast && !isCurrent && !isEllipsis && typeof page === 'number') {
              const distanceFromCurrent = Math.abs(page - currentPage);
              shouldHideOnMobile = distanceFromCurrent > 1;
            }

            return (
              <PaginationItem key={`page-${idx}-${page}`} className={shouldHideOnMobile ? 'hidden md:block' : ''}>
                {page === '...' ? (
                  <span className='px-3 py-2 text-gray-500'>...</span>
                ) : (
                  <PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page as number)}>
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            );
          })}
          {/* 데스크탑에서만 보이는 다음 버튼 */}
          <PaginationItem className='hidden md:block'>
            <PaginationNext aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : 0} onClick={() => handlePageChange(currentPage + 1)} className={currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''} />
          </PaginationItem>
        </PaginationContent>
      </div>
    </Pagination>
  );
}
