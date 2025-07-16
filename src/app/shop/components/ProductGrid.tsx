// src/components/ui/ProductGrid.tsx
'use client';

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductClick: (id: string) => void;
  onBookmarkToggle: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductGrid({ products, onProductClick, onBookmarkToggle, currentPage, totalPages, onPageChange }: ProductGridProps) {
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => onPageChange(i)} isActive={i === currentPage} className='cursor-pointer'>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <div className='flex-1'>
      {/* 상품 그리드 - 커스텀 레이아웃 유지 */}
      <div
        className='mb-8 grid grid-cols-3'
        style={{
          gap: '60px',
          padding: '60px',
          paddingTop: '0px',
        }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onBookmarkToggle={onBookmarkToggle} onClick={onProductClick} />
        ))}
      </div>

      {/* Shadcn Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`} />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext onClick={() => onPageChange(currentPage + 1)} className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
