// src/app/shop/page.tsx (서버 컴포넌트)
import { searchAllProducts } from '@/lib/functions/shop/productServerFunctions';
import ShopClientContent from './_components/ShopClientContent';

export default async function ShopPage() {
  console.log('[ShopPage] 페이지 로드 시작');

  // 서버에서 데이터 미리 로딩
  const products = await searchAllProducts();

  console.log('[ShopPage] 상품 목록 로드 완료:', {
    총상품수: products.length,
    북마크된상품수: products.filter((p) => p.myBookmarkId !== undefined).length,
    첫번째상품: products[0]
      ? {
          id: products[0]._id,
          name: products[0].name,
          myBookmarkId: products[0].myBookmarkId,
        }
      : null,
  });

  return (
    <div className='bg-surface min-h-screen p-4'>
      <ShopClientContent initialProducts={products} />
    </div>
  );
}
