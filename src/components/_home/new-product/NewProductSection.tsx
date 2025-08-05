'use client';

import NewProductCard from '@/components/_home/new-product/NewProductCard';
import { getNewProducts } from '@/lib/functions/shop/productClientFunctions';
import { NewProduct } from '@/types/newproduct.types';
import { useEffect, useState } from 'react';

// 신상품 전체 리스트 영역
export default function NewProductSection() {
  const [newProducts, setNewProducts] = useState<NewProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await getNewProducts(6);
      if (res.ok && res.item) {
        // UI에 필요한 필드만 추출
        const formattedProducts = res.item.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          mainImages: item.mainImages,
          isNew: item.extra?.isNew ?? false,
        }));
        setNewProducts(formattedProducts);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return <p className='py-10 text-center'>신상품을 불러오는 중입니다...</p>;

  return (
    <section className='w-full bg-[#fdfcf8] px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
      <div className='mx-auto max-w-[76rem]'>
        <h2 className='mb-7 text-center text-2xl font-bold md:text-3xl lg:mb-9 lg:text-5xl'>New Product</h2>
        {/* 상품 카드 리스트 */}
        <div className='grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-7 lg:gap-10'>
          {newProducts.map((product, index) => (
            <div key={product._id} className={index >= 4 ? 'hidden sm:block' : ''}>
              <NewProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
