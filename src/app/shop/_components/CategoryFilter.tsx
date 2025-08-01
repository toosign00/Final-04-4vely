// src/app/shop/_components/CategoryFilter.tsx
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { CategoryFilter } from '@/types/product.types';
import { useRef } from 'react';

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
  // 접근성을 위한 refs
  const filterAnnouncementRef = useRef<HTMLDivElement>(null);

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

      // 접근성: 카테고리 변경 알림
      if (filterAnnouncementRef.current) {
        const categoryNames = { new: '신상품', plant: '식물', supplies: '원예 용품' };
        filterAnnouncementRef.current.textContent = `${categoryNames[category]} 카테고리가 선택되었습니다.`;
      }
    }
  };

  // 필터 변경 핸들러 (접근성 알림 추가)
  const handleFilterChange = (category: keyof CategoryFilter, value: string) => {
    onFilterChange(category, value);

    // 접근성: 필터 변경 알림
    if (filterAnnouncementRef.current) {
      const isSelected = filters[category]?.includes(value) || false;
      const action = isSelected ? '선택 해제' : '선택';
      filterAnnouncementRef.current.textContent = `${value} 필터가 ${action}되었습니다.`;
    }
  };

  // 키보드 네비게이션 핸들러
  const handleCategoryKeyDown = (e: React.KeyboardEvent, category: ProductCategory) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCategoryClick(category);
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

  // 선택된 필터 개수 계산
  const getSelectedFiltersCount = () => {
    return Object.values(filters).reduce((total, filterArray) => total + filterArray.length, 0);
  };

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <div>
        {/* 접근성: 스크린 리더용 실시간 알림 영역 */}
        <div aria-live='polite' aria-atomic='true' className='sr-only'>
          <div ref={filterAnnouncementRef} />
        </div>

        <div className='space-y-4 px-4 pb-6'>
          {/* 모바일 카테고리 버튼 */}
          <div className='mb-6' role='group' aria-labelledby='mobile-category-title'>
            <h3 id='mobile-category-title' className='text-secondary t-h3 mb-3'>
              카테고리
            </h3>
            <div className='space-y-2' role='radiogroup' aria-labelledby='mobile-category-title'>
              {CATEGORY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedCategory === option.value ? 'primary' : 'ghost'}
                  size='sm'
                  className='w-full justify-start'
                  onClick={() => handleCategoryClick(option.value)}
                  onKeyDown={(e) => handleCategoryKeyDown(e, option.value)}
                  role='radio'
                  aria-checked={selectedCategory === option.value}
                  aria-label={`${option.label} 카테고리${selectedCategory === option.value ? ', 현재 선택됨' : ''}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <span className='sr-only'>현재 {CATEGORY_OPTIONS.find((opt) => opt.value === selectedCategory)?.label} 카테고리가 선택되었습니다.</span>
          </div>

          {/* 필터 섹션 (조건부 렌더링) */}
          {showFilters && (
            <div role='region' aria-labelledby='mobile-filter-title'>
              <h3 id='mobile-filter-title' className='sr-only'>
                상품 필터 옵션
              </h3>
              <Accordion type='multiple' defaultValue={[]} className='w-full'>
                {Object.entries(filterOptions).map(([key, options]) => (
                  <AccordionItem key={key} value={key} className='border-b border-gray-300'>
                    <AccordionTrigger className='text-secondary t-h4 py-3 hover:no-underline' aria-label={`${sectionTitles[key as keyof typeof sectionTitles]} 필터 옵션 ${filters[key as keyof CategoryFilter]?.length || 0}개 선택됨`}>
                      {sectionTitles[key as keyof typeof sectionTitles]}
                      {filters[key as keyof CategoryFilter]?.length > 0 && <span className='sr-only'>, {filters[key as keyof CategoryFilter]?.length}개 필터 선택됨</span>}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='space-y-3 pt-2 pb-3' role='group' aria-labelledby={`mobile-${key}-group-title`}>
                        <span id={`mobile-${key}-group-title`} className='sr-only'>
                          {sectionTitles[key as keyof typeof sectionTitles]} 필터 선택
                        </span>
                        {options.map((option) => (
                          <div key={option.value} className='flex items-center space-x-2'>
                            <Checkbox
                              id={`mobile-${key}-${option.value}`}
                              checked={filters[key as keyof CategoryFilter]?.includes(option.value) || false}
                              onCheckedChange={() => handleFilterChange(key as keyof CategoryFilter, option.value)}
                              className='data-[state=checked]:border-primary data-[state=checked]:bg-primary border-gray-300'
                              aria-describedby={`mobile-${key}-${option.value}-desc`}
                            />
                            <label htmlFor={`mobile-${key}-${option.value}`} className='text-secondary t-body cursor-pointer'>
                              {option.label}
                            </label>
                            <span id={`mobile-${key}-${option.value}-desc`} className='sr-only'>
                              {option.label} {sectionTitles[key as keyof typeof sectionTitles]} 필터
                            </span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {getSelectedFiltersCount() > 0 && (
                <div className='sr-only' aria-live='polite'>
                  현재 {getSelectedFiltersCount()}개의 필터가 적용되었습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 데스크톱 레이아웃
  return (
    <div>
      {/* 접근성: 스크린 리더용 실시간 알림 영역 */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        <div ref={filterAnnouncementRef} />
      </div>

      <div className='bg-surface w-64 border-r border-gray-200 p-4 pt-8'>
        {/* 카테고리 헤더 */}
        <div className='mb-6' role='group' aria-labelledby='desktop-category-title'>
          <h2 id='desktop-category-title' className='text-secondary t-h3 mb-4'>
            Category
          </h2>
          <div className='space-y-1' role='radiogroup' aria-labelledby='desktop-category-title'>
            {CATEGORY_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedCategory === option.value ? 'primary' : 'ghost'}
                size='sm'
                className='w-full justify-start'
                onClick={() => handleCategoryClick(option.value)}
                onKeyDown={(e) => handleCategoryKeyDown(e, option.value)}
                role='radio'
                aria-checked={selectedCategory === option.value}
                aria-label={`${option.label} 카테고리${selectedCategory === option.value ? ', 현재 선택됨' : ''}`}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <span className='sr-only'>현재 {CATEGORY_OPTIONS.find((opt) => opt.value === selectedCategory)?.label} 카테고리가 선택되었습니다.</span>
        </div>

        {/* 필터 섹션 (조건부 렌더링) */}
        {showFilters && (
          <div className='space-y-4' role='region' aria-labelledby='desktop-filter-title'>
            <h3 id='desktop-filter-title' className='text-secondary t-h3 pt-2'>
              Filter By
            </h3>
            <Accordion type='multiple' defaultValue={[]} className='w-full pl-3'>
              {Object.entries(filterOptions).map(([key, options]) => (
                <AccordionItem key={key} value={key} className='border-b border-gray-300'>
                  <AccordionTrigger className='text-secondary t-body hover:no-underline' aria-label={`${sectionTitles[key as keyof typeof sectionTitles]} 필터 옵션 ${filters[key as keyof CategoryFilter]?.length || 0}개 선택됨`}>
                    {sectionTitles[key as keyof typeof sectionTitles]}
                    {filters[key as keyof CategoryFilter]?.length > 0 && <span className='sr-only'>, {filters[key as keyof CategoryFilter]?.length}개 필터 선택됨</span>}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='space-y-3 pt-2' role='group' aria-labelledby={`desktop-${key}-group-title`}>
                      <span id={`desktop-${key}-group-title`} className='sr-only'>
                        {sectionTitles[key as keyof typeof sectionTitles]} 필터 선택
                      </span>
                      {options.map((option) => (
                        <div key={option.value} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`${key}-${option.value}`}
                            checked={filters[key as keyof CategoryFilter]?.includes(option.value) || false}
                            onCheckedChange={() => handleFilterChange(key as keyof CategoryFilter, option.value)}
                            className='data-[state=checked]:border-primary data-[state=checked]:bg-primary border-gray-300'
                            aria-describedby={`${key}-${option.value}-desc`}
                          />
                          <label htmlFor={`${key}-${option.value}`} className='text-secondary t-desc cursor-pointer'>
                            {option.label}
                          </label>
                          <span id={`${key}-${option.value}-desc`} className='sr-only'>
                            {option.label} {sectionTitles[key as keyof typeof sectionTitles]} 필터
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {getSelectedFiltersCount() > 0 && (
              <div className='sr-only' aria-live='polite'>
                현재 {getSelectedFiltersCount()}개의 필터가 적용되었습니다.
              </div>
            )}
            <span className='sr-only'>필터를 변경하면 상품 목록이 자동으로 업데이트됩니다.</span>
          </div>
        )}
      </div>
    </div>
  );
}
