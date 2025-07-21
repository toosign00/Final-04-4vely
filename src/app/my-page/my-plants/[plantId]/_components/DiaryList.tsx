'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { DiaryListProps } from '../../_types/diary.types';
import DiaryCard from './DiaryCard';

/**
 * 일지 목록을 표시하는 컴포넌트
 */
export default function DiaryList({ diaries, currentPage, onPageChange, onUpdate, onDelete }: DiaryListProps) {
  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(diaries.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayDiaries = diaries.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className='space-y-6'>
      {/* 일지 목록 */}
      <div className='space-y-4'>
        {displayDiaries.map((diary) => (
          <DiaryCard key={diary.id} diary={diary} onDelete={onDelete} onUpdate={onUpdate} />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className='flex justify-center pt-4'>
          <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={onPageChange} />
        </div>
      )}
    </div>
  );
}
