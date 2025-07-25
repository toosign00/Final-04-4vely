// src/app/shop/products/[id]/_components/ProductDetailCard.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Product, getProductId, getProductImageUrl, isNewProduct } from '@/types/product';
import Image from 'next/image';
import BookmarkButton from '../../../_components/BookmarkButton';

interface ProductDetailCardProps {
  product: Product;
  onClick: (id: number) => void;
}

/**
 * 추천 상품 카드 컴포넌트
 * - 상품 상세 페이지 하단 추천 상품 표시
 * - 반응형 디자인 지원
 */
export default function ProductDetailCard({ product, onClick }: ProductDetailCardProps) {
  const productId = getProductId(product);
  const imageUrl = getProductImageUrl(product);
  const isNew = isNewProduct(product);

  return (
    <div className='w-full cursor-pointer justify-items-center transition-all'>
      <Card className='mb-3 w-full min-w-[140px] overflow-hidden transition-shadow hover:shadow-md md:min-w-[160px]'>
        <div className='relative'>
          {/* 상품 이미지 */}
          <div className='bg-surface relative aspect-square w-full overflow-hidden' onClick={() => onClick(productId)}>
            <Image src={imageUrl} alt={product.name} fill className='object-cover' sizes='(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 280px' priority={false} />
          </div>

          {/* NEW 태그 */}
          {isNew && <div className='bg-secondary absolute top-0 left-0 rounded-ee-lg px-1.5 py-0.5 text-[10px] font-semibold text-white sm:px-2 sm:py-1 sm:text-xs'>NEW</div>}

          {/* 북마크 버튼 */}
          <div className='absolute top-1 right-1'>
            <BookmarkButton productId={productId} initialBookmarked={product.isBookmarked} size={32} variant='default' />
          </div>
        </div>
      </Card>

      {/* 상품 정보 */}
      <div className='space-y-1 text-center' onClick={() => onClick(productId)}>
        <h3 className='text-secondary truncate text-xs font-semibold sm:text-xl md:text-2xl lg:text-sm xl:text-xl 2xl:text-2xl'>{product.name}</h3>
        <p className='text-secondary text-xs sm:text-lg lg:text-xs xl:text-lg 2xl:text-xl'>₩ {product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
