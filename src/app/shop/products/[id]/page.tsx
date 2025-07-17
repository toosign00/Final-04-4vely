// src/app/shop/products/[id]/page.tsx
'use client';

import BookmarkButton from '@/app/shop/_components/BookmarkButton';
import { Badge } from '@/app/shop/products/[id]/_components/Badge';
import ProductDetailCard from '@/app/shop/products/[id]/_components/ProductDetailCard';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { Product } from '@/types/product';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/* TYPES & CONSTANTS */
interface ColorOption {
  value: string;
  label: string;
  color: string;
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  date: string;
  rating: number;
  content: string;
}

// 화분 색상 옵션 상수
const COLOR_OPTIONS: ColorOption[] = [
  { value: 'brown', label: '브라운', color: '#8B4513' },
  { value: 'blue', label: '블루', color: '#4169E1' },
  { value: 'black', label: '블랙', color: '#000000' },
  { value: 'gray', label: '그레이', color: '#808080' },
  { value: 'white', label: '화이트', color: '#FFFFFF' },
];

// 페이지네이션 설정
const REVIEWS_PER_PAGE = 2;

/**
 * 상품 상세 페이지
 * - 상품 정보 표시 및 구매/장바구니 기능
 * - 색상 선택 및 수량 조절
 * - 리뷰 목록 및 페이지네이션
 * - 추천 상품 표시
 * - 반응형 디자인 (모바일/태블릿/데스크톱)
 */
export default function ProductDetailPage({ params: { id } }: { params: { id: string } }) {
  const router = useRouter();

  // 상태 관리
  const [selectedColor, setSelectedColor] = useState('brown');
  const [quantity, setQuantity] = useState(1);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // 목업 상품 데이터 (추후 API 연동)
  const product: Product & { tags?: string[] } = {
    id,
    name: '호야 하트',
    image: '/images/calathea_conkina_freddie.webp',
    price: 18_000,
    category: '다육식물',
    size: 'small',
    difficulty: 'easy',
    light: 'medium',
    space: 'indoor',
    season: 'spring',
    isNew: true,
    isBookmarked: false,
    recommend: true,
    tags: ['신상품', '태그 2', '태그 3'],
  };

  // 목업 리뷰 데이터 (임시로 총 10개, 페이지당 2개)
  const reviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
    id: `${i + 1}`,
    userName: `사용자${i + 1}`,
    userAvatar: '/avatar1.jpg',
    date: `2025.07.${`${10 + i}`.padStart(2, '0')}`,
    rating: (i % 5) + 1,
    content:
      '리뷰 내용\n' +
      '------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n'.repeat(
        2,
      ) +
      '리뷰 내용',
  }));

  // 추천 상품 목업 데이터
  const recommendProducts: Product[] = [
    {
      id: '2',
      name: '모종삽',
      image: '/images/acadia_palenopsis_orchid.webp',
      price: 5_000,
      category: '원예용품',
      size: 'small',
      difficulty: 'easy',
      light: 'medium',
      space: 'indoor',
      season: 'spring',
      isNew: false,
      isBookmarked: false,
      recommend: true,
    },
    {
      id: '3',
      name: '상품명',
      image: '/images/baby_gomu.webp',
      price: 15_000,
      category: '관엽식물',
      size: 'small',
      difficulty: 'easy',
      light: 'medium',
      space: 'indoor',
      season: 'spring',
      isNew: false,
      isBookmarked: false,
      recommend: true,
    },
    {
      id: '4',
      name: '상품명',
      image: '/images/aglaonema_siam_black.webp',
      price: 25_000,
      category: '다육식물',
      size: 'small',
      difficulty: 'easy',
      light: 'medium',
      space: 'indoor',
      season: 'spring',
      isNew: false,
      isBookmarked: false,
      recommend: true,
    },
    {
      id: '5',
      name: '상품명',
      image: '/images/baltic_blue_pothos_black.webp',
      price: 25_000,
      category: 'asdf',
      size: 'small',
      difficulty: 'easy',
      light: 'medium',
      space: 'indoor',
      season: 'spring',
      isNew: false,
      isBookmarked: false,
      recommend: true,
    },
  ];

  /* EVENT HANDLERS */

  // 수량 변경 핸들러
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // 장바구니 추가 핸들러
  const handleAddToCart = () => {
    console.log('장바구니 추가:', { productId: product.id, color: selectedColor, quantity });
    setIsCartModalOpen(true);
  };

  // 장바구니 페이지로 이동
  const handleGoToCart = () => {
    setIsCartModalOpen(false);
    router.push('/cart');
  };

  // 모달 닫기 (현재 페이지 유지)
  const handleStayOnPage = () => {
    setIsCartModalOpen(false);
  };

  // 바로 구매 핸들러
  const handlePurchase = () => {
    console.log('바로 구매:', { productId: product.id, color: selectedColor, quantity });
    router.push('/order');
  };

  // 추천 상품 클릭 핸들러
  const handleProductClick = (id: string) => {
    router.push(`/shop/products/${id}`);
  };

  // 리뷰 수정 핸들러 (추후 구현)
  const handleEditReview = (reviewId: string) => {
    console.log('리뷰 수정:', reviewId);
    // TODO: 리뷰 수정 모달 또는 페이지로 이동
  };

  // 리뷰 삭제 핸들러 (추후 구현)
  const handleDeleteReview = (reviewId: string) => {
    console.log('리뷰 삭제:', reviewId);
    // TODO: 삭제 확인 모달 표시
  };

  /* COMPUTED VALUES */

  // 리뷰 페이지네이션 계산
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = reviews.slice((currentReviewPage - 1) * REVIEWS_PER_PAGE, currentReviewPage * REVIEWS_PER_PAGE);

  // 총 가격 계산
  const totalPrice = product.price * quantity;

  /* RENDER HELPERS */

  // 리뷰 페이지네이션 렌더링
  const renderReviewPagination = () => (
    <Pagination className='mt-4 mb-6 lg:mt-0'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => setCurrentReviewPage((prev) => Math.max(1, prev - 1))} className={`cursor-pointer ${currentReviewPage === 1 ? 'pointer-events-none opacity-50' : ''}`} aria-label='이전 페이지' />
        </PaginationItem>

        {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink onClick={() => setCurrentReviewPage(pageNumber)} isActive={pageNumber === currentReviewPage} className='cursor-pointer'>
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext onClick={() => setCurrentReviewPage((prev) => Math.min(totalReviewPages, prev + 1))} className={`cursor-pointer ${currentReviewPage === totalReviewPages ? 'pointer-events-none opacity-50' : ''}`} aria-label='다음 페이지' />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  // 장바구니 확인 모달 렌더링
  const renderCartModal = () => (
    <Dialog open={isCartModalOpen} onOpenChange={setIsCartModalOpen}>
      <DialogContent className='p-8 sm:max-w-lg lg:max-w-xl' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-center gap-2 t-h3'>
            <ShoppingCart size={24} />
            상품이 장바구니에 추가되었습니다.
          </DialogTitle>
          <DialogDescription className='mt-4 text-center t-h4'>장바구니 페이지로 이동하시겠습니까?</DialogDescription>
        </DialogHeader>

        <DialogFooter className='mt-6 flex gap-3'>
          <Button variant='primary' onClick={handleGoToCart} className='bg-primary hover:bg-primary/90 flex-1 py-3 text-base font-medium text-white'>
            예
          </Button>
          <Button variant='default' onClick={handleStayOnPage} className='flex-1 py-3 text-base font-medium'>
            아니오
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  /* JSX RENDER */
  return (
    <div className='bg-surface min-h-screen'>
      {/* 장바구니 확인 모달 */}
      {renderCartModal()}

      {/* 모바일/태블릿 레이아웃 */}
      <div className='lg:hidden'>
        {/* 상품 이미지 섹션 */}
        <div className='relative mx-4 mt-4 aspect-square w-auto rounded-2xl bg-white sm:mx-6 sm:mt-6 md:mx-8 md:mt-8'>
          <Image src={product.image || '/images/calathea_conkina_freddie.webp'} alt={product.name} fill className='rounded-2xl object-cover' priority />

          {/* NEW 태그 */}
          {product.isNew && (
            <div className='absolute top-0 left-0'>
              <div className='bg-secondary t-h4 rounded-ss-2xl rounded-ee-2xl px-3 py-2 text-white sm:px-4 sm:py-2 md:px-5 md:py-3'>NEW</div>
            </div>
          )}

          {/* 북마크 버튼 */}
          <div className='absolute top-3 right-3 sm:top-4 sm:right-4'>
            <BookmarkButton productId={product.id} initialBookmarked={product.isBookmarked} size={32} variant='default' className='sm:scale-110 md:scale-125' />
          </div>
        </div>

        {/* 상품 정보 섹션 */}
        <div className='mx-4 mt-6 w-auto sm:mx-6 sm:mt-8 md:mx-8'>
          {/* 상품명 */}
          <h1 className='text-secondary t-h1 mb-4'>{product.name}</h1>

          {/* 태그 목록 */}
          <div className='mb-12 flex flex-wrap gap-2 sm:mb-8 sm:gap-3'>
            {product.tags?.map((tag) => (
              <Badge key={tag} variant='default' className='t-desc md:t-body border-1 border-gray-300 px-3 py-1 sm:px-4 sm:py-1.5'>
                {tag}
              </Badge>
            ))}
          </div>

          {/* 화분 색상 선택 */}
          <h3 className='text-secondary t-h3 mb-3 sm:mb-4'>화분 색상</h3>
          <div className='mb-12 flex gap-3 sm:gap-4'>
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type='button'
                aria-label={option.label}
                onClick={() => setSelectedColor(option.value)}
                className={`h-8 w-8 rounded-full border-2 transition sm:h-9 sm:w-9 md:h-10 md:w-10 ${
                  selectedColor === option.value ? 'border-secondary scale-110 border-3' : 'border-gray-300'
                } ${option.value === 'white' ? 'ring-1 ring-gray-200' : ''}`}
                style={{ backgroundColor: option.color }}
              />
            ))}
          </div>

          {/* 수량 선택 및 가격 */}
          <div className='mb-8 flex items-center justify-between sm:mb-10'>
            {/* 수량 선택 */}
            <div className='flex items-center gap-3 rounded-4xl border-1 border-gray-300 bg-white p-2 sm:gap-4'>
              <Button variant='ghost' size='icon' disabled={quantity <= 1} onClick={() => handleQuantityChange(-1)} className='h-6 w-6 hover:bg-transparent active:bg-transparent sm:h-8 sm:w-8' aria-label='수량 감소'>
                <Minus size={18} className='sm:size-5' />
              </Button>

              <span className='text-secondary min-w-[50px] text-center text-sm font-medium sm:min-w-[60px] sm:text-base'>{quantity}</span>

              <Button variant='ghost' size='icon' onClick={() => handleQuantityChange(1)} className='h-6 w-6 hover:bg-transparent active:bg-transparent sm:h-8 sm:w-8' aria-label='수량 증가'>
                <Plus size={18} className='sm:size-5' />
              </Button>
            </div>

            {/* 총 가격 */}
            <p className='text-secondary text-lg font-semibold sm:text-xl'>₩ {totalPrice.toLocaleString()}</p>
          </div>

          {/* 액션 버튼 */}
          <div className='mb-10 flex gap-3 sm:mb-12 sm:gap-4'>
            <Button onClick={handleAddToCart} variant='default' className='t-h4 sm:t-h3 h-10 flex-1 sm:h-12'>
              장바구니
            </Button>
            <Button onClick={handlePurchase} variant='primary' className='t-h4 sm:t-h3 h-10 flex-1 sm:h-12'>
              구매하기
            </Button>
          </div>

          {/* 상품 설명 */}
          <section className='mb-8 border-y border-gray-300 py-8 sm:mb-10 sm:py-10 md:mb-12 md:py-12'>
            <h2 className='text-secondary t-h2 sm:t-h1 mb-4 sm:mb-5'>Description</h2>
            <div className='text-secondary t-body sm:t-h4 space-y-3 sm:space-y-4'>
              <p>( 상품 설명 ) 동남아시아의 호아 플종인 호야 하트는 …</p>
              <p>사람스러운 하트 모양의 잎과 …</p>
              <p>밝은 간접 햇빛에서 잘 자라고 …</p>
              <p>입금전 호아와 달리 …</p>
            </div>
          </section>

          {/* 리뷰 섹션 */}
          <section className='mb-10 sm:mb-12 md:mb-14'>
            <h2 className='text-secondary t-h2 sm:t-h1 mb-4 sm:mb-5'>Review</h2>

            {paginatedReviews.map((review) => (
              <div key={review.id} className='mb-6 pb-6 sm:mb-8 sm:pb-8'>
                <div className='mb-3 flex items-center gap-3 sm:gap-4'>
                  <div className='bg-secondary h-8 w-8 rounded-full sm:h-9 sm:w-9' />
                  <p className='text-secondary t-h4 sm:t-h3 flex-1'>{review.userName}</p>

                  {/* 날짜 및 액션 버튼 */}
                  <div className='flex items-center'>
                    <span className='text-secondary t-h4'>{review.date}</span>

                    {/* 수정/삭제 버튼 */}
                    <div className='flex pl-3'>
                      <Button variant='ghost' size='sm' onClick={() => handleEditReview(review.id)} className='h-6 px-2 py-1 sm:h-7 sm:px-2.5 sm:text-sm'>
                        수정
                      </Button>
                      <span className='text-xs text-gray-300 sm:text-sm'>·</span>
                      <Button variant='ghost' size='sm' onClick={() => handleDeleteReview(review.id)} className='text-error h-6 px-2 py-1 sm:h-7 sm:px-2.5 sm:text-sm'>
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>

                <p className='text-secondary t-desc sm:t-body whitespace-pre-line'>{review.content}</p>
              </div>
            ))}

            {/* 리뷰 페이지네이션 */}
            {totalReviewPages > 1 && renderReviewPagination()}
          </section>

          {/* 추천 상품 */}
          <section className='border-t-1 border-gray-300 pt-8 pb-8 sm:pb-10 md:pb-12'>
            <h2 className='text-secondary t-h2 sm:t-h1 mb-4 sm:mb-5'>Recommend</h2>
            <div className='grid grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
              {recommendProducts.slice(0, 2).map((product) => (
                <ProductDetailCard key={product.id} product={product} onClick={handleProductClick} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 데스크톱 레이아웃 */}
      <div className='hidden lg:block'>
        <div className='mx-auto my-12 max-w-3/4'>
          {/* 상품 이미지 및 정보 섹션 */}
          <div className='mb-24 flex gap-12 xl:gap-20'>
            {/* 상품 이미지 */}
            <div className='relative aspect-square w-full max-w-[800px] min-w-[280px] flex-1'>
              <Image src={product.image || '/images/calathea_conkina_freddie.webp'} alt={product.name} fill className='rounded-2xl object-cover' priority />

              {/* NEW 태그 */}
              {product.isNew && <div className='bg-secondary t-h3 absolute top-0 left-0 rounded-ss-2xl rounded-ee-2xl px-6 py-3 text-white'>NEW</div>}

              {/* 북마크 버튼 */}
              <div className='absolute top-4 right-4'>
                <BookmarkButton productId={product.id} initialBookmarked={product.isBookmarked} size={48} variant='default' />
              </div>
            </div>

            {/* 상품 정보 */}
            <div className='w-full min-w-[280px] flex-1'>
              <h1 className='text-secondary mb-6 text-3xl font-bold xl:text-4xl 2xl:text-5xl'>{product.name}</h1>

              {/* 태그 */}
              <div className='mb-8 flex flex-wrap gap-3 xl:mb-10'>
                {product.tags?.map((tag) => (
                  <Badge key={tag} variant='default' className='border-1 border-gray-300 px-3 py-1.5 text-sm xl:px-4 xl:py-2 xl:text-base'>
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* 화분 색상 */}
              <h3 className='text-secondary t-h2 mb-3 xl:mb-4 xl:text-xl'>화분 색상</h3>
              <div className='mb-8 flex gap-3 xl:mb-10 xl:gap-4'>
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    aria-label={option.label}
                    onClick={() => setSelectedColor(option.value)}
                    className={`h-10 w-10 rounded-full border-2 transition xl:h-12 xl:w-12 ${selectedColor === option.value ? 'border-secondary scale-110 border-4' : 'border-gray-300'} ${option.value === 'white' ? 'ring-1 ring-gray-200' : ''}`}
                    style={{ backgroundColor: option.color }}
                  />
                ))}
              </div>

              {/* 수량 선택 */}
              <div className='mb-10 flex items-center justify-between xl:mb-12'>
                <div className='flex items-center gap-3 rounded-4xl border-1 border-gray-300 bg-white p-2 xl:gap-4'>
                  <Button variant='ghost' size='icon' disabled={quantity <= 1} onClick={() => handleQuantityChange(-1)} className='hover:bg-transparent active:bg-transparent xl:h-10 xl:w-10'>
                    <Minus size={18} className='xl:size-5' />
                  </Button>

                  <span className='text-secondary min-w-[50px] text-center text-lg font-medium xl:min-w-[60px] xl:text-xl'>{quantity}</span>

                  <Button variant='ghost' size='icon' onClick={() => handleQuantityChange(1)} className='hover:bg-transparent active:bg-transparent xl:h-10 xl:w-10'>
                    <Plus size={18} className='xl:size-5' />
                  </Button>
                </div>

                <p className='text-secondary t-h2'>₩ {totalPrice.toLocaleString()}</p>
              </div>

              {/* 액션 버튼 */}
              <div className='flex gap-4 xl:gap-6'>
                <Button onClick={handleAddToCart} variant='default' size='lg' className='t-h3 flex-1 p-8'>
                  장바구니
                </Button>
                <Button onClick={handlePurchase} variant='primary' size='lg' className='t-h3 flex-1 p-8'>
                  구매하기
                </Button>
              </div>
            </div>
          </div>

          {/* 상품 설명 */}
          <section className='mb-10 border-y border-gray-300 py-8 xl:py-10'>
            <h2 className='text-secondary t-h1 mb-6 xl:mb-8 xl:text-3xl'>Description</h2>
            <div className='text-secondary t-h3 space-y-4 xl:space-y-6'>
              <p>( 상품 설명 ) 칼라테아 프레디는 칼라테아의 작은 품종으로, 잎이 식물 중앙에서 로제트 모양으로 자랍니다.</p>
              <p>섬세하고 물결치는 깃털 모양의 잎은 연녹색에 짙은 녹색 줄무늬가 있습니다.</p>
              <p>낮에는 잎이 중앙에서 바깥쪽으로 벌어지고, 저녁에는 기도하는 손처럼 오므라들어 [기도하는 식물]이라는 별명이 붙었습니다.</p>
            </div>
          </section>

          {/* 리뷰 섹션 */}
          <section className='mb-8'>
            <h2 className='text-secondary t-h1 mb-6 xl:mb-8'>Review</h2>

            {paginatedReviews.map((review) => (
              <div key={review.id} className='mb-8 pb-8 xl:mb-10 xl:pb-10'>
                <div className='mb-3 flex items-center gap-3 xl:mb-4 xl:gap-4'>
                  <div className='bg-secondary h-10 w-10 rounded-full xl:h-12 xl:w-12' />
                  <p className='text-secondary t-h4 flex-1'>{review.userName}</p>

                  {/* 날짜 및 액션 */}
                  <div className='flex items-center'>
                    <span className='t-h4'>{review.date}</span>

                    <div className='flex items-center pl-4'>
                      <Button variant='ghost' size='sm' onClick={() => handleEditReview(review.id)} className='h-8 px-3 py-1.5'>
                        수정
                      </Button>
                      <span className='text-gray-300'>·</span>
                      <Button variant='ghost' size='sm' onClick={() => handleDeleteReview(review.id)} className='text-error h-8 px-3 py-1.5'>
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>

                <p className='text-secondary t-body whitespace-pre-line'>{review.content}</p>
              </div>
            ))}

            {totalReviewPages > 1 && renderReviewPagination()}
          </section>

          {/* 추천 상품 */}
          <section className='border-t-1 border-gray-300 pt-8'>
            <h2 className='text-secondary t-h1 mb-6 xl:mb-8'>Recommend</h2>
            <div className='grid grid-cols-4 gap-6 xl:gap-8'>
              {recommendProducts.map((product) => (
                <ProductDetailCard key={product.id} product={product} onClick={handleProductClick} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
