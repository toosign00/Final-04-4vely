// src/app/shop/_components/CategoryFilter.tsx
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { CategoryFilter } from '@/types/product';

// 상품 카테고리 타입 정의
type ProductCategory = 'new' | 'plant' | 'supplies';

interface CategoryFilterProps {
  filters: CategoryFilter;
  onFilterChange: (category: keyof CategoryFilter, value: string) => void;
  isMobile?: boolean;
  selectedCategory?: ProductCategory;
  onCategoryChange?: (category: ProductCategory) => void;
}

/**
 * 카테고리 필터 사이드바
 * - 데스크톱: 좌측 고정 사이드바
 * - 모바일: Sheet 모달 내부에서 사용
 * - 아코디언 형태로 필터 옵션 표시
 * - 카테고리별 필터 조건부 렌더링
 */
export default function CategoryFilterSidebar({ filters, onFilterChange, isMobile = false, selectedCategory = 'plant', onCategoryChange }: CategoryFilterProps) {
  // 식물 필터 옵션 정의
  const PLANT_FILTER_OPTIONS = {
    size: [
      { value: '소형', label: '소형' },
      { value: '중형', label: '중형' },
      { value: '대형', label: '대형' },
    ],
    difficulty: [
      { value: '쉬움', label: '쉬움' },
      { value: '보통', label: '보통' },
      { value: '어려움', label: '어려움' },
    ],
    light: [
      { value: '음지', label: '음지' },
      { value: '간접광', label: '간접광' },
      { value: '직사광', label: '직사광' },
    ],
    space: [
      { value: '실외', label: '실외' },
      { value: '거실', label: '거실' },
      { value: '침실', label: '침실' },
      { value: '욕실', label: '욕실' },
      { value: '주방', label: '주방' },
      { value: '사무실', label: '사무실' },
    ],
    season: [
      { value: '봄', label: '봄' },
      { value: '여름', label: '여름' },
      { value: '가을', label: '가을' },
      { value: '겨울', label: '겨울' },
    ],
  };

  // 원예용품 필터 옵션 정의
  const SUPPLIES_FILTER_OPTIONS = {
    category: [
      { value: '화분', label: '화분' },
      { value: '도구', label: '도구' },
      { value: '조명', label: '조명' },
    ],
  };

  // 식물 필터 섹션 제목
  const PLANT_SECTION_TITLES = {
    size: '크기',
    difficulty: '난이도',
    light: '빛',
    space: '공간',
    season: '계절',
  };

  // 원예용품 필터 섹션 제목
  const SUPPLIES_SECTION_TITLES = {
    category: '종류',
  };

  // 카테고리 옵션 정의
  const CATEGORY_OPTIONS = [
    { value: 'new' as ProductCategory, label: '신상품' },
    { value: 'plant' as ProductCategory, label: '식물' },
    { value: 'supplies' as ProductCategory, label: '원예 용품' },
  ];

  // 카테고리 버튼 클릭 핸들러
  const handleCategoryClick = (category: ProductCategory) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  // 현재 카테고리에 따라 필터 옵션과 제목 결정
  const getFilterOptionsAndTitles = () => {
    if (selectedCategory === 'plant') {
      return {
        options: PLANT_FILTER_OPTIONS,
        titles: PLANT_SECTION_TITLES,
        showFilters: true,
      };
    } else if (selectedCategory === 'supplies') {
      return {
        options: SUPPLIES_FILTER_OPTIONS,
        titles: SUPPLIES_SECTION_TITLES,
        showFilters: true,
      };
    } else {
      return {
        options: {},
        titles: {},
        showFilters: false,
      };
    }
  };

  const { options: filterOptions, titles: sectionTitles, showFilters } = getFilterOptionsAndTitles();

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <div className='space-y-4 px-4 pb-6'>
        {/* 모바일 카테고리 버튼 */}
        <div className='mb-6'>
          <h3 className='text-secondary t-h3 mb-3'>카테고리</h3>
          <div className='space-y-2'>
            {CATEGORY_OPTIONS.map((option) => (
              <Button key={option.value} variant={selectedCategory === option.value ? 'primary' : 'ghost'} size='sm' className='w-full justify-start' onClick={() => handleCategoryClick(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 필터 섹션 (조건부 렌더링) */}
        {showFilters && (
          <Accordion type='multiple' defaultValue={[]} className='w-full'>
            {Object.entries(filterOptions).map(([key, options]) => (
              <AccordionItem key={key} value={key} className='border-b border-gray-300'>
                <AccordionTrigger className='text-secondary t-h4 py-3 hover:no-underline'>{sectionTitles[key as keyof typeof sectionTitles]}</AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-3 pt-2 pb-3'>
                    {options.map((option) => (
                      <div key={option.value} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`mobile-${key}-${option.value}`}
                          checked={filters[key as keyof CategoryFilter]?.includes(option.value) || false}
                          onCheckedChange={() => onFilterChange(key as keyof CategoryFilter, option.value)}
                          className='data-[state=checked]:border-primary data-[state=checked]:bg-primary border-gray-300'
                        />
                        <label htmlFor={`mobile-${key}-${option.value}`} className='text-secondary t-body cursor-pointer'>
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    );
  }

  // 데스크톱 레이아웃
  return (
    <div className='bg-surface w-64 border-r border-gray-200 p-4 pt-8'>
      {/* 카테고리 헤더 */}
      <div className='mb-6'>
        <h2 className='text-secondary t-h2 mb-4'>Category</h2>
        <div className='space-y-1'>
          {CATEGORY_OPTIONS.map((option) => (
            <Button key={option.value} variant={selectedCategory === option.value ? 'primary' : 'ghost'} size='sm' className='w-full justify-start' onClick={() => handleCategoryClick(option.value)}>
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 필터 섹션 (조건부 렌더링) */}
      {showFilters && (
        <div className='space-y-4'>
          <h3 className='text-secondary t-h3 pt-2'>Filter By</h3>
          <Accordion type='multiple' defaultValue={[]} className='w-full pl-3'>
            {Object.entries(filterOptions).map(([key, options]) => (
              <AccordionItem key={key} value={key} className='border-b border-gray-300'>
                <AccordionTrigger className='text-secondary t-body hover:no-underline'>{sectionTitles[key as keyof typeof sectionTitles]}</AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-3 pt-2'>
                    {options.map((option) => (
                      <div key={option.value} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`${key}-${option.value}`}
                          checked={filters[key as keyof CategoryFilter]?.includes(option.value) || false}
                          onCheckedChange={() => onFilterChange(key as keyof CategoryFilter, option.value)}
                          className='data-[state=checked]:border-primary data-[state=checked]:bg-primary border-gray-300'
                        />
                        <label htmlFor={`${key}-${option.value}`} className='text-secondary t-desc cursor-pointer'>
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
