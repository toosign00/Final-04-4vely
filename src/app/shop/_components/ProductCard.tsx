// src/app/shop/_components/ProductCard.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Product, getProductId, getProductImageUrl, isNewProduct } from '@/types/product.types';
import Image from 'next/image';
import BookmarkButton from '../../../components/ui/BookmarkButton';

interface ProductCardProps {
  product: Product;
  onClick: (id: number) => void;
  isMobile?: boolean;
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

  // 북마크 상태 정보 (서버)
  const myBookmarkId = product.myBookmarkId;

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

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <div
        className='focus-visible:ring-secondary my-6 cursor-pointer justify-items-center gap-x-4 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-x-6'
        onClick={() => onClick(productId)}
        onKeyDown={handleKeyDown}
        role='button'
        tabIndex={0}
        aria-label={`${product.name} 상품, 가격 ${product.price.toLocaleString()}원. 상세 페이지로 이동하려면 엔터 또는 스페이스 키를 누르세요.`}
      >
        <Card className='mb-2 w-full max-w-[130px] min-w-[130px] overflow-hidden transition-shadow hover:shadow-md sm:max-w-[200px] md:max-w-[280px]'>
          <div className='relative w-[130px] sm:w-[200px] md:w-[280px]'>
            {/* 상품 이미지 */}
            <div className='bg-surface relative aspect-square w-full overflow-hidden'>
              <Image src={imageUrl} alt={`${product.name} 상품 이미지`} fill className='object-cover' priority={false} />
            </div>

            {/* NEW 태그 */}
            {isNew && (
              <div className='bg-secondary t-body absolute top-0 left-0 rounded-ee-lg px-2 py-1 font-semibold text-white' aria-label='신상품'>
                NEW
              </div>
            )}

            {/* 북마크 버튼 */}
            <div className='absolute top-1 right-1' onClick={handleBookmarkClick}>
              <BookmarkButton targetId={productId} type='product' myBookmarkId={myBookmarkId} revalidate={false} variant='icon' />
            </div>
          </div>
        </Card>

        {/* 상품 정보 */}
        <div className='space-y-0.5 text-center'>
          <h3 className='text-secondary truncate text-xs font-semibold sm:text-xl md:text-2xl'>{product.name}</h3>
          <p className='text-secondary text-xs sm:text-lg' aria-label={`가격 ${product.price.toLocaleString()}원`}>
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

  // 데스크톱 레이아웃
  return (
    <div
      className='focus-visible:ring-secondary my-6 cursor-pointer justify-items-center rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
      onClick={() => onClick(productId)}
      onKeyDown={handleKeyDown}
      role='button'
      tabIndex={0}
      aria-label={`${product.name} 상품, 가격 ${product.price.toLocaleString()}원. 상세 페이지로 이동하려면 엔터 또는 스페이스 키를 누르세요.`}
    >
      <Card className='mb-4 w-full overflow-hidden transition-shadow hover:shadow-md lg:max-w-[150px] lg:min-w-[150px] xl:max-w-[250px] 2xl:max-w-[250px]'>
        <div className='relative lg:w-[150px] xl:w-[250px] 2xl:w-[250px]'>
          {/* 상품 이미지 */}
          <div className='bg-surface relative aspect-square w-full overflow-hidden'>
            <Image src={imageUrl} alt={`${product.name} 상품 이미지`} fill className='object-cover' priority={false} />
          </div>

          {/* NEW 태그 */}
          {isNew && (
            <div className='bg-secondary absolute top-0 left-0 rounded-ss-2xl rounded-ee-xl px-3 py-1.5 text-xs font-semibold text-white' aria-label='신상품'>
              NEW
            </div>
          )}

          {/* 북마크 버튼 */}
          <div className='absolute top-3 right-3' onClick={handleBookmarkClick}>
            <BookmarkButton targetId={productId} type='product' myBookmarkId={myBookmarkId} revalidate={false} variant='icon' />
          </div>
        </div>
      </Card>

      {/* 상품 정보 */}
      <div className='space-y-1 text-center'>
        <h3 className='text-secondary truncate font-semibold lg:text-sm xl:text-xl 2xl:text-2xl'>{product.name}</h3>
        <p className='text-secondary lg:text-xs xl:text-lg 2xl:text-xl' aria-label={`가격 ${product.price.toLocaleString()}원`}>
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
