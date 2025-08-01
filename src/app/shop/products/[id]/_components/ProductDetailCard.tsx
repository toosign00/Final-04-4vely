// src/app/shop/products/[id]/_components/ProductDetailCard.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Product, getProductId, getProductImageUrl, isNewProduct } from '@/types/product.types';
import Image from 'next/image';
import BookmarkButton from '../../../../../components/ui/BookmarkButton';

interface ProductDetailCardProps {
  product: Product;
  onClick: (id: number) => void;
}

/**
 * 추천 상품 카드 컴포넌트
 * - 상품 상세 페이지 하단 추천 상품 표시
 * - 반응형 디자인 지원
 * - 북마크 기능 포함
 */
export default function ProductDetailCard({ product, onClick }: ProductDetailCardProps) {
  const productId = getProductId(product);
  const imageUrl = getProductImageUrl(product);
  const isNew = isNewProduct(product);

  // 키보드 네비게이션 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(productId);
    }
  };

  // 북마크 버튼 클릭 시 상품 클릭 이벤트 전파 방지
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className='focus-visible:ring-secondary w-full cursor-pointer justify-items-center rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
      onClick={() => onClick(productId)}
      onKeyDown={handleKeyDown}
      role='button'
      tabIndex={0}
      aria-label={`${product.name} 상품, 가격 ${product.price.toLocaleString()}원. 상세 페이지로 이동하려면 엔터 또는 스페이스 키를 누르세요.`}
    >
      <Card className='mb-3 w-full min-w-[140px] overflow-hidden transition-shadow hover:shadow-md md:min-w-[160px]'>
        <div className='relative'>
          {/* 상품 이미지 */}
          <div className='bg-surface relative aspect-square w-full overflow-hidden'>
            <Image src={imageUrl} alt={`${product.name} 상품 이미지`} fill className='object-cover' sizes='(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 280px' priority={false} />
          </div>

          {/* NEW 태그 */}
          {isNew && (
            <div className='bg-secondary absolute top-0 left-0 rounded-ee-lg px-1.5 py-0.5 text-[10px] font-semibold text-white sm:px-2 sm:py-1 sm:text-xs' aria-label='신상품'>
              NEW
            </div>
          )}

          {/* 북마크 버튼 */}
          <div className='absolute top-1 right-1' onClick={handleBookmarkClick}>
            <BookmarkButton targetId={productId} type='product' myBookmarkId={product.myBookmarkId} revalidate={false} variant='icon' />
          </div>
        </div>
      </Card>

      {/* 상품 정보 */}
      <div className='space-y-1 text-center'>
        <h3 className='text-secondary truncate text-xs font-semibold sm:text-xl md:text-2xl lg:text-sm xl:text-xl 2xl:text-2xl'>{product.name}</h3>
        <p className='text-secondary text-xs sm:text-lg lg:text-xs xl:text-lg 2xl:text-xl' aria-label={`가격 ${product.price.toLocaleString()}원`}>
          ₩ {product.price.toLocaleString()}
        </p>
      </div>

      {/* 스크린 리더용 추가 정보 */}
      <span className='sr-only'>
        {isNew ? '신상품 ' : ''}
        {product.name}, {product.price.toLocaleString()}원. 상품 상세 정보를 보려면 엔터 또는 스페이스 키를 누르세요.
      </span>
    </div>
  );
}
