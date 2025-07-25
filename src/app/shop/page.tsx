// src/app/shop/page.tsx (서버 컴포넌트)
import { getAllProductsTransformed } from '@/lib/functions/productFunctions';
import ShopClientContent from './_components/ShopClientContent';

export default async function ShopPage() {
  // 서버에서 데이터 미리 로딩
  const products = await getAllProductsTransformed();

  return (
    <div className='bg-surface min-h-screen p-4'>
      <ShopClientContent initialProducts={products} />
    </div>
  );
}
