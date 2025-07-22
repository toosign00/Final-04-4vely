// src/app/shop/components/CategoryFilter.tsx
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { CategoryFilter } from '@/types/product';

interface CategoryFilterProps {
  filters: CategoryFilter;
  onFilterChange: (category: keyof CategoryFilter, value: string) => void;
  isMobile?: boolean;
}

/**
 * 카테고리 필터 사이드바
 * - 데스크톱: 좌측 고정 사이드바
 * - 모바일: Sheet 모달 내부에서 사용
 * - 아코디언 형태로 필터 옵션 표시
 */
export default function CategoryFilterSidebar({ filters, onFilterChange, isMobile = false }: CategoryFilterProps) {
  // 필터 옵션 정의
  const FILTER_OPTIONS = {
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

  // 섹션 제목 정의
  const SECTION_TITLES = {
    size: '크기',
    difficulty: '난이도',
    light: '빛',
    space: '공간',
    season: '계절',
  };

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <div className='space-y-4 px-4 pb-6'>
        <Accordion type='multiple' defaultValue={[]} className='w-full'>
          {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
            <AccordionItem key={key} value={key} className='border-b border-gray-300'>
              <AccordionTrigger className='text-secondary t-h4 py-3 hover:no-underline'>{SECTION_TITLES[key as keyof typeof SECTION_TITLES]}</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-3 pt-2 pb-3'>
                  {options.map((option) => (
                    <div key={option.value} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`mobile-${key}-${option.value}`}
                        checked={filters[key as keyof CategoryFilter].includes(option.value)}
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
          <Button variant='ghost' className='t-desc w-full justify-start'>
            신상품
          </Button>
          <Button variant='ghost' className='t-desc w-full justify-start'>
            식물
          </Button>
          <Button variant='ghost' className='t-desc w-full justify-start'>
            원예 용품
          </Button>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className='space-y-4'>
        <h3 className='text-secondary t-h3 pt-2'>Filter By</h3>
        <Accordion type='multiple' defaultValue={[]} className='w-full pl-3'>
          {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
            <AccordionItem key={key} value={key} className='border-b border-gray-300'>
              <AccordionTrigger className='text-secondary t-body hover:no-underline'>{SECTION_TITLES[key as keyof typeof SECTION_TITLES]}</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-3 pt-2'>
                  {options.map((option) => (
                    <div key={option.value} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`${key}-${option.value}`}
                        checked={filters[key as keyof CategoryFilter].includes(option.value)}
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
    </div>
  );
}
