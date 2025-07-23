// src/app/shop/page.tsx (서버 컴포넌트)
import { getAllProductsTransformed } from '@/lib/functions/market';
import ShopClientContent from './_components/ShopClientContent';

export default async function ShopPage() {
  // 서버에서 데이터 미리 로딩 - 새로운 변환 함수 사용
  const products = await getAllProductsTransformed();

  return (
    <div className='bg-surface min-h-screen p-4'>
      {/* 클라이언트 컴포넌트에 서버 데이터 전달 */}
      <ShopClientContent initialProducts={products} />
    </div>
  );
}
