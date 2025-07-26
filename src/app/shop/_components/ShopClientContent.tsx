// src/app/shop/_components/ShopClientContent.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { CategoryFilter, Product, ProductCategory, SortOption, getProductCategories, getProductId, isNewProduct } from '@/types/product';
import { Filter, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import CategoryFilterSidebar from './CategoryFilter';
import ProductCard from './ProductCard';

interface ShopClientContentProps {
  initialProducts: Product[];
}

export default function ShopClientContent({ initialProducts }: ShopClientContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 초기 상태 복원
  const getInitialCategory = (): ProductCategory => {
    const category = searchParams.get('category') as ProductCategory;
    return ['new', 'plant', 'supplies'].includes(category) ? category : 'plant';
  };

  const getInitialFilters = (): CategoryFilter => {
    return {
      size: searchParams.get('size')?.split(',').filter(Boolean) || [],
      difficulty: searchParams.get('difficulty')?.split(',').filter(Boolean) || [],
      light: searchParams.get('light')?.split(',').filter(Boolean) || [],
      space: searchParams.get('space')?.split(',').filter(Boolean) || [],
      season: searchParams.get('season')?.split(',').filter(Boolean) || [],
      category: searchParams.get('suppliesCategory')?.split(',').filter(Boolean) || [],
    };
  };

  // 상태 관리
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recommend');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(getInitialCategory());
  const [filters, setFilters] = useState<CategoryFilter>(getInitialFilters());
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // 정렬 옵션 상수
  const SORT_OPTIONS: SortOption[] = [
    { value: 'recommend', label: '추천순' },
    { value: 'name', label: '이름순' },
    { value: 'new', label: '최신순' },
    { value: 'old', label: '오래된순' },
    { value: 'price-low', label: '가격 낮은 순' },
    { value: 'price-high', label: '가격 높은 순' },
  ];

  // URL 업데이트 함수
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedCategory !== 'plant') {
      params.set('category', selectedCategory);
    }
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    if (sortBy !== 'recommend') {
      params.set('sort', sortBy);
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        if (key === 'category') {
          params.set('suppliesCategory', values.join(','));
        } else {
          params.set(key, values.join(','));
        }
      }
    });

    const newURL = params.toString() ? `/shop?${params.toString()}` : '/shop';
    router.replace(newURL, { scroll: false });
  }, [selectedCategory, searchTerm, sortBy, currentPage, filters, router]);

  // 반응형 페이지당 아이템 수 설정
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(6);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(8);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(9);
      } else if (window.innerWidth < 1536) {
        setItemsPerPage(12);
      } else {
        setItemsPerPage(12);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // 필터 상태 업데이트 핸들러
  const handleFilterChange = (category: keyof CategoryFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value) ? prev[category].filter((item) => item !== value) : [...prev[category], value],
    }));
    setCurrentPage(1);
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: ProductCategory) => {
    setSelectedCategory(category);
    setCurrentPage(1);

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
    const currentQuery = new URLSearchParams();

    if (selectedCategory !== 'plant') {
      currentQuery.set('category', selectedCategory);
    }
    if (searchTerm.trim()) {
      currentQuery.set('search', searchTerm.trim());
    }
    if (sortBy !== 'recommend') {
      currentQuery.set('sort', sortBy);
    }
    if (currentPage > 1) {
      currentQuery.set('page', currentPage.toString());
    }

    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        if (key === 'category') {
          currentQuery.set('suppliesCategory', values.join(','));
        } else {
          currentQuery.set(key, values.join(','));
        }
      }
    });

    const queryString = currentQuery.toString();
    const backUrl = queryString ? `/shop?${queryString}` : '/shop';

    router.push(`/shop/products/${id}?back=${encodeURIComponent(backUrl)}`);
  };

  // 상품 필터링 및 정렬 로직
  useEffect(() => {
    let result = [...initialProducts];

    // 1단계: 메인 카테고리로 필터링
    switch (selectedCategory) {
      case 'new':
        result = result.filter((product) => isNewProduct(product));
        break;
      case 'plant':
        // 식물 카테고리 (원예 용품이 아닌 모든 것)
        result = result.filter((product) => {
          const categories = getProductCategories(product);
          return !categories.includes('원예 용품') && !categories.includes('화분') && !categories.includes('도구') && !categories.includes('조명');
        });
        break;
      case 'supplies':
        // 원예용품 카테고리
        result = result.filter((product) => {
          const categories = getProductCategories(product);
          return categories.includes('원예 용품') || categories.includes('화분') || categories.includes('도구') || categories.includes('조명');
        });
        break;
    }

    // 2단계: 검색어 필터링
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((product) => {
        const categories = getProductCategories(product);
        return product.name.toLowerCase().includes(searchLower) || categories.some((cat) => cat.toLowerCase().includes(searchLower));
      });
    }

    // 3단계: 세부 카테고리 필터링
    Object.values(filters).forEach((filterValues) => {
      if (filterValues.length > 0) {
        result = result.filter((product) => {
          const categories = getProductCategories(product);
          return filterValues.some((value: string) => categories.includes(value));
        });
      }
    });

    // 4단계: 정렬 적용
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'new':
        result.sort((a, b) => (isNewProduct(b) ? 1 : 0) - (isNewProduct(a) ? 1 : 0));
        break;
      case 'old':
        result.sort((a, b) => (isNewProduct(a) ? 1 : 0) - (isNewProduct(b) ? 1 : 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);

    const newTotalPages = Math.ceil(result.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [initialProducts, searchTerm, filters, sortBy, selectedCategory, itemsPerPage, currentPage]); // 🔥 productsWithBookmarks 제거

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
    setSelectedCategory('plant');
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

          <span className='text-secondary mr-1 ml-auto text-[10px] sm:text-sm md:text-base'>{filteredProducts.length} products</span>

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
            <div className='grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8'>
              {paginatedProducts.map((product) => (
                <ProductCard key={getProductId(product)} product={product} onClick={handleProductClick} isMobile={true} />
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
          <CategoryFilterSidebar filters={filters} onFilterChange={handleFilterChange} selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
        </div>

        <div className='flex-1'>
          <div className='mb-8 flex items-center justify-between px-16'>
            <div className='flex items-center gap-4'>
              <span className='text-secondary text-lg'>{filteredProducts.length} products</span>
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
                <Input placeholder='상품을 검색하세요...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-60 pl-10 2xl:w-80' />
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
              <div className='grid grid-cols-3 gap-6 xl:grid-cols-3 xl:gap-8 2xl:grid-cols-4 2xl:gap-10'>
                {paginatedProducts.map((product) => (
                  <ProductCard key={getProductId(product)} product={product} onClick={handleProductClick} />
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
