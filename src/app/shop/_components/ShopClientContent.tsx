// src/app/shop/_components/ShopClientContent.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { CategoryFilter, Product, SortOption } from '@/types/product';
import { Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import CategoryFilterSidebar from './CategoryFilter';
import ProductCard from './ProductCard';

interface ShopClientContentProps {
  initialProducts: Product[];
}

export default function ShopClientContent({ initialProducts }: ShopClientContentProps) {
  const router = useRouter();

  // Zustand 북마크 스토어
  const { isBookmarked } = useBookmarkStore();

  // 상태 관리
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommend');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<CategoryFilter>({
    size: [],
    difficulty: [],
    light: [],
    space: [],
    season: [],
  });

  const [itemsPerPage, setItemsPerPage] = useState(9);

  // 북마크 상태가 반영된 상품 목록
  const productsWithBookmarks = useMemo(() => {
    return initialProducts.map((product) => ({
      ...product,
      isBookmarked: isBookmarked(product.id),
    }));
  }, [initialProducts, isBookmarked]);

  // 정렬 옵션 상수
  const SORT_OPTIONS: SortOption[] = [
    { value: 'recommend', label: '추천순' },
    { value: 'name', label: '이름순' },
    { value: 'new', label: '최신순' },
    { value: 'old', label: '오래된순' },
    { value: 'price-low', label: '가격 낮은 순' },
    { value: 'price-high', label: '가격 높은 순' },
  ];

  // 반응형 페이지당 아이템 수 설정
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(6);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(12);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // 필터 상태 업데이트 핸들러
  const handleFilterChange = (category: keyof CategoryFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value) ? prev[category].filter((item) => item !== value) : [...prev[category], value],
    }));
  };

  // 상품 클릭 핸들러
  const handleProductClick = (id: string) => {
    router.push(`/shop/products/${id}`);
  };

  // 상품 필터링 및 정렬 로직 (북마크 상태 포함)
  useEffect(() => {
    let result = [...productsWithBookmarks]; // 북마크 상태가 업데이트된 상품 목록 사용

    // 검색어 필터링
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((product) => product.name.toLowerCase().includes(searchLower) || product.category.toLowerCase().includes(searchLower));
    }

    // 카테고리 필터링
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        result = result.filter((product) => values.includes(product[key as keyof Product] as string));
      }
    });

    // 정렬 적용
    switch (sortBy) {
      case 'recommend':
        result.sort((a, b) => (b.recommend ? 1 : 0) - (a.recommend ? 1 : 0));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'new':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'old':
        result.sort((a, b) => (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [productsWithBookmarks, searchTerm, filters, sortBy]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 페이지네이션 아이템 렌더링
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setCurrentPage(i)} isActive={i === currentPage} className='cursor-pointer'>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      size: [],
      difficulty: [],
      light: [],
      space: [],
      season: [],
    });
  };

  return (
    <>
      {/* 모바일/태블릿 레이아웃 */}
      <div className='md:p-2 lg:hidden'>
        <div className='mx-auto flex w-full max-w-6xl flex-col items-start pb-2'>
          <div className='text-secondary t-small font-medium'>| Products</div>
          <h2 className='text-secondary t-h2 mt-2 font-light'>Our Plants</h2>
        </div>

        <div className='mb-3 flex items-center gap-2 pt-4'>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant='default' size='sm' className='flex h-8 items-center gap-1.5 px-2.5 py-1.5'>
                <Filter size={16} />
                <span className='text-xs sm:text-sm'>필터</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='flex w-[250px] flex-col sm:w-[300px]'>
              <SheetHeader className='flex-shrink-0'>
                <SheetTitle className='t-h1 mb-4 text-left'>필터</SheetTitle>
              </SheetHeader>
              <div className='flex-1 overflow-y-auto'>
                <CategoryFilterSidebar filters={filters} onFilterChange={handleFilterChange} isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>

          <span className='text-surface0 mr-1 ml-auto text-[11px] sm:text-xs'>{filteredProducts.length} products</span>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='h-8 w-[95px] text-xs sm:h-9 sm:w-[115px] sm:text-sm md:w-[135px]'>
              <SelectValue placeholder='정렬' />
            </SelectTrigger>
            <SelectContent className='[&_[data-radix-select-item-indicator]]:hidden'>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className='text-xs sm:text-sm'>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='relative mb-4'>
          <Search className='text-surface0 absolute top-1/2 left-2.5 -translate-y-1/2 transform' size={16} />
          <Input placeholder='식물을 검색하세요' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='h-8 w-full pl-8 text-xs sm:h-9 sm:text-sm' />
        </div>

        <div className='my-6'>
          {filteredProducts.length === 0 ? (
            <div className='flex min-h-[40vh] items-center justify-center'>
              <div className='text-center'>
                <p className='text-gray-600'>검색 조건에 맞는 상품이 없습니다.</p>
                <button type='button' onClick={handleResetFilters} className='text-success mt-2 hover:text-gray-500'>
                  필터 초기화
                </button>
              </div>
            </div>
          ) : (
            <div className='flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-20'>
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product} // 이미 북마크 상태가 반영된 상품 전달
                  onClick={handleProductClick}
                  isMobile={true}
                />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination className='mt-4'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`} />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* 데스크톱 레이아웃 */}
      <div className='hidden p-4 lg:flex'>
        <div className='w-64'>
          <div className='mx-auto flex w-full max-w-6xl flex-col items-start px-4'>
            <div className='text-secondary t-small font-medium'>| Products</div>
            <h2 className='text-secondary t-h2 mt-2 font-light'>Our Plants</h2>
          </div>
          <CategoryFilterSidebar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className='flex-1'>
          <div className='mb-8 flex items-center justify-between px-16'>
            <span className='text-surface0 t-h4'>{filteredProducts.length} products</span>
            <div className='flex items-center space-x-4'>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='정렬 기준' />
                </SelectTrigger>
                <SelectContent className='[&_[data-radix-select-item-indicator]]:hidden'>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className='relative max-w-md'>
                <Search className='text-surface0 absolute top-1/2 left-3 -translate-y-1/2 transform' size={20} />
                <Input placeholder='상품을 검색하세요...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-80 pl-10' />
              </div>
            </div>
          </div>

          <div className='mb-8 px-16'>
            {filteredProducts.length === 0 ? (
              <div className='flex min-h-[40vh] items-center justify-center'>
                <div className='text-center'>
                  <p className='text-gray-600'>검색 조건에 맞는 상품이 없습니다.</p>
                  <button type='button' onClick={handleResetFilters} className='mt-2 text-green-600 hover:text-green-700'>
                    필터 초기화
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex flex-wrap gap-30'>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product} // 이미 북마크 상태가 반영된 상품 전달
                    onClick={handleProductClick}
                  />
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <Pagination className='mb-8 px-16'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`} />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </>
  );
}
