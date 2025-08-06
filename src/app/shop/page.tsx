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
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 12;

  // 필터 파라미터 파싱
  const filters = {
    size: params.size?.split(',').filter(Boolean) || [],
    difficulty: params.difficulty?.split(',').filter(Boolean) || [],
    light: params.light?.split(',').filter(Boolean) || [],
    space: params.space?.split(',').filter(Boolean) || [],
    season: params.season?.split(',').filter(Boolean) || [],
    suppliesCategory: params.suppliesCategory?.split(',').filter(Boolean) || [],
  };

  // 서버에서 필터링된 현재 페이지의 데이터 가져오기
  const { products, pagination } = await getFilteredProductsWithPagination({
    page: currentPage,
    limit: itemsPerPage,
    search: params.search,
    sort: params.sort,
    category: params.category || 'plant',
    filters,
  });

  // URL 파라미터 전달
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
