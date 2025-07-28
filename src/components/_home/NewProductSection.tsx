'use client';

import type { Product } from '@/types/product.types';
import Image from 'next/image';

type NewProduct = Pick<Product, '_id' | 'name' | 'price'> & {
  isNew?: boolean;
  image: string;
};

// 신상품 단일 카드
function NewProductCard({ product }: { product: NewProduct }) {
  return (
    <div className='relative aspect-square w-full rounded-2xl shadow-2xl'>
      {/* New 배지 */}
      {product.isNew && <div className='bg-secondary absolute top-0 left-0 z-1 rounded-ee-xl rounded-tl-xl px-3 py-1.5 text-xs font-semibold text-white md:text-base lg:text-lg'>NEW</div>}

      {/* 상품 이미지 */}
      <Image src={product.image} alt={product.name} width={400} height={400} className='h-full w-full rounded-xl object-cover' priority />

      {/* 상품명, 가격 */}
      <div className='absolute bottom-0 left-0 flex h-[30%] w-full flex-col justify-center rounded-b-xl bg-black/40 text-center text-white md:h-[25%]'>
        <p className='text-sm font-semibold sm:text-base md:text-lg'>{product.name}</p>
        <p className='mt-0.5 text-xs sm:text-sm md:text-base'>₩{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}

// 신상품 전체 리스트 영역
export default function NewProductSection({ newProductList }: { newProductList: NewProduct[] }) {
  return (
    <section className='w-full px-4 pb-4 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-screen-md'>
        <h2 className='mb-7 text-center text-2xl font-bold md:text-3xl lg:text-5xl'>New Product</h2>
        {/* 상품 카드 리스트 */}
        <div className='grid grid-cols-2 gap-4'>
          {newProductList.map((product) => (
            <NewProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
