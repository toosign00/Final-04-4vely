// src/app/shop/page.tsx
'use client';

import CategoryFilterSidebar from '@/app/shop/components/CategoryFilter';
import ProductCard from '@/app/shop/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { CategoryFilter, Product, SortOption } from '@/types/product';
import { Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShopPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
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

  // 정렬 옵션 상수
  const SORT_OPTIONS: SortOption[] = [
    { value: 'recommend', label: '추천순' },
    { value: 'price-low', label: '가격 낮은 순' },
    { value: 'price-high', label: '가격 높은 순' },
    { value: 'new', label: '최신순' },
    { value: 'old', label: '오래된순' },
    { value: 'bookmark-level', label: '인기순' },
  ];

  // 반응형 페이지당 아이템 수 설정
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(6);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(9);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // 목업 데이터 초기화
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: '몬스테라',
        image: '/images/acadia_palenopsis_orchid.webp',
        price: 25000,
        category: '관엽식물',
        size: 'medium',
        difficulty: 'easy',
        light: 'medium',
        space: 'indoor',
        season: 'spring',
        isNew: true,
        isBookmarked: false,
        recommend: true,
      },
      {
        id: '2',
        name: '산세베리아',
        image: '/images/african_violet_black.webp',
        price: 15000,
        category: '공기정화식물',
        size: 'small',
        difficulty: 'easy',
        light: 'low',
        space: 'indoor',
        season: 'summer',
        isNew: false,
        isBookmarked: true,
        recommend: true,
      },
      {
        id: '3',
        name: '피커스',
        image: '/images/aglaonema_siam_black.webp',
        price: 35000,
        category: '관엽식물',
        size: 'large',
        difficulty: 'medium',
        light: 'high',
        space: 'indoor',
        season: 'spring',
        isNew: false,
        isBookmarked: false,
        recommend: true,
      },
      {
        id: '4',
        name: '스킨답서스',
        image: '/images/alocasia_polly_black.webp',
        price: 18000,
        category: '덩굴식물',
        size: 'small',
        difficulty: 'easy',
        light: 'medium',
        space: 'indoor',
        season: 'summer',
        isNew: true,
        isBookmarked: false,
        recommend: true,
      },
      {
        id: '5',
        name: '알로카시아',
        image: '/images/baby_gomu.webp',
        price: 42000,
        category: '관엽식물',
        size: 'medium',
        difficulty: 'hard',
        light: 'medium',
        space: 'indoor',
        season: 'spring',
        isNew: false,
        isBookmarked: true,
        recommend: true,
      },
      {
        id: '6',
        name: '틸란드시아',
        image: '/images/baltic_blue_pothos_black.webp',
        price: 12000,
        category: '공기정화식물',
        size: 'small',
        difficulty: 'medium',
        light: 'high',
        space: 'indoor',
        season: 'fall',
        isNew: false,
        isBookmarked: false,
        recommend: false,
      },
      {
        id: '7',
        name: '드라세나',
        image: '/images/bromeliad_black.webp',
        price: 28000,
        category: '관엽식물',
        size: 'medium',
        difficulty: 'easy',
        light: 'medium',
        space: 'indoor',
        season: 'summer',
        isNew: true,
        isBookmarked: false,
        recommend: false,
      },
      {
        id: '8',
        name: '아레카야자',
        image: '/images/burgundy_rubber_tree_blue.webp',
        price: 45000,
        category: '야자류',
        size: 'large',
        difficulty: 'medium',
        light: 'high',
        space: 'indoor',
        season: 'spring',
        isNew: false,
        isBookmarked: true,
        recommend: false,
      },
      {
        id: '9',
        name: '고무나무',
        image: '/images/calathea_conkina_freddie.webp',
        price: 32000,
        category: '관엽식물',
        size: 'large',
        difficulty: 'easy',
        light: 'medium',
        space: 'indoor',
        season: 'summer',
        isNew: false,
        isBookmarked: false,
        recommend: false,
      },
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
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

  // 상품 필터링 및 정렬 로직
  useEffect(() => {
    let result = [...products];

    // 검색어 필터링
    if (searchTerm) {
      result = result.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase()));
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
      case 'bookmark-level':
        result.sort((a, b) => (b.isBookmarked ? 1 : 0) - (a.isBookmarked ? 1 : 0));
        break;
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchTerm, filters, sortBy]);

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

  return (
    <div className='bg-surface min-h-screen'>
      {/* 모바일/태블릿 레이아웃 */}
      <div className='px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:hidden'>
        <h1 className='text-secondary mb-3 text-xl font-bold sm:text-2xl md:text-3xl'>OUR PLANTS</h1>

        <div className='mb-3 flex items-center gap-2'>
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
          <div className='flex flex-wrap justify-center gap-12 sm:gap-12 md:gap-12'>
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onClick={handleProductClick} isMobile={true} />
            ))}
          </div>
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
      <div className='hidden pt-8 lg:flex'>
        <div className='w-64'>
          <div className='mb-6 pl-4'>
            <h1 className='text-secondary t-h1'>Our Plants</h1>
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
            <div className='flex flex-wrap gap-8 pl-12'>
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={handleProductClick} />
              ))}
            </div>
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
    </div>
  );
}
