'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import React, { useMemo } from 'react';
import { DiaryListProps } from '../../_types/diary.types';
import DiaryCard from './DiaryCard';

/**
 * 일지 목록을 표시하는 컴포넌트
 *
 * @description
 * - 페이지네이션을 지원하는 일지 목록 표시
 * - 각 일지에 대한 수정/삭제 기능 제공
 * - 반응형 레이아웃으로 다양한 화면 크기 지원
 *
 * @param {DiaryListProps} props - 컴포넌트 props
 * @param {Diary[]} props.diaries - 표시할 일지 목록
 * @param {number} props.currentPage - 현재 페이지 번호
 * @param {(page: number) => void} props.onPageChange - 페이지 변경 핸들러
 * @param {(diary: UpdateDiaryInput) => void} props.onUpdate - 일지 수정 핸들러
 * @param {(diaryId: number) => void} props.onDelete - 일지 삭제 핸들러
 *
 * @performance
 * - React.memo로 불필요한 리렌더링 방지
 * - useMemo로 페이지네이션 계산 결과 메모이제이션
 *
 * @constants
 * - ITEMS_PER_PAGE: 페이지당 표시할 일지 개수 (3개)
 */
const DiaryList = React.memo<DiaryListProps>(({ diaries, currentPage, onPageChange, onUpdate, onDelete }) => {
  const ITEMS_PER_PAGE = 3;

  /**
   * 페이지네이션 관련 계산 값들을 메모이제이션
   * @description 총 페이지 수, 현재 페이지의 시작 인덱스, 표시할 일지 목록을 계산
   */
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(diaries.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayDiaries = diaries.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    return {
      totalPages,
      startIdx,
      displayDiaries,
      showPagination: totalPages > 1,
    };
  }, [diaries, currentPage]);

  return (
    <section className='space-y-6' aria-label='일지 목록'>
      {/* 일지 목록 */}
      <div className='space-y-4' role='list'>
        {paginationData.displayDiaries.map((diary, index) => (
          <article key={diary.id} role='listitem'>
            <DiaryCard
              diary={diary}
              onDelete={onDelete}
              onUpdate={onUpdate}
              isPriority={index === 0} // 첫 번째 카드의 이미지만 priority 설정
            />
          </article>
        ))}
      </div>

      {/* 페이지네이션 */}
      {paginationData.showPagination && (
        <nav className='flex justify-center pt-4' aria-label='일지 목록 페이지네이션'>
          <PaginationWrapper currentPage={currentPage} totalPages={paginationData.totalPages} setCurrentPage={onPageChange} />
        </nav>
      )}

      {/* 스크린 리더를 위한 추가 정보 */}
      <div className='sr-only' aria-live='polite'>
        총 {diaries.length}개의 일지 중 {paginationData.startIdx + 1}번째부터 {Math.min(paginationData.startIdx + ITEMS_PER_PAGE, diaries.length)}번째까지 표시
      </div>
    </section>
  );
});

// 컴포넌트 이름 설정 (React DevTools에서 표시됨)
DiaryList.displayName = 'DiaryList';

export default DiaryList;
