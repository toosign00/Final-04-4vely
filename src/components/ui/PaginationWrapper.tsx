import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export default function PaginationWrapper({ currentPage, totalPages, setCurrentPage }: PaginationWrapperProps) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : 0} onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} />
        </PaginationItem>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <PaginationItem key={idx}>
            <PaginationLink isActive={currentPage === idx + 1} onClick={() => setCurrentPage(idx + 1)}>
              {idx + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : 0} onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
