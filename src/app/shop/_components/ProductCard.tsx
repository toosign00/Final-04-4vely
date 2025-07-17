// src/app/shop/components/ProductCard.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Product } from '@/types/product';
import Image from 'next/image';
import BookmarkButton from './BookmarkButton';

interface ProductCardProps {
  product: Product;
  onClick: (id: string) => void;
  isMobile?: boolean;
}

/**
 * 상품 카드 컴포넌트
 * - 반응형 디자인 (모바일/데스크톱)
 * - 상품 이미지, 제목, 가격 표시
 * - NEW 태그 및 북마크 기능
 */
export default function ProductCard({ product, onClick, isMobile = false }: ProductCardProps) {
  // 모바일 레이아웃
  if (isMobile) {
    return (
      <div className='my-6 cursor-pointer gap-x-8 transition-all'>
        <Card className='mb-2 w-full overflow-hidden transition-shadow hover:shadow-md'>
          <div className='relative'>
            {/* 상품 이미지 */}
            <div className='bg-surface relative aspect-square w-full overflow-hidden' onClick={() => onClick(product.id)}>
              <Image src={product.image || '/placeholder-plant.jpg'} alt={product.name} fill className='object-cover' sizes='(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 200px' priority={false} />
            </div>

            {/* NEW 태그 */}
            {product.isNew && <div className='bg-secondary t-h4 absolute top-0 left-0 z-10 rounded-ee-lg px-2 py-1 font-semibold text-white'>NEW</div>}

            {/* 북마크 버튼 */}
            <div className='absolute top-1 right-1'>
              <BookmarkButton productId={product.id} initialBookmarked={product.isBookmarked} size={32} variant='default' />
            </div>
          </div>
        </Card>

        {/* 상품 정보 */}
        <div className='space-y-0.5 text-center' onClick={() => onClick(product.id)}>
          <h3 className='text-secondary t-h2 truncate'>{product.name}</h3>
          <p className='text-secondary t-body'>₩ {product.price.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  // 데스크톱 레이아웃
  return (
    <div className='my-6 w-[280px] cursor-pointer transition-all'>
      <Card className='mb-4 w-full overflow-hidden transition-shadow hover:shadow-md'>
        <div className='relative'>
          {/* 상품 이미지 */}
          <div className='bg-surface relative aspect-square w-full overflow-hidden' onClick={() => onClick(product.id)}>
            <Image src={product.image || '/placeholder-plant.jpg'} alt={product.name} fill className='object-cover' sizes='280px' priority={false} />
          </div>

          {/* NEW 태그 */}
          {product.isNew && <div className='bg-secondary absolute top-0 left-0 z-10 rounded-ee-xl px-3 py-1.5 text-xs font-semibold text-white'>NEW</div>}

          {/* 북마크 버튼 */}
          <div className='absolute top-3 right-3'>
            <BookmarkButton productId={product.id} initialBookmarked={product.isBookmarked} size={32} variant='default' />
          </div>
        </div>
      </Card>

      {/* 상품 정보 */}
      <div className='space-y-1 text-center' onClick={() => onClick(product.id)}>
        <h3 className='text-secondary t-h4 truncate text-base'>{product.name}</h3>
        <p className='text-secondary text-sm font-bold'>₩ {product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
