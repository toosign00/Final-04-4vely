// src/app/shop/_components/ProductCard.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Product, getProductId, getProductImageUrl, isNewProduct } from '@/types/product';
import Image from 'next/image';
import BookmarkButton from './BookmarkButton';

interface ProductCardProps {
  product: Product;
  onClick: (id: number) => void;
  isMobile?: boolean;
  // 🔥 onBookmarkChange 콜백 제거 - 상품 상세 페이지처럼 단순화
}

/**
 * 상품 카드 컴포넌트
 * - 반응형 디자인 (모바일/데스크톱)
 * - 상품 이미지, 제목, 가격 표시
 * - NEW 태그 및 북마크 기능
 * - 상품 상세 페이지와 동일한 북마크 처리 방식 적용
 */
export default function ProductCard({ product, onClick, isMobile = false }: ProductCardProps) {
  const productId = getProductId(product);
  const imageUrl = getProductImageUrl(product);
  const isNew = isNewProduct(product);

  // 북마크 상태 정보 (서버에서 전달받은 정보)
  const myBookmarkId = product.myBookmarkId;
  const isCurrentlyBookmarked = !!myBookmarkId;

  console.log(`[ProductCard] 상품 ${productId} 렌더링:`, {
    상품명: product.name,
    myBookmarkId,
    isCurrentlyBookmarked,
    전체상품데이터: {
      _id: product._id,
      name: product.name,
      myBookmarkId: product.myBookmarkId,
      isBookmarked: product.isBookmarked,
    },
  });

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <div className='my-6 cursor-pointer justify-items-center gap-x-4 transition-all sm:gap-x-6'>
        <Card className='mb-2 w-full max-w-[130px] min-w-[130px] overflow-hidden transition-shadow hover:shadow-md sm:max-w-[200px] md:max-w-[280px]'>
          <div className='relative w-[130px] sm:w-[200px] md:w-[280px]'>
            {/* 상품 이미지 */}
            <div className='bg-surface relative aspect-square w-full overflow-hidden' onClick={() => onClick(productId)}>
              <Image src={imageUrl} alt={product.name} fill className='object-cover' priority={false} />
            </div>

            {/* NEW 태그 */}
            {isNew && <div className='bg-secondary t-body absolute top-0 left-0 rounded-ee-lg px-2 py-1 font-semibold text-white'>NEW</div>}

            {/* 🔥 북마크 버튼 - 상품 상세처럼 콜백 제거 */}
            <div className='absolute top-1 right-1'>
              <BookmarkButton productId={productId} myBookmarkId={myBookmarkId} size={32} />
            </div>
          </div>
        </Card>

        {/* 상품 정보 */}
        <div className='space-y-0.5 text-center' onClick={() => onClick(productId)}>
          <h3 className='text-secondary truncate text-xs font-semibold sm:text-xl md:text-2xl'>{product.name}</h3>
          <p className='text-secondary text-xs sm:text-lg'>₩ {product.price.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  // 데스크톱 레이아웃
  return (
    <div className='my-6 cursor-pointer justify-items-center transition-all'>
      <Card className='mb-4 w-full overflow-hidden transition-shadow hover:shadow-md lg:max-w-[150px] lg:min-w-[150px] xl:max-w-[250px] 2xl:max-w-[250px]'>
        <div className='relative lg:w-[150px] xl:w-[250px] 2xl:w-[250px]'>
          {/* 상품 이미지 */}
          <div className='bg-surface relative aspect-square w-full overflow-hidden' onClick={() => onClick(productId)}>
            <Image src={imageUrl} alt={product.name} fill className='object-cover' priority={false} />
          </div>

          {/* NEW 태그 */}
          {isNew && <div className='bg-secondary absolute top-0 left-0 z-1 rounded-ss-2xl rounded-ee-xl px-3 py-1.5 text-xs font-semibold text-white'>NEW</div>}

          {/* 🔥 북마크 버튼 - 상품 상세처럼 콜백 제거 */}
          <div className='absolute top-3 right-3'>
            <BookmarkButton productId={productId} myBookmarkId={myBookmarkId} size={32} />
          </div>
        </div>
      </Card>

      {/* 상품 정보 */}
      <div className='space-y-1 text-center' onClick={() => onClick(productId)}>
        <h3 className='text-secondary truncate font-semibold lg:text-sm xl:text-xl 2xl:text-2xl'>{product.name}</h3>
        <p className='text-secondary lg:text-xs xl:text-lg 2xl:text-xl'>₩ {product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
