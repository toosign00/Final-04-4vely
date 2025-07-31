// src/app/shop/_components/ShopClientContent.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { CategoryFilter, Product, ProductCategory, SortOption } from '@/types/product.types';
import { Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import CategoryFilterSidebar from './CategoryFilter';
import ProductCard from './ProductCard';

interface ShopClientContentProps {
  initialProducts: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  urlParams: {
    search: string;
    sort: string;
    category: string;
    size: string;
    difficulty: string;
    light: string;
    space: string;
    season: string;
    suppliesCategory: string;
  };
}

export default function ShopClientContent({ initialProducts, pagination, urlParams }: ShopClientContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 상태 관리 - URL 파라미터로부터 초기화
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [totalPages, setTotalPages] = useState(pagination.totalPages);
  const [totalProducts, setTotalProducts] = useState(pagination.total);

  const [searchTerm, setSearchTerm] = useState(urlParams.search);
  const [sortBy, setSortBy] = useState(urlParams.sort);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(urlParams.category as ProductCategory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 초기화
  const [filters, setFilters] = useState<CategoryFilter>({
    size: urlParams.size ? urlParams.size.split(',').filter(Boolean) : [],
    difficulty: urlParams.difficulty ? urlParams.difficulty.split(',').filter(Boolean) : [],
    light: urlParams.light ? urlParams.light.split(',').filter(Boolean) : [],
    space: urlParams.space ? urlParams.space.split(',').filter(Boolean) : [],
    season: urlParams.season ? urlParams.season.split(',').filter(Boolean) : [],
    category: urlParams.suppliesCategory ? urlParams.suppliesCategory.split(',').filter(Boolean) : [],
  });

  // 정렬 옵션 상수
  const SORT_OPTIONS: SortOption[] = [
    { value: 'recommend', label: '추천순' },
    { value: 'name', label: '이름순' },
    { value: 'new', label: '최신순' },
    { value: 'old', label: '오래된순' },
    { value: 'price-low', label: '가격 낮은 순' },
    { value: 'price-high', label: '가격 높은 순' },
  ];

  // URL 업데이트 및 페이지 이동 함수
  const updateURLAndNavigate = useCallback(
    (newPage?: number) => {
      const params = new URLSearchParams();

      // 페이지 파라미터 (1페이지도 표시)
      params.set('page', (newPage || currentPage).toString());

      if (selectedCategory !== 'plant') {
        params.set('category', selectedCategory);
      }
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }
      if (sortBy !== 'recommend') {
        params.set('sort', sortBy);
      }

      // 필터 파라미터
      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          if (key === 'category') {
            params.set('suppliesCategory', values.join(','));
          } else {
            params.set(key, values.join(','));
          }
        }
      });

      const newURL = `/shop?${params.toString()}`;

      // 페이지 이동 시 스크롤 최상단으로
      startTransition(() => {
        router.push(newURL, { scroll: true });
      });
    },
    [selectedCategory, searchTerm, sortBy, filters, router],
  );

  // 초기 로드 시 URL 업데이트 (page=1이 없는 경우 추가)
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    if (!urlSearchParams.has('page')) {
      updateURLAndNavigate(1);
    }
  }, []);

  // props 변경 시 상태 업데이트
  useEffect(() => {
    setProducts(initialProducts);
    setCurrentPage(pagination.page);
    setTotalPages(pagination.totalPages);
    setTotalProducts(pagination.total);
  }, [initialProducts, pagination]);

  // 필터, 정렬, 카테고리 변경 시 1페이지로 이동
  useEffect(() => {
    updateURLAndNavigate(1);
  }, [filters, sortBy, selectedCategory]);

  // 검색어 변경 시 처리 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== urlParams.search) {
        updateURLAndNavigate(1);
      }
    }, 500); // 500ms 디바운싱

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    updateURLAndNavigate(page);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (category: keyof CategoryFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value) ? prev[category].filter((item) => item !== value) : [...prev[category], value],
    }));
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: ProductCategory) => {
    setSelectedCategory(category);

    // 카테고리 변경 시 관련 없는 필터 초기화
    if (category === 'new') {
      setFilters({
        size: [],
        difficulty: [],
        light: [],
        space: [],
        season: [],
        category: [],
      });
    } else if (category === 'plant') {
      setFilters((prev) => ({
        ...prev,
        category: [],
      }));
    } else if (category === 'supplies') {
      setFilters((prev) => ({
        size: [],
        difficulty: [],
        light: [],
        space: [],
        season: [],
        category: prev.category || [],
      }));
    }
  };

  // 상품 클릭 핸들러
  const handleProductClick = (id: number) => {
    const currentUrl = new URLSearchParams(window.location.search);
    const backUrl = `/shop?${currentUrl.toString()}`;
    router.push(`/shop/products/${id}?back=${encodeURIComponent(backUrl)}`);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('plant');
    setSortBy('recommend');
    setFilters({
      size: [],
      difficulty: [],
      light: [],
      space: [],
      season: [],
      category: [],
    });
    setCurrentPage(1);
  };

  // 검색 핸들러
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    },
    [currentPage],
  );

  // 검색 입력 엔터키 핸들러
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };
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
          <PaginationLink onClick={() => handlePageChange(i)} isActive={i === currentPage} className={`cursor-pointer ${isPending ? 'opacity-50' : ''}`} disabled={isPending}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <>
      {/* 모바일/태블릿 레이아웃 */}
      <div className='md:p-2 lg:hidden'>
        <div className='mx-auto flex w-full max-w-6xl flex-col items-start pb-2'>
          <div className='text-secondary t-small font-medium'>| Products</div>
          <h2 className='text-secondary t-h2 mt-2 font-light'>Our Plants</h2>
        </div>

        {/* 모바일 필터 버튼 */}
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
                <CategoryFilterSidebar filters={filters} onFilterChange={handleFilterChange} isMobile={true} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
              </div>
            </SheetContent>
          </Sheet>

          <span className='text-secondary mr-1 ml-auto text-[10px] sm:text-sm md:text-base'>{totalProducts} products</span>

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
          <Input placeholder='식물을 검색하세요' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleSearchKeyPress} className='h-8 w-full pl-8 text-xs sm:h-9 sm:text-sm' />
        </div>

        {/* 상품 그리드 */}
        <div className='my-6'>
          {isPending ? (
            <div className='flex min-h-[40vh] items-center justify-center'>
              <p className='text-gray-500'>상품을 불러오는 중...</p>
            </div>
          ) : products.length === 0 ? (
            <div className='flex flex-col items-center py-16 text-center'>
              <p className='text-secondary mb-4 text-lg'>검색 결과가 없습니다.</p>
              <Button onClick={handleResetFilters} variant='outline' size='sm'>
                필터 초기화
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8'>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} onClick={() => handleProductClick(product._id)} isMobile={true} />
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Pagination className='mt-8'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={`cursor-pointer ${currentPage === 1 || isPending ? 'pointer-events-none opacity-50' : ''}`} />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={`cursor-pointer ${currentPage === totalPages || isPending ? 'pointer-events-none opacity-50' : ''}`} />
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
          <CategoryFilterSidebar filters={filters} onFilterChange={handleFilterChange} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
        </div>

        <div className='flex-1'>
          <div className='mb-8 flex items-center justify-between px-16'>
            <div className='flex items-center gap-4'>
              <span className='text-secondary text-lg'>{totalProducts} products</span>
            </div>
            <div className='flex items-center space-x-4'>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='lg:w-[140px] 2xl:w-[180px]'>
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
                <Search className='text-secondary absolute top-1/2 left-3 -translate-y-1/2 transform' size={20} />
                <Input placeholder='상품을 검색하세요...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleSearchKeyPress} className='w-60 pl-10 2xl:w-80' />
              </div>
            </div>
          </div>

          <div className='mb-8 px-16'>
            {isPending ? (
              <div className='flex min-h-[40vh] items-center justify-center'>
                <p className='text-gray-500'>상품을 불러오는 중...</p>
              </div>
            ) : products.length === 0 ? (
              <div className='flex flex-col items-center py-16 text-center'>
                <p className='text-secondary mb-4 text-lg'>검색 결과가 없습니다.</p>
                <Button onClick={handleResetFilters} variant='outline'>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <div className='grid grid-cols-3 gap-6 xl:grid-cols-3 xl:gap-8 2xl:grid-cols-4 2xl:gap-10'>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} onClick={() => handleProductClick(product._id)} />
                ))}
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination className='mt-12'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={`cursor-pointer ${currentPage === 1 || isPending ? 'pointer-events-none opacity-50' : ''}`} />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={`cursor-pointer ${currentPage === totalPages || isPending ? 'pointer-events-none opacity-50' : ''}`} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </>
  );
}
