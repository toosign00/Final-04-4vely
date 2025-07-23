// src/app/shop/products/[id]/_components/ProductDetailClient.tsx (client 컴포넌트)
'use client';

import BookmarkButton from '@/app/shop/_components/BookmarkButton';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/Pagination';
import { getProductReviewsTransformed } from '@/lib/functions/market';
import { Product, ProductDetail, Review } from '@/types/product';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from './Badge';
import ProductDetailCard from './ProductDetailCard';

interface ColorOption {
  value: string;
  label: string;
  color: string;
}

interface ProductDetailClientProps {
  product: ProductDetail;
  recommendProducts: Product[];
  initialReviews: Review[];
  initialReviewsPagination: { total: number; totalPages: number };
  productId: string;
}

// 한국어 색상명을 영어로 매핑하는 함수
const getColorMapping = (koreanColor: string): { englishName: string; hexColor: string } => {
  const colorMap: Record<string, { englishName: string; hexColor: string }> = {
    흑색: { englishName: 'black', hexColor: '#000000' },
    갈색: { englishName: 'brown', hexColor: '#8B4513' },
    회색: { englishName: 'gray', hexColor: '#808080' },
    흰색: { englishName: 'white', hexColor: '#FFFFFF' },
    남색: { englishName: 'blue', hexColor: '#4169E1' },
  };

  return colorMap[koreanColor] || { englishName: koreanColor.toLowerCase(), hexColor: '#808080' };
};

export default function ProductDetailClient({ product, recommendProducts, initialReviews, initialReviewsPagination, productId }: ProductDetailClientProps) {
  const router = useRouter();

  // 상품의 화분 색상 옵션 추출
  const potColorOption = useMemo(() => {
    return product.options?.find((option) => option.name === '화분 색상');
  }, [product.options]);

  // 색상 옵션이 있는지 확인
  const hasColorOptions = Boolean(potColorOption?.values && potColorOption.values.length > 0);

  // 동적 색상 옵션 생성
  const colorOptions: ColorOption[] = useMemo(() => {
    if (!hasColorOptions) return [];

    return potColorOption!.values.map((koreanColor) => {
      const { englishName, hexColor } = getColorMapping(koreanColor);
      return {
        value: englishName,
        label: koreanColor,
        color: hexColor,
      };
    });
  }, [potColorOption, hasColorOptions]);

  // 선택된 색상 상태 (첫 번째 색상을 기본값으로)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  // 리뷰 관련 상태
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [reviewsPagination, setReviewsPagination] = useState(initialReviewsPagination);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // 현재 선택된 색상에 해당하는 이미지 URL 계산
  const currentImageUrl = useMemo(() => {
    if (!hasColorOptions || !product.mainImages || product.mainImages.length === 0) {
      return product.image; // 기본 이미지 사용
    }

    // 선택된 색상 인덱스에 해당하는 이미지가 있으면 사용, 없으면 첫 번째 이미지 사용
    const imageIndex = Math.min(selectedColorIndex, product.mainImages.length - 1);
    return product.mainImages[imageIndex] || product.image;
  }, [hasColorOptions, product.mainImages, product.image, selectedColorIndex]);

  // 리뷰 데이터 로딩 (페이지 변경 시)
  useEffect(() => {
    if (currentReviewPage === 1) {
      setReviews(initialReviews);
      setReviewsPagination(initialReviewsPagination);
      return;
    }

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);

        const { reviews: transformedReviews, pagination } = await getProductReviewsTransformed(parseInt(productId), {
          page: currentReviewPage,
          limit: 2,
        });

        setReviews(transformedReviews);
        setReviewsPagination(pagination);
      } catch (err) {
        console.warn('리뷰 로딩 실패:', err);
        setReviews([]);
        setReviewsPagination({ total: 0, totalPages: 0 });
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [currentReviewPage, productId, initialReviews, initialReviewsPagination]);

  // 이벤트 핸들러들
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleColorChange = (colorIndex: number) => {
    setSelectedColorIndex(colorIndex);
  };

  const handleAddToCart = () => {
    // TODO: 선택된 색상 정보도 함께 장바구니에 추가
    const selectedColorInfo = hasColorOptions
      ? {
          colorIndex: selectedColorIndex,
          colorName: colorOptions[selectedColorIndex]?.label,
        }
      : null;

    console.log('장바구니에 추가:', {
      productId: product.id,
      quantity,
      selectedColor: selectedColorInfo,
    });

    setIsCartModalOpen(true);
  };

  const handleGoToCart = () => {
    setIsCartModalOpen(false);
    router.push('/cart');
  };

  const handleStayOnPage = () => {
    setIsCartModalOpen(false);
  };

  const handlePurchase = () => {
    // TODO: 선택된 색상 정보도 함께 주문에 포함
    const selectedColorInfo = hasColorOptions
      ? {
          colorIndex: selectedColorIndex,
          colorName: colorOptions[selectedColorIndex]?.label,
        }
      : null;

    console.log('구매하기:', {
      productId: product.id,
      quantity,
      selectedColor: selectedColorInfo,
    });

    setTimeout(() => {
      router.push('/order');
    }, 100);
  };

  const handleProductClick = (id: string) => {
    router.push(`/shop/products/${id}`);
  };

  const handleEditReview = (reviewId: string) => {
    console.log('리뷰 수정:', reviewId);
    // TODO: 리뷰 수정 모달로 이동
  };

  const handleDeleteReview = (reviewId: string) => {
    console.log('리뷰 삭제:', reviewId);
    // TODO: 리뷰 삭제 확인 모달 및 API 호출
  };

  // 계산된 값
  const totalPrice = product.price * quantity;
  const totalReviewPages = reviewsPagination.totalPages;

  // 리뷰 페이지네이션 렌더링
  const renderReviewPagination = () => (
    <Pagination className='mt-4 mb-6 lg:mt-0'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => setCurrentReviewPage((prev) => Math.max(1, prev - 1))} className={`cursor-pointer ${currentReviewPage === 1 ? 'pointer-events-none opacity-50' : ''}`} />
        </PaginationItem>

        {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink onClick={() => setCurrentReviewPage(pageNumber)} isActive={pageNumber === currentReviewPage} className='cursor-pointer'>
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext onClick={() => setCurrentReviewPage((prev) => Math.min(totalReviewPages, prev + 1))} className={`cursor-pointer ${currentReviewPage === totalReviewPages ? 'pointer-events-none opacity-50' : ''}`} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <>
      {/* 장바구니 확인 모달 */}
      <Dialog open={isCartModalOpen} onOpenChange={setIsCartModalOpen}>
        <DialogContent className='p-8 sm:max-w-lg lg:max-w-xl' showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className='t-h3 flex items-center justify-center gap-2'>
              <ShoppingCart size={24} />
              상품이 장바구니에 추가되었습니다.
            </DialogTitle>
            <DialogDescription className='t-h4 mt-4 text-center'>장바구니 페이지로 이동하시겠습니까?</DialogDescription>
          </DialogHeader>

          <DialogFooter className='mt-6 flex gap-3'>
            <Button variant='primary' onClick={handleGoToCart} className='t-h3 flex-1 py-3'>
              예
            </Button>
            <Button variant='default' onClick={handleStayOnPage} className='t-h3 flex-1 py-3'>
              아니오
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 모바일/태블릿 레이아웃 */}
      <div className='lg:hidden'>
        {/* 상품 이미지 섹션 */}
        <div className='relative mx-4 mt-4 aspect-square w-auto rounded-2xl bg-white sm:mx-6 sm:mt-6 md:mx-8 md:mt-8'>
          <Image
            src={currentImageUrl}
            alt={`${product.name}${hasColorOptions ? ` - ${colorOptions[selectedColorIndex]?.label}` : ''}`}
            fill
            className='rounded-2xl object-cover'
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-plant.jpg';
            }}
          />

          {/* NEW 태그 */}
          {product.isNew && (
            <div className='absolute top-0 left-0 z-1'>
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
          <div className='mb-4'>
            <h1 className='text-secondary t-h1 mb-4'>{product.name}</h1>
          </div>

          {/* 태그 목록 */}
          <div className='mb-12 flex flex-wrap gap-2 sm:mb-8 sm:gap-3'>
            {product.tags?.map((tag) => (
              <Badge key={tag} variant='default' className='t-desc md:t-body border-1 border-gray-300 px-3 py-1 sm:px-4 sm:py-1.5'>
                {tag}
              </Badge>
            ))}
          </div>

          {/* 화분 색상 선택 (옵션이 있는 경우에만 표시) */}
          {hasColorOptions && colorOptions.length > 0 && (
            <>
              <h3 className='text-secondary t-h3 mb-3 sm:mb-4'>화분 색상</h3>
              <div className='mb-12 flex gap-3 sm:gap-4'>
                {colorOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type='button'
                    aria-label={option.label}
                    onClick={() => handleColorChange(index)}
                    className={`h-8 w-8 rounded-full border-2 transition sm:h-9 sm:w-9 md:h-10 md:w-10 ${
                      selectedColorIndex === index ? 'border-secondary scale-110 border-3' : 'border-gray-300'
                    } ${option.value === 'white' ? 'ring-1 ring-gray-200' : ''}`}
                    style={{ backgroundColor: option.color }}
                  />
                ))}
              </div>
            </>
          )}

          {/* 수량 선택 및 가격 */}
          <div className='mb-8 flex items-center justify-between sm:mb-10'>
            {/* 수량 선택 */}
            <div className='flex items-center gap-3 rounded-4xl border-1 border-gray-300 bg-white p-2 sm:gap-4'>
              <Button variant='ghost' size='icon' disabled={quantity <= 1} onClick={() => handleQuantityChange(-1)} className='h-6 w-6 hover:bg-transparent active:bg-transparent sm:h-8 sm:w-8'>
                <Minus size={18} className='sm:size-5' />
              </Button>

              <span className='text-secondary t-h4 min-w-[50px] text-center sm:min-w-[60px] sm:text-base'>{quantity}</span>

              <Button variant='ghost' size='icon' onClick={() => handleQuantityChange(1)} className='h-6 w-6 hover:bg-transparent active:bg-transparent sm:h-8 sm:w-8'>
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
            <div className='text-secondary t-body sm:t-h4 space-y-3 sm:space-y-4'>{product.content ? <div dangerouslySetInnerHTML={{ __html: product.content }} /> : <p>상품 설명이 없습니다.</p>}</div>
          </section>

          {/* 리뷰 섹션 */}
          <section className='mb-10 sm:mb-12 md:mb-14'>
            <h2 className='text-secondary t-h2 sm:t-h1 mb-4 sm:mb-5'>Review {reviewsPagination.total > 0 && `(${reviewsPagination.total})`}</h2>

            {reviewsLoading ? (
              <div className='py-8 text-center'>
                <div className='mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-gray-600' />
                <p className='text-sm text-gray-600'>리뷰를 불러오는 중...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className='py-8 text-center'>
                <p className='text-gray-600'>아직 리뷰가 없습니다.</p>
              </div>
            ) : (
              <>
                {reviews.map((review) => (
                  <div key={review.id} className='mb-6 pb-6 sm:mb-8 sm:pb-8'>
                    <div className='mb-3 flex items-center gap-3 sm:gap-4'>
                      <div className='bg-secondary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white sm:h-9 sm:w-9'>{review.userName.charAt(0)}</div>
                      <p className='text-secondary t-h4 sm:t-h3 flex-1'>{review.userName}</p>

                      <div className='flex items-center'>
                        <span className='text-secondary t-h4'>{review.date}</span>

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

                {totalReviewPages > 1 && renderReviewPagination()}
              </>
            )}
          </section>

          {/* 추천 상품 */}
          <section className='border-t-1 border-gray-300 pt-8 pb-8 sm:pb-10 md:pb-12'>
            <h2 className='text-secondary t-h2 sm:t-h1 mb-4 sm:mb-5'>Recommend</h2>
            {recommendProducts.length === 0 ? (
              <div className='py-8 text-center'>
                <p className='text-gray-600'>추천 상품이 없습니다.</p>
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
                {recommendProducts.slice(0, 2).map((product) => (
                  <ProductDetailCard key={product.id} product={product} onClick={handleProductClick} />
                ))}
              </div>
            )}
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
              <Image
                src={currentImageUrl}
                alt={`${product.name}${hasColorOptions ? ` - ${colorOptions[selectedColorIndex]?.label}` : ''}`}
                fill
                className='rounded-2xl object-cover'
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-plant.jpg';
                }}
              />

              {/* NEW 태그 */}
              {product.isNew && <div className='bg-secondary t-h3 absolute top-0 left-0 z-1 rounded-ss-2xl rounded-ee-2xl px-6 py-3 text-white'>NEW</div>}

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

              {/* 화분 색상 (옵션이 있는 경우에만 표시) */}
              {hasColorOptions && colorOptions.length > 0 && (
                <>
                  <h3 className='text-secondary t-h2 mb-3 xl:mb-4 xl:text-xl'>화분 색상</h3>
                  <div className='mb-8 flex gap-3 xl:mb-10 xl:gap-4'>
                    {colorOptions.map((option, index) => (
                      <button
                        key={option.value}
                        type='button'
                        aria-label={option.label}
                        onClick={() => handleColorChange(index)}
                        className={`h-10 w-10 rounded-full border-2 transition xl:h-12 xl:w-12 ${selectedColorIndex === index ? 'border-secondary scale-110 border-4' : 'border-gray-300'} ${option.value === 'white' ? 'ring-1 ring-gray-200' : ''}`}
                        style={{ backgroundColor: option.color }}
                      />
                    ))}
                  </div>
                </>
              )}

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
            <div className='text-secondary t-h3 space-y-4 xl:space-y-6'>{product.content ? <div dangerouslySetInnerHTML={{ __html: product.content }} /> : <p>상품 설명이 없습니다.</p>}</div>
          </section>

          {/* 리뷰 섹션 */}
          <section className='mb-8'>
            <h2 className='text-secondary t-h1 mb-6 xl:mb-8'>Review {reviewsPagination.total > 0 && `(${reviewsPagination.total})`}</h2>

            {reviewsLoading ? (
              <div className='py-8 text-center'>
                <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-600' />
                <p className='text-gray-600'>리뷰를 불러오는 중...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className='py-8 text-center'>
                <p className='text-gray-600'>아직 리뷰가 없습니다.</p>
              </div>
            ) : (
              <>
                {reviews.map((review) => (
                  <div key={review.id} className='mb-8 pb-8 xl:mb-10 xl:pb-10'>
                    <div className='mb-3 flex items-center gap-3 xl:mb-4 xl:gap-4'>
                      <div className='bg-secondary flex h-10 w-10 items-center justify-center rounded-full font-medium text-white xl:h-12 xl:w-12'>{review.userName.charAt(0)}</div>
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
              </>
            )}
          </section>

          {/* 추천 상품 */}
          <section className='border-t-1 border-gray-300 pt-8'>
            <h2 className='text-secondary t-h1 mb-6 xl:mb-8'>Recommend</h2>
            {recommendProducts.length === 0 ? (
              <div className='py-8 text-center'>
                <p className='text-gray-600'>추천 상품이 없습니다.</p>
              </div>
            ) : (
              <div className='grid grid-cols-4 gap-6 xl:gap-8'>
                {recommendProducts.map((product) => (
                  <ProductDetailCard key={product.id} product={product} onClick={handleProductClick} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
