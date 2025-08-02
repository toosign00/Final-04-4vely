/**
 * @fileoverview 북마크된 게시글 목록 페이지
 * @description 서버에서 북마크된 게시글 데이터를 가져와 `BookmarkPostsList` 컴포넌트에 전달하여 화면에 표시합니다.
 *              데이터 로딩 중 에러가 발생할 경우, 사용자에게 적절한 에러 메시지를 보여줍니다.
 *              이 페이지는 서버 컴포넌트로 동작하여 초기 로딩 성능을 최적화합니다.
 */
import { getBookmarksFromServer } from '@/lib/functions/mypage/bookmark/bookmarkFunctions';
import ErrorDisplay from '../../_components/ErrorDisplay';
import BookmarkPostsList from './_components/BookmarkPostsList';

/**
 * 북마크 게시글 페이지 컴포넌트의 props 타입 정의
 */
interface PostsPageProps {
  searchParams: Promise<{
    page?: string; // URL 쿼리 파라미터로부터 받는 페이지 번호
  }>;
}

/**
 * @function PostsPage
 * @description 북마크된 게시글 목록을 표시하는 페이지 컴포넌트입니다.
 *              서버 사이드에서 비동기적으로 게시글 데이터를 가져와 클라이언트 컴포넌트로 전달합니다.
 * @param searchParams - URL 쿼리 파라미터 (페이지 번호 포함)
 * @returns {Promise<JSX.Element>} 서버에서 렌더링된 페이지 컴포넌트를 반환합니다.
 */
export default async function PostsPage({ searchParams }: PostsPageProps) {
  // Promise 형태의 searchParams 를 해결하여 실제 값 추출
  const resolvedSearchParams = await searchParams;
  // 현재 페이지 번호 파싱 (기본값: 1)
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  // 서버로부터 'post' 타입의 북마크 데이터를 비동기적으로 가져옵니다.
  const result = await getBookmarksFromServer('post');

  // 데이터 로딩에 실패했을 경우, 사용자에게 에러 메시지를 표시합니다.
  // 로그인이 필요한 경우 프로필 에러 UI와 동일한 메시지를 표시합니다.
  if (!result.success) {
    // 로그인이 필요한 경우 프로필 에러 UI 표시
    if (result.error === '로그인이 필요합니다.') {
      return <ErrorDisplay title='프로필 정보를 불러오지 못했습니다' message='일시적인 오류가 발생했어요.' />;
    }

    // 기타 오류의 경우 기존 북마크 에러 UI 표시
    return (
      <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
        <ErrorDisplay title='북마크된 게시글을 불러오지 못했습니다' message={`일시적인 오류가 발생했어요.\n${result.error}`} />
      </div>
    );
  }

  // 데이터 로딩에 성공했을 경우, `BookmarkPostsList` 컴포넌트에 데이터와 현재 페이지를 전달하여 렌더링합니다.
  // `result.data`가 `undefined`일 경우를 대비하여 빈 배열(`[]`)을 기본값으로 전달하여 안정성을 높입니다.
  return <BookmarkPostsList bookmarks={result.data || []} initialPage={currentPage} />;
}
