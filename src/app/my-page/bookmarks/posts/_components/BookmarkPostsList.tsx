/**
 * @fileoverview 북마크된 게시글 목록을 표시하는 클라이언트 컴포넌트
 * @description `useEffect`와 `useState`를 사용하여 부모로부터 받은 데이터를 안정적으로 관리하고,
 *              `useMemo`를 통해 페이지네이션 관련 계산을 최적화합니다.
 *              북마크된 게시글이 없을 경우 사용자에게 친절한 안내 메시지를 표시합니다.
 */
'use client';

import BookmarkSkeletonUI from '@/app/my-page/_components/skeletons/BookmarkSkeletonUI';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { TransformedBookmarkItem } from '@/lib/functions/mypage/bookmark/bookmarkFunctions';
import { BookOpen } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import PostCard from './PostCard';

/**
 * @interface BookmarkPostsListProps
 * @description BookmarkPostsList 컴포넌트가 받는 props의 타입을 정의
 * @property {TransformedBookmarkItem[]} bookmarks - 서버로부터 변환되어 전달된 북마크 게시글 아이템의 배열
 * @property {number} initialPage - URL에서 가져온 초기 페이지 번호
 * @property {number} total - 전체 북마크 수
 * @property {boolean} hasMore - 다음 페이지가 있는지 여부
 */
interface BookmarkPostsListProps {
  bookmarks: TransformedBookmarkItem[];
  initialPage: number;
  total: number;
  hasMore: boolean;
}

/**
 * @constant {number} ITEMS_PER_PAGE
 * @description 한 페이지에 표시될 게시글의 수를 정의하는 상수
 */
const ITEMS_PER_PAGE = 5;

/**
 * @function BookmarkPostsList
 * @description 북마크된 게시글 목록을 페이지네이션 기능과 함께 표시하는 메인 컴포넌트
 * @param {BookmarkPostsListProps} props - 컴포넌트 props
 * @returns {JSX.Element} 렌더링된 북마크 게시글 목록 또는 빈 상태 메시지를 반환
 */
export default function BookmarkPostsList({ bookmarks: initialBookmarks, initialPage, total }: BookmarkPostsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);

  /**
   * @state {TransformedBookmarkItem[]} bookmarks
   * @description 부모로부터 받은 북마크 목록을 컴포넌트 내부 상태로 안전하게 관리
   */
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  /**
   * @state {number} currentPage
   * @description 현재 페이지 번호를 URL 기반으로 관리하는 상태
   */
  const [currentPage, setCurrentPage] = useState(initialPage);

  /**
   * @state {boolean} isPageLoading
   * @description 페이지네이션 전환 시 로딩 상태를 관리하는 상태
   */
  const [isPageLoading, setIsPageLoading] = useState(false);

  /**
   * @function handleDetailClick
   * @description 게시글 상세보기 버튼 클릭 시 게시글 상세 페이지로 이동하는 핸들러
   * @param {number} postId - 이동할 게시글의 ID
   */
  const handleDetailClick = (postId: number, postType: 'community' | 'magazine') => {
    if (postType === 'magazine') {
      router.push(`/green-magazine/${postId}`);
    } else {
      router.push(`/community/${postId}`);
    }
  };

  /**
   * @function handlePageChange
   * @description 페이지 변경 시 URL을 업데이트하고 스크롤을 최상단으로 이동하는 핸들러
   * @param {number} page - 이동할 페이지 번호
   */
  const handlePageChange = (page: number) => {
    // 로딩 상태 시작
    setIsPageLoading(true);

    // 즉시 페이지 상태 업데이트 (지연 방지)
    setCurrentPage(page);

    // 스크롤을 즉시 최상단으로 이동 (애니메이션 없음)
    window.scrollTo({ top: 0, behavior: 'auto' });

    // URL 업데이트 (히스토리 추가)
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    router.push(`/my-page/bookmarks/posts${queryString ? `?${queryString}` : ''}`);
  };

  /**
   * @function handleDelete
   * @description 북마크 삭제 완료 후 목록에서 제거하는 핸들러
   * @param {number} deletedId - 삭제된 북마크의 ID
   */
  const handleDelete = (deletedId: number) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== deletedId));
  };

  /**
   * @effect
   * @description 부모 컴포넌트로부터 받은 `initialBookmarks` prop이 변경될 때마다
   *              내부 `bookmarks` 상태를 동기화하여 데이터의 일관성을 유지
   *              이 패턴은 서버 데이터와 클라이언트 상태를 안정적으로 연결
   */
  useEffect(() => {
    setBookmarks(initialBookmarks);
    // 새 데이터가 도착하면 로딩 상태 해제
    setIsPageLoading(false);
  }, [initialBookmarks]);

  /**
   * @effect
   * @description URL 파라미터가 변경될 때마다 현재 페이지 상태를 동기화
   *              브라우저의 뒤로가기/앞으로가기 버튼을 지원
   */
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(page);
  }, [searchParams]);

  /**
   * @memo paginationData
   * @description 페이지네이션과 관련된 데이터를 계산하고 메모이제이션
   *              내부 `bookmarks` 상태나 `currentPage`가 변경될 때만 재계산하여 성능을 최적화
   * @property {number} totalPages - 전체 페이지 수
   * @property {TransformedBookmarkItem[]} displayItems - 현재 페이지에 표시될 게시글 목록
   * @property {boolean} hasItems - 북마크된 게시글이 하나 이상 존재하는지 여부
   * @property {boolean} showPagination - 페이지네이션 UI를 표시할지 여부 (전체 페이지가 2 이상일 때)
   */
  const paginationData = useMemo(() => {
    // 서버에서 이미 페이지네이션된 데이터를 그대로 사용
    const processedBookmarks = bookmarks.map((bookmark) => ({
      ...bookmark,
      imageUrl: bookmark.imageUrl,
    }));

    // 전체 페이지 수는 서버에서 받은 total 정보로 계산
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    return {
      totalPages,
      displayItems: processedBookmarks, // 서버에서 받은 데이터 그대로 사용
      hasItems: total > 0,
      showPagination: totalPages > 1,
    };
  }, [bookmarks, total]);

  // 북마크된 게시글이 없을 경우, 사용자에게 친절한 안내 메시지를 표시
  if (!paginationData.hasItems) {
    return (
      <section className='flex min-h-[25rem] flex-col items-center justify-center px-4 text-center' aria-labelledby='empty-posts-title' role='region'>
        {/* 일러스트레이션 아이콘 */}
        <div className='mb-6' aria-hidden='true'>
          <BookOpen className='mx-auto h-16 w-16 text-gray-300' />
        </div>

        {/* 메인 메시지 */}
        <div className='mb-8 max-w-md'>
          <h3 id='empty-posts-title' className='t-h3 text-secondary mb-3 font-bold'>
            아직 북마크한 게시글이 없습니다
          </h3>
          <p className='t-body text-muted leading-relaxed'>
            유용한 정보나 흥미로운 게시글을 발견하면 북마크해보세요!
            <br />
            나중에 쉽게 찾아볼 수 있어요.
          </p>
        </div>

        {/* 추가 안내 메시지 */}
        <div className='text-center'>
          <p className='t-small text-muted/80'>💡 게시글에서 북마크 버튼을 눌러 저장할 수 있어요</p>
        </div>
      </section>
    );
  }

  // 페이지 로딩 중일 때 스켈레톤 UI 표시
  if (isPageLoading) {
    return <BookmarkSkeletonUI />;
  }

  // 북마크된 게시글이 있을 경우, 목록과 페이지네이션을 렌더링
  return (
    <div ref={topRef} className='grid gap-6'>
      {/* 현재 페이지에 해당하는 게시글 카드 목록을 렌더링 */}
      <div className='grid gap-8'>
        {paginationData.displayItems.map((post, index) => (
          <PostCard
            // 각 게시글에 고유한 key를 할당하여 React의 렌더링 성능을 최적화합니다.
            key={`bookmark-post-${post.id}`}
            post={{
              id: post.id,
              imageUrl: post.imageUrl,
              title: post.name,
              content: post.description,
              author: post.author || '작성자 없음',
              viewCount: post.views || 0,
              commentCount: post.repliesCount || 0,
              type: post.type as 'community' | 'magazine',
            }}
            bookmarkId={post.bookmarkId}
            onDetailClick={(postId, postType) => handleDetailClick(postId, postType)}
            onDelete={() => handleDelete(post.id)}
            priority={index === 0} // 첫 번째 이미지만 우선 로딩
          />
        ))}
      </div>

      {/* 페이지네이션이 필요한 경우 (전체 페이지가 2 이상) UI를 렌더링 */}
      {paginationData.showPagination && (
        <div className='mt-6 flex justify-center'>
          <PaginationWrapper currentPage={currentPage} totalPages={paginationData.totalPages} setCurrentPage={handlePageChange} />
        </div>
      )}
    </div>
  );
}
