'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export type SortOption = 'latest' | 'oldest';

interface PlantSortSelectProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions = [
  { value: 'latest' as const, label: '최신순' },
  { value: 'oldest' as const, label: '오래된순' },
];

export default function PlantSortSelect({ sortBy, onSortChange }: PlantSortSelectProps) {
  return (
    <Select value={sortBy} onValueChange={onSortChange}>
      <SelectTrigger className='w-26'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
