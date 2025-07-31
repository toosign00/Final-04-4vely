// src/app/shop/page.tsx (서버 컴포넌트)
import { getFilteredProductsWithPagination } from '@/lib/functions/shop/productServerFunctions';
import ShopClientContent from './_components/ShopClientContent';

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
    category?: string;
    size?: string;
    difficulty?: string;
    light?: string;
    space?: string;
    season?: string;
    suppliesCategory?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  // URL 파라미터에서 페이지 번호 추출 (기본값: 1)
  const currentPage = params.page ? parseInt(params.page) : 1;
  const itemsPerPage = 12; // 페이지당 아이템 수 고정

  console.log('[ShopPage] 페이지 로드 시작:', {
    페이지: currentPage,
    검색어: params.search,
    정렬: params.sort,
    카테고리: params.category,
  });

  // 필터 파라미터 파싱
  const filters = {
    size: params.size?.split(',').filter(Boolean) || [],
    difficulty: params.difficulty?.split(',').filter(Boolean) || [],
    light: params.light?.split(',').filter(Boolean) || [],
    space: params.space?.split(',').filter(Boolean) || [],
    season: params.season?.split(',').filter(Boolean) || [],
    suppliesCategory: params.suppliesCategory?.split(',').filter(Boolean) || [],
  };

  // 서버에서 필터링된 현재 페이지의 데이터만 가져오기
  const { products, pagination } = await getFilteredProductsWithPagination({
    page: currentPage,
    limit: itemsPerPage,
    search: params.search,
    sort: params.sort,
    category: params.category,
    filters,
  });

  console.log('[ShopPage] 상품 목록 로드 완료:', {
    총상품수: pagination.total,
    현재페이지: pagination.page,
    전체페이지수: pagination.totalPages,
    현재페이지상품수: products.length,
    북마크된상품수: products.filter((p) => p.myBookmarkId !== undefined).length,
  });

  // URL 파라미터 전달 (클라이언트 컴포넌트에서 필터링용)
  const urlParams = {
    search: params.search || '',
    sort: params.sort || 'recommend',
    category: params.category || 'plant',
    size: params.size || '',
    difficulty: params.difficulty || '',
    light: params.light || '',
    space: params.space || '',
    season: params.season || '',
    suppliesCategory: params.suppliesCategory || '',
  };

  return (
    <div className='bg-surface min-h-screen p-4'>
      <ShopClientContent initialProducts={products} pagination={pagination} urlParams={urlParams} />
    </div>
  );
}
