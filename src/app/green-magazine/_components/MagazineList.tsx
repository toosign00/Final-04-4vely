'use client';

import MagazineCard from '@/app/green-magazine/_components/MagazineCard';
import { MagazinePagination, MagazinePostData } from '@/app/green-magazine/_types/magazine.types';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useRouter, useSearchParams } from 'next/navigation';

export interface MagazineListProps {
  items: MagazinePostData[];
  pagination: MagazinePagination;
}

// Green Magazine 메인 페이지 리스트 렌더링
export default function MagazineList({ items, pagination }: MagazineListProps) {
  // url 변경을 위한 라우터 훅
  const router = useRouter();

  // 현재 url의 쿼리 파라미터 가져오는 훅
  const searchParams = useSearchParams();

  /**
   * 페이지 이동 핸들러 (페이지 번호 선택시 적용)
   *
   * 현재 쿼리스트링에서 Page 값 읽음
   * 현재 페이지와 이동할 페이지가 다르면 url 업데이트 후 라우팅
   * @param page - 이동하려는 페이지 번호
   * @returns - 조건에 따라 router.push()로 페이지 전환 혹은 아무 작업도 x
   */
  const setCurrentPage = (page: number) => {
    const currentPage = Number(searchParams.get('page')) || 1;

    // 현재 페이지와 이동할 페이지 같으면 라우터 이동 x
    if (page === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());

    // page 값만 새로 지정
    params.set('page', String(page));

    // url 갱신
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      {/* 카드 리스트 */}
      <div className='flex flex-col gap-8'>
        {items.map((post, i) => (
          <MagazineCard key={post._id} post={post} priority={i === 0} />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className='mt-10'>
        <PaginationWrapper currentPage={pagination.page} totalPages={pagination.totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </>
  );
}
