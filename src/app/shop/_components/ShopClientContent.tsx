// src/app/shop/_components/ShopClientContent.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { CategoryFilter, Product, SortOption } from '@/types/product.types';
import { Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import CategoryFilterSidebar from './CategoryFilter';
import ProductCard from './ProductCard';

type ProductCategory = 'new' | 'plant' | 'supplies';

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

  // 상태 관리
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [totalPages, setTotalPages] = useState(pagination.totalPages);
  const [totalProducts, setTotalProducts] = useState(pagination.total);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 및 검색 상태
  const [searchTerm, setSearchTerm] = useState(urlParams.search);
  const [sortBy, setSortBy] = useState(urlParams.sort || 'recommend');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>((urlParams.category as ProductCategory) || 'plant');

  // 접근성을 위한 refs
  const shopAnnouncementRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 필터 상태 초기화
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

      // 페이지 파라미터 - 항상 포함 (page=1도 포함)
      const pageToUse = newPage || currentPage;
      params.set('page', pageToUse.toString());

      // 카테고리 파라미터 설정 (기본값이 아닌 경우만)
      if (selectedCategory !== 'plant') {
        params.set('category', selectedCategory);
      }

      // 검색어 파라미터
      if (searchTerm && searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }

      // 정렬 파라미터 (기본값이 아닌 경우만)
      if (sortBy !== 'recommend') {
        params.set('sort', sortBy);
      }

      // 필터 파라미터들
      if (filters.size.length > 0) {
        params.set('size', filters.size.join(','));
      }
      if (filters.difficulty.length > 0) {
        params.set('difficulty', filters.difficulty.join(','));
      }
      if (filters.light.length > 0) {
        params.set('light', filters.light.join(','));
      }
      if (filters.space.length > 0) {
        params.set('space', filters.space.join(','));
      }
      if (filters.season.length > 0) {
        params.set('season', filters.season.join(','));
      }
      if (filters.category.length > 0) {
        params.set('suppliesCategory', filters.category.join(','));
      }

      const newURL = `/shop?${params.toString()}`; // params가 항상 있으므로 ? 사용

      console.log('[URL 업데이트]:', newURL);

      // 페이지 이동 시 스크롤 최상단으로
      startTransition(() => {
        router.push(newURL, { scroll: true });
      });
    },
    [selectedCategory, searchTerm, sortBy, filters, currentPage, router],
  );

  // props 변경 시 상태 업데이트
  useEffect(() => {
    setProducts(initialProducts);
    setCurrentPage(pagination.page);
    setTotalPages(pagination.totalPages);
    setTotalProducts(pagination.total);

    // 접근성: 상품 목록 업데이트 알림
    if (shopAnnouncementRef.current) {
      if (isPending) {
        shopAnnouncementRef.current.textContent = '상품을 불러오는 중입니다.';
      } else {
        shopAnnouncementRef.current.textContent = `${pagination.total.toLocaleString()}개의 상품이 표시되었습니다. 페이지 ${pagination.page}/${pagination.totalPages}`;
      }
    }
  }, [initialProducts, pagination, isPending]);

  // 필터, 정렬, 카테고리 변경 시 1페이지로 이동
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    updateURLAndNavigate(1);
  }, [filters, sortBy, selectedCategory, currentPage, updateURLAndNavigate]);

  // 검색어 변경 시 처리 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== urlParams.search) {
        if (currentPage !== 1) {
          setCurrentPage(1);
        }
        updateURLAndNavigate(1);
      }
    }, 500); // 500ms 디바운싱

    return () => clearTimeout(timer);
  }, [searchTerm, urlParams.search, currentPage, updateURLAndNavigate]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isPending) return;

    console.log('[페이지 변경]:', { from: currentPage, to: page });
    setCurrentPage(page);

    // 접근성: 페이지 변경 알림
    if (shopAnnouncementRef.current) {
      shopAnnouncementRef.current.textContent = `페이지 ${page}로 이동 중입니다.`;
    }

    updateURLAndNavigate(page);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (category: keyof CategoryFilter, value: string) => {
    console.log('[필터 변경]:', { category, value });

    setFilters((prev) => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value];

      // 접근성: 필터 변경 알림
      if (shopAnnouncementRef.current) {
        const action = currentValues.includes(value) ? '제거' : '선택';
        shopAnnouncementRef.current.textContent = `${value} 필터가 ${action}되었습니다.`;
      }

      return {
        ...prev,
        [category]: newValues,
      };
    });
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: ProductCategory) => {
    console.log('[카테고리 변경]:', { from: selectedCategory, to: category });

    setSelectedCategory(category);

    // 접근성: 카테고리 변경 알림
    if (shopAnnouncementRef.current) {
      const categoryNames = { new: '신상품', plant: '식물', supplies: '원예 용품' };
      shopAnnouncementRef.current.textContent = `${categoryNames[category]} 카테고리로 변경되었습니다.`;
    }

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
    console.log('[필터 초기화]');

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

    // 접근성: 필터 초기화 알림
    if (shopAnnouncementRef.current) {
      shopAnnouncementRef.current.textContent = '모든 필터가 초기화되었습니다.';
    }

    // URL도 초기화
    startTransition(() => {
      router.push('/shop?page=1');
    });
  };

  // 검색 핸들러
  const handleSearch = useCallback(
    (value: string) => {
      console.log('[검색어 변경]:', value);
      setSearchTerm(value);
      if (currentPage !== 1) {
        setCurrentPage(1);
      }

      // 접근성: 검색 실행 알림
      if (shopAnnouncementRef.current && value.trim()) {
        shopAnnouncementRef.current.textContent = `"${value.trim()}" 검색을 실행합니다.`;
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

  // 정렬 변경 핸들러
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);

    // 접근성: 정렬 변경 알림
    if (shopAnnouncementRef.current) {
      const sortOption = SORT_OPTIONS.find((option) => option.value === newSortBy);
      if (sortOption) {
        shopAnnouncementRef.current.textContent = `정렬이 ${sortOption.label}로 변경되었습니다.`;
      }
    }
  };

  // 페이지네이션 렌더링 함수
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
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === currentPage}
            className={`cursor-pointer ${isPending ? 'pointer-events-none opacity-50' : ''}`}
            disabled={isPending}
            aria-label={`페이지 ${i}${i === currentPage ? ', 현재 페이지' : ''}로 이동`}
            aria-current={i === currentPage ? 'page' : undefined}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <>
      {/* 접근성: 스크린 리더용 실시간 알림 영역 */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        <div ref={shopAnnouncementRef} />
      </div>

      {/* 모바일/태블릿 레이아웃 */}
      <div className='md:p-2 lg:hidden'>
        <div className='mx-auto flex w-full max-w-6xl flex-col items-start pb-2'>
          <div className='text-secondary t-small font-medium'>| Products</div>
          <h1 className='text-secondary t-h2 mt-2 font-light' role='heading' aria-level={1}>
            Our Plants
          </h1>
        </div>

        {/* 모바일 필터 버튼 */}
        <div className='mb-3 flex items-center gap-2 pt-4' role='toolbar' aria-label='상품 정렬 및 필터링 도구'>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant='default' size='sm' className='flex h-8 items-center gap-1.5 px-2.5 py-1.5' aria-label='필터 옵션 열기' aria-expanded={isFilterOpen} aria-controls='mobile-filter-panel'>
                <Filter size={16} aria-hidden='true' />
                <span className='text-xs sm:text-sm'>필터</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='flex w-[250px] flex-col sm:w-[300px]' id='mobile-filter-panel' role='dialog' aria-labelledby='mobile-filter-title'>
              <SheetHeader className='flex-shrink-0'>
                <SheetTitle id='mobile-filter-title' className='t-h1 mb-4 text-left'>
                  필터
                </SheetTitle>
              </SheetHeader>
              <div className='flex-1 overflow-y-auto' role='region' aria-label='필터 옵션'>
                <CategoryFilterSidebar filters={filters} onFilterChange={handleFilterChange} isMobile={true} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
              </div>
              <div className='mt-4 flex gap-2' role='group' aria-label='필터 관리'>
                <Button onClick={handleResetFilters} variant='outline' className='flex-1' aria-label='모든 필터 초기화'>
                  초기화
                </Button>
                <Button onClick={() => setIsFilterOpen(false)} className='flex-1' aria-label='필터 적용하고 닫기'>
                  적용
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <span className='text-secondary mr-1 ml-auto text-[10px] sm:text-sm md:text-base' role='status' aria-label={`총 ${totalProducts.toLocaleString()}개의 상품이 있습니다`}>
            {totalProducts.toLocaleString()} products
          </span>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className='h-8 w-[95px] text-xs sm:h-9 sm:w-[115px] sm:text-sm md:w-[135px]' aria-label={`정렬 방식 선택, 현재: ${SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || '추천순'}`}>
              <SelectValue placeholder='정렬' />
            </SelectTrigger>
            <SelectContent className='[&_[data-radix-select-item-indicator]]:hidden'>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className='text-xs sm:text-sm' aria-label={`${option.label}로 정렬`}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='relative mb-4' role='search' aria-label='상품 검색'>
          <Search className='text-surface0 absolute top-1/2 left-2.5 -translate-y-1/2 transform' size={16} aria-hidden='true' />
          <Input
            ref={searchInputRef}
            placeholder='식물을 검색하세요'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className='h-8 w-full pl-8 text-xs sm:h-9 sm:text-sm'
            aria-label='상품 검색어 입력'
            aria-describedby='search-description'
          />
          <span id='search-description' className='sr-only'>
            엔터키를 눌러 검색하거나 입력 후 잠시 기다리면 자동으로 검색됩니다
          </span>
        </div>

        {/* 상품 그리드 */}
        <div className='my-6'>
          {isPending ? (
            <div className='flex min-h-[40vh] items-center justify-center' role='status' aria-live='polite'>
              <div className='text-center'>
                <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' aria-hidden='true' />
                <p className='text-gray-500'>상품을 불러오는 중...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className='flex min-h-[40vh] flex-col items-center justify-center' role='status'>
              <p className='mb-4 text-xl text-gray-600'>조건에 맞는 상품이 없습니다.</p>
              <Button onClick={handleResetFilters} variant='outline' aria-label='필터를 초기화하여 모든 상품 보기'>
                필터 초기화
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8' role='grid' aria-label={`상품 목록, ${products.length}개 상품`}>
              {products.map((product) => (
                <div key={product._id} role='gridcell'>
                  <button
                    type='button'
                    onClick={() => handleProductClick(product._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleProductClick(product._id);
                      }
                    }}
                    className='focus-visible:ring-secondary w-full rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                    aria-label={`${product.name} 상품 상세 페이지로 이동`}
                  >
                    <ProductCard
                      product={product}
                      onClick={() => {}} // 빈 함수로 전달하여 중복 클릭 방지
                      isMobile={true}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 모바일 페이지네이션 */}
        {totalPages > 1 && !isPending && (
          <nav role='navigation' aria-label='상품 목록 페이지 네비게이션'>
            <Pagination className='mt-8'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`cursor-pointer ${currentPage === 1 || isPending ? 'pointer-events-none opacity-50' : ''}`}
                    aria-label={`이전 페이지${currentPage === 1 ? ', 비활성화됨' : ''}`}
                    aria-disabled={currentPage === 1 || isPending}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`cursor-pointer ${currentPage === totalPages || isPending ? 'pointer-events-none opacity-50' : ''}`}
                    aria-label={`다음 페이지${currentPage === totalPages ? ', 비활성화됨' : ''}`}
                    aria-disabled={currentPage === totalPages || isPending}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className='sr-only' aria-live='polite'>
              현재 페이지 {currentPage} / 총 {totalPages} 페이지
            </div>
          </nav>
        )}
      </div>

      {/* 데스크톱 레이아웃 */}
      <div className='hidden p-4 lg:flex'>
        <aside className='w-64 flex-shrink-0' role='complementary' aria-label='상품 필터'>
          <div className='mx-auto flex w-full max-w-6xl flex-col items-start px-4'>
            <div className='text-secondary t-small font-medium'>| Products</div>
            <h1 className='text-secondary t-h2 mt-2 font-light' role='heading' aria-level={1}>
              Our Plants
            </h1>
          </div>
          <CategoryFilterSidebar filters={filters} onFilterChange={handleFilterChange} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
        </aside>

        <main className='flex-1' role='main' aria-label='상품 목록'>
          <div className='mb-8 flex items-center justify-between px-16' role='toolbar' aria-label='상품 정렬 및 검색'>
            <div className='flex items-center gap-4'>
              <span className='text-secondary text-lg' role='status' aria-label={`총 ${totalProducts.toLocaleString()}개의 상품이 있습니다`}>
                {totalProducts.toLocaleString()} products
              </span>
            </div>
            <div className='flex items-center space-x-4'>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className='lg:w-[140px] 2xl:w-[180px]' aria-label={`정렬 방식 선택, 현재: ${SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || '추천순'}`}>
                  <SelectValue placeholder='정렬 기준' />
                </SelectTrigger>
                <SelectContent className='[&_[data-radix-select-item-indicator]]:hidden'>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} aria-label={`${option.label}로 정렬`}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className='relative max-w-md' role='search' aria-label='상품 검색'>
                <Search className='text-secondary absolute top-1/2 left-3 -translate-y-1/2 transform' size={20} aria-hidden='true' />
                <Input
                  placeholder='상품을 검색하세요...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className='w-60 pl-10 2xl:w-80'
                  aria-label='상품 검색어 입력'
                  aria-describedby='desktop-search-description'
                />
                <span id='desktop-search-description' className='sr-only'>
                  엔터키를 눌러 검색하거나 입력 후 잠시 기다리면 자동으로 검색됩니다
                </span>
              </div>
            </div>
          </div>

          <div className='mb-8 px-16'>
            {isPending ? (
              <div className='flex min-h-[40vh] items-center justify-center' role='status' aria-live='polite'>
                <div className='text-center'>
                  <div className='border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' aria-hidden='true' />
                  <p className='text-lg text-gray-500'>상품을 불러오는 중...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className='flex min-h-[40vh] flex-col items-center justify-center' role='status'>
                <p className='mb-6 text-2xl text-gray-600'>조건에 맞는 상품이 없습니다.</p>
                <Button onClick={handleResetFilters} variant='outline' size='lg' aria-label='필터를 초기화하여 모든 상품 보기'>
                  필터 초기화
                </Button>
              </div>
            ) : (
              <div className='grid grid-cols-3 gap-6 xl:grid-cols-3 xl:gap-8 2xl:grid-cols-4 2xl:gap-10' role='grid' aria-label={`상품 목록, ${products.length}개 상품`}>
                {products.map((product) => (
                  <div key={product._id} role='gridcell'>
                    <button
                      type='button'
                      onClick={() => handleProductClick(product._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleProductClick(product._id);
                        }
                      }}
                      className='focus-visible:ring-secondary w-full rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                      aria-label={`${product.name} 상품 상세 페이지로 이동`}
                    >
                      <ProductCard
                        product={product}
                        onClick={() => {}} // 빈 함수로 전달하여 중복 클릭 방지
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 데스크톱 페이지네이션 */}
          {totalPages > 1 && !isPending && (
            <div className='flex justify-center px-16'>
              <nav role='navigation' aria-label='상품 목록 페이지 네비게이션'>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`cursor-pointer ${currentPage === 1 || isPending ? 'pointer-events-none opacity-50' : ''}`}
                        aria-label={`이전 페이지${currentPage === 1 ? ', 비활성화됨' : ''}`}
                        aria-disabled={currentPage === 1 || isPending}
                      />
                    </PaginationItem>
                    {renderPaginationItems()}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`cursor-pointer ${currentPage === totalPages || isPending ? 'pointer-events-none opacity-50' : ''}`}
                        aria-label={`다음 페이지${currentPage === totalPages ? ', 비활성화됨' : ''}`}
                        aria-disabled={currentPage === totalPages || isPending}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <div className='sr-only' aria-live='polite'>
                  현재 페이지 {currentPage} / 총 {totalPages} 페이지
                </div>
              </nav>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
