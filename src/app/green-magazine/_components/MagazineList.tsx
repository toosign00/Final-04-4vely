'use client';

import MagazineCard from '@/app/green-magazine/_components/MagazineCard';
import { MagazinePostData } from '@/app/green-magazine/_types/magazine.types';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useState } from 'react';

interface MagazineListProps {
  items: MagazinePostData[];
}

export default function MagazineList({ items }: MagazineListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 4;

  // 현재 페이지에 표시할 게시글 목록 수
  const currentItems = items.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // 전체 페이지 수
  const totalPages = Math.ceil(items.length / PER_PAGE);

  return (
    <>
      {/* 카드 리스트 */}
      <div className='flex flex-col gap-8'>
        {currentItems.map((post) => (
          <MagazineCard key={post._id} post={post} />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className='mt-10'>
        <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </>
  );
}
