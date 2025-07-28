/**
 * @fileoverview 북마크된 상품 목록 페이지
 * @description 서버에서 북마크된 상품 데이터를 가져와 `BookmarkProductsList` 컴포넌트에 전달하여 화면에 표시합니다.
 *              데이터 로딩 중 에러가 발생할 경우, 사용자에게 적절한 에러 메시지를 보여줍니다.
 */
import { getBookmarksFromServer } from '@/lib/functions/mypage/bookmarkFunctions';
import { getImageUrl } from '@/lib/utils/auth.server';
import { Product } from '@/types/product.types';
import BookmarkProductsList from './_components/BookmarkProductsList';
import ErrorDisplay from './_components/ErrorDisplay';
import { ProcessedProduct, ProductImageProvider } from './_contexts/ProductImageContext';

/**
 * 상품의 이미지 URL을 서버에서 처리하는 액션
 */
async function processProductImages(productData: Product): Promise<ProcessedProduct> {
  'use server';

  if (!productData || !productData.mainImages) {
    return {
      ...productData,
      mainImages: [],
    };
  }

  const processedMainImages = await Promise.all(productData.mainImages.map((imagePath: string) => getImageUrl(imagePath)));

  return {
    ...productData,
    mainImages: processedMainImages,
  };
}

/**
 * @function ProductsPage
 * @description 북마크된 상품 목록을 표시하는 페이지 컴포넌트입니다.
 *              서버 사이드에서 비동기적으로 상품 데이터를 가져와 클라이언트 컴포넌트로 전달합니다.
 * @returns 서버에서 렌더링된 페이지 컴포넌트를 반환합니다.
 */
export default async function ProductsPage() {
  // 서버로부터 'product' 타입의 북마크 데이터를 비동기적으로 가져옵니다.
  const result = await getBookmarksFromServer('product');

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
        <ErrorDisplay title='북마크된 상품을 불러오지 못했습니다' message={`일시적인 오류가 발생했어요.\n${result.error}`} />
      </div>
    );
  }

  // 데이터 로딩에 성공했을 경우, `BookmarkProductsList` 컴포넌트에 데이터를 전달하여 렌더링합니다.
  // `result.data`가 `undefined`일 경우를 대비하여 빈 배열(`[]`)을 기본값으로 전달하여 안정성을 높입니다.
  return (
    <ProductImageProvider processProductImages={processProductImages}>
      <BookmarkProductsList bookmarks={result.data || []} />
    </ProductImageProvider>
  );
}

/**
 * 페이지 메타데이터 (선택사항)
 * Next.js App Router에서 사용할 수 있는 메타데이터 설정
 */
export const metadata = {
  title: '내 북마크 - 상품',
  description: '북마크한 상품 목록을 확인하고 관리하세요',
};
