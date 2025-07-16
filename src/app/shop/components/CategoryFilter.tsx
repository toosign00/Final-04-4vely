// src/components/ui/CategoryFilter.tsx
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { CategoryFilter } from '@/types/product';

interface CategoryFilterProps {
  filters: CategoryFilter;
  onFilterChange: (category: keyof CategoryFilter, value: string) => void;
}

export default function CategoryFilterSidebar({ filters, onFilterChange }: CategoryFilterProps) {
  const filterOptions = {
    size: [
      { value: 'small', label: '소형' },
      { value: 'medium', label: '중형' },
      { value: 'large', label: '대형' },
    ],
    difficulty: [
      { value: 'easy', label: '쉬움' },
      { value: 'medium', label: '보통' },
      { value: 'hard', label: '어려움' },
    ],
    light: [
      { value: 'low', label: '낮음' },
      { value: 'medium', label: '보통' },
      { value: 'high', label: '높음' },
    ],
    space: [
      { value: 'indoor', label: '실내' },
      { value: 'outdoor', label: '실외' },
    ],
    season: [
      { value: 'spring', label: '봄' },
      { value: 'summer', label: '여름' },
      { value: 'fall', label: '가을' },
      { value: 'winter', label: '겨울' },
    ],
  };

  const sectionTitles = {
    size: '크기',
    difficulty: '난이도',
    light: '빛',
    space: '공간',
    season: '계절',
  };

  return (
    <div className='bg-surface w-64 border-r border-gray-200 p-4 pt-8'>
      {/* 카테고리 헤더 */}
      <div className='mb-6'>
        <h2 className='t-h2 text-secondary mb-4'>Category</h2>
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
        <h3 className='t-h2 text-secondary'>Filter By</h3>

        <Accordion type='multiple' defaultValue={['size', 'difficulty', 'light', 'space', 'season']} className='w-full pl-3'>
          {Object.entries(filterOptions).map(([key, options]) => (
            <AccordionItem key={key} value={key} className='border-b border-gray-200'>
              <AccordionTrigger className='t-body text-secondary hover:no-underline'>{sectionTitles[key as keyof typeof sectionTitles]}</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-3 pt-2'>
                  {options.map((option) => (
                    <div key={option.value} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`${key}-${option.value}`}
                        checked={filters[key as keyof CategoryFilter].includes(option.value)}
                        onCheckedChange={() => onFilterChange(key as keyof CategoryFilter, option.value)}
                        className='data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                      />
                      <label htmlFor={`${key}-${option.value}`} className='t-desc text-secondary cursor-pointer'>
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
