// src/app/shop/products/[id]/_components/ProductDetailClient.tsx
'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import BookmarkButton from '@/components/ui/BookmarkButton';
import { Button } from '@/components/ui/Button';
import { addToCartAction, checkLoginStatusAction } from '@/lib/actions/cartServerActions';
import { checkOrderLoginStatusAction, createDirectPurchaseTempOrderAction } from '@/lib/actions/order/orderServerActions';
import { getImageUrl, getProductCategories, getProductId, getProductPotColors, getProductTags, isNewProduct } from '@/lib/utils/product.utils';
import { AddToCartRequest } from '@/types/cart.types';
import { DirectPurchaseItem } from '@/types/order.types';
import { Product } from '@/types/product.types';
import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from './Badge';
import ProductDetailCard from './ProductDetailCard';

interface ColorOption {
  value: string;
  label: string;
  color: string;
}

interface ProductDetailClientProps {
  productData: Product;
  productId: string;
  recommendProducts?: Product[];
  children?: React.ReactNode;
}

/**
 * 한국어 색상명을 영어명과 HEX 색상 코드로 매핑
 */
const getColorMapping = (koreanColor: string): { englishName: string; hexColor: string } => {
  const colorMap: Record<string, { englishName: string; hexColor: string }> = {
    흑색: { englishName: 'black', hexColor: '#000000' },
    갈색: { englishName: 'brown', hexColor: '#8B4513' },
    백색: { englishName: 'white', hexColor: '#FFFFFF' },
    황색: { englishName: 'yellow', hexColor: '#FFD700' },
    회색: { englishName: 'gray', hexColor: '#808080' },
    흰색: { englishName: 'white', hexColor: '#FFFFFF' },
    남색: { englishName: 'blue', hexColor: '#4169E1' },
  };

  return colorMap[koreanColor] || { englishName: koreanColor.toLowerCase(), hexColor: '#808080' };
};

/**
 * 상품 상세 페이지 클라이언트 컴포넌트
 * 서버 액션만 사용
 */
export default function ProductDetailClient({ productData, recommendProducts, children = [] }: ProductDetailClientProps) {
  const router = useRouter();

  // 상태 관리
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [showCartAlert, setShowCartAlert] = useState<boolean>(false);

  // 접근성을 위한 refs
  const colorOptionsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const quantityAnnouncementRef = useRef<HTMLDivElement>(null);
  const colorAnnouncementRef = useRef<HTMLDivElement>(null);

  // 상품 정보 파싱
  const productCategories = useMemo(() => {
    if (!productData) return [];
    try {
      return getProductCategories(productData) || [];
    } catch (error) {
      console.error('[ProductDetailClient] 카테고리 추출 오류:', error);
      return [];
    }
  }, [productData]);

  const productTags = useMemo(() => {
    if (!productData) return [];
    try {
      return getProductTags(productData) || [];
    } catch (error) {
      console.error('[ProductDetailClient] 태그 추출 오류:', error);
      return [];
    }
  }, [productData]);

  const isNew = useMemo(() => {
    if (!productData) return false;
    try {
      return isNewProduct(productData);
    } catch (error) {
      console.error('[ProductDetailClient] 신상품 확인 오류:', error);
      return false;
    }
  }, [productData]);

  // 상품의 화분 색상 정보 추출
  const colorValues = useMemo(() => {
    if (!productData) return null;

    try {
      const potColors = getProductPotColors(productData) || [];
      console.log('[ProductDetailClient] 색상 정보:', potColors);

      if (potColors && Array.isArray(potColors) && potColors.length > 0) {
        return potColors;
      }
      return null;
    } catch (error) {
      console.error('[ProductDetailClient] 색상 정보 추출 오류:', error);
      return null;
    }
  }, [productData]);

  // 색상 옵션이 있는지 확인
  const hasColorOptions = useMemo(() => {
    return Boolean(colorValues && colorValues.length > 0);
  }, [colorValues]);

  // 동적 색상 옵션 생성
  const colorOptions: ColorOption[] = useMemo(() => {
    if (!hasColorOptions || !colorValues) return [];

    try {
      return colorValues.map((koreanColor) => {
        const { englishName, hexColor } = getColorMapping(koreanColor);
        return {
          value: englishName,
          label: koreanColor,
          color: hexColor,
        };
      });
    } catch (error) {
      console.error('[ProductDetailClient] 색상 옵션 생성 오류:', error);
      return [];
    }
  }, [colorValues, hasColorOptions]);

  // 현재 선택된 색상에 해당하는 이미지 URL 계산
  const currentImageUrl = useMemo(() => {
    if (!productData) return getImageUrl('');

    try {
      if (!hasColorOptions || !productData.mainImages || productData.mainImages.length === 0) {
        const fallbackImage = productData.mainImages?.[0] || '';
        console.log('[ProductDetailClient] 기본 이미지 사용:', fallbackImage);
        return getImageUrl(fallbackImage);
      }

      const imageIndex = Math.min(selectedColorIndex, productData.mainImages.length - 1);
      const selectedImagePath = productData.mainImages[imageIndex];
      console.log('[ProductDetailClient] 선택된 이미지:', { imageIndex, selectedImagePath });
      return getImageUrl(selectedImagePath || '');
    } catch (error) {
      console.error('[ProductDetailClient] 이미지 URL 계산 오류:', error);
      return getImageUrl('');
    }
  }, [hasColorOptions, productData, selectedColorIndex]);

  // 카테고리 표시 이름
  const getCategoryDisplayName = () => {
    if (productCategories.includes('화분')) return '화분';
    if (productCategories.includes('소품')) return '소품';
    if (productCategories.includes('선인장')) return '선인장';
    if (productCategories.includes('관엽식물')) return '관엽식물';
    if (productCategories.includes('공기정화식물')) return '공기정화식물';
    if (productCategories.includes('꽃')) return '꽃';
    return '식물';
  };

  // 총 가격 계산
  const totalPrice = productData.price * quantity;

  // 렌더링 체크
  if (!productData) {
    console.error('[ProductDetailClient] 상품 데이터가 없습니다');
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-red-500'>상품 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 이벤트 핸들러들
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);

      // 수량 변경 알림
      if (quantityAnnouncementRef.current) {
        quantityAnnouncementRef.current.textContent = `수량이 ${newQuantity}개로 변경되었습니다.`;
      }
    }
  };

  const handleColorChange = (colorIndex: number) => {
    setSelectedColorIndex(colorIndex);

    // 색상 변경 알림
    if (colorAnnouncementRef.current && colorOptions[colorIndex]) {
      colorAnnouncementRef.current.textContent = `화분 색상이 ${colorOptions[colorIndex].label}로 변경되었습니다.`;
    }
  };

  // 키보드 네비게이션을 위한 핸들러
  const handleColorKeyDown = (event: React.KeyboardEvent, colorIndex: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleColorChange(colorIndex);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const nextIndex = (colorIndex + direction + colorOptions.length) % colorOptions.length;
      colorOptionsRef.current[nextIndex]?.focus();
    }
  };

  // 서버 액션만 사용한 장바구니 추가 기능
  const handleAddToCart = async () => {
    try {
      console.log('[장바구니 추가] 시작:', {
        상품ID: productData._id,
        수량: quantity,
        선택된색상: hasColorOptions ? colorOptions[selectedColorIndex]?.label : null,
      });

      // 1. 로그인 상태 확인
      const isLoggedIn = await checkLoginStatusAction();

      if (!isLoggedIn) {
        console.log('[장바구니 추가] 로그인 필요');
        toast.error('로그인이 필요합니다', {
          description: '장바구니 기능을 사용하려면 로그인해주세요.',
          action: {
            label: '로그인',
            onClick: () => {
              const currentUrl = window.location.pathname + window.location.search;
              window.location.href = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
            },
          },
          duration: 5000,
        });
        return;
      }

      // 2. 서버 API 호출 데이터 준비 - color 필드 사용
      const cartData: AddToCartRequest = {
        product_id: productData._id,
        quantity,
        color: hasColorOptions ? colorOptions[selectedColorIndex]?.label : undefined,
      };

      console.log('[장바구니 추가] 서버 요청 데이터:', cartData);

      // 3. 서버 액션 호출
      const result = await addToCartAction(cartData);

      if (result.success) {
        setShowCartAlert(true);
      } else {
        console.error('[장바구니 추가] 실패:', result.message);
        toast.error(result.message);
      }
    } catch (error) {
      console.error('[장바구니 추가] 예상치 못한 오류:', error);
      toast.error('장바구니 추가 중 오류가 발생했습니다');
    }
  };

  const handlePurchase = async () => {
    try {
      console.log('[직접 구매] 시작:', {
        상품ID: productData._id,
        수량: quantity,
        선택된색상: hasColorOptions ? colorOptions[selectedColorIndex]?.label : null,
      });

      // 1. 로그인 상태 확인
      const isLoggedIn = await checkOrderLoginStatusAction();

      if (!isLoggedIn) {
        console.log('[직접 구매] 로그인 필요');
        toast.error('로그인이 필요합니다', {
          description: '구매하려면 로그인해주세요.',
          action: {
            label: '로그인',
            onClick: () => {
              const currentUrl = window.location.pathname + window.location.search;
              window.location.href = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
            },
          },
          duration: 5000,
        });
        return;
      }

      // 2. 직접 구매 아이템 데이터 준비
      const purchaseItem: DirectPurchaseItem = {
        productId: productData._id,
        productName: productData.name,
        productImage: currentImageUrl,
        price: productData.price,
        quantity,
        selectedColor: hasColorOptions
          ? {
              colorIndex: selectedColorIndex,
              colorName: colorOptions[selectedColorIndex]?.label || '',
            }
          : undefined,
      };

      // 3. 임시 주문 생성 (서버 액션)
      const success = await createDirectPurchaseTempOrderAction(purchaseItem);

      if (!success) {
        console.error('[직접 구매] 임시 주문 생성 실패');
        toast.error('주문 처리에 실패했습니다', {
          description: '잠시 후 다시 시도해주세요.',
          duration: 4000,
        });
        return;
      }

      // 4. 결제 페이지로 이동
      console.log('[직접 구매] 결제 페이지로 이동');

      toast.success('결제 페이지로 이동합니다', {
        description: `${productData.name} ${quantity}개${hasColorOptions ? ` (${colorOptions[selectedColorIndex]?.label})` : ''}`,
        duration: 2000,
      });

      // 페이지 이동
      setTimeout(() => {
        router.push('/order');
      }, 1000);
    } catch (error) {
      console.error('[직접 구매] 예상치 못한 오류:', error);
      toast.error('구매 처리 중 오류가 발생했습니다', {
        description: '잠시 후 다시 시도해주세요.',
        duration: 4000,
      });
    }
  };

  const handleGoToCart = () => {
    setShowCartAlert(false);
    router.push('/cart');
  };

  const handleProductClick = (id: number) => {
    router.push(`/shop/products/${id}`);
  };

  console.log('[ProductDetailClient] 렌더링 준비 완료');

  return (
    <>
      {/* 스크린 리더용 실시간 알림 영역 */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        <div ref={quantityAnnouncementRef} />
        <div ref={colorAnnouncementRef} />
      </div>

      {/* 장바구니 추가 알림 다이얼로그 */}
      <AlertDialog open={showCartAlert} onOpenChange={setShowCartAlert}>
        <AlertDialogContent className='px-12 sm:max-w-md' role='alertdialog' aria-labelledby='cart-dialog-title' aria-describedby='cart-dialog-description'>
          <AlertDialogHeader>
            <AlertDialogTitle id='cart-dialog-title' className='t-h3 text-center'>
              상품을 장바구니에 담았습니다.
            </AlertDialogTitle>
            <AlertDialogDescription id='cart-dialog-description' className='text-center text-base'>
              장바구니로 이동하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-6 gap-3 sm:justify-between'>
            <AlertDialogCancel onClick={() => setShowCartAlert(false)} className='text-secondary hover:bg-secondary border-[0.5px] border-gray-300 bg-white px-7 shadow-sm hover:text-white sm:order-1'>
              아니오
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToCart} className='bg-primary text-secondary active:bg-primary px-10 shadow-sm hover:bg-[#AEBB2E] sm:order-2'>
              예
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 모바일/태블릿 레이아웃 */}
      <div className='lg:hidden'>
        {/* 상품 이미지 섹션 */}
        <div className='relative mx-auto my-6 aspect-square w-auto max-w-[260px] min-w-[260px] rounded-2xl bg-white sm:my-6 sm:max-w-[400px] md:my-8 md:max-w-[500px]'>
          <Image
            src={currentImageUrl}
            alt={`${productData.name}${hasColorOptions ? ` ${colorOptions[selectedColorIndex]?.label} 색상` : ''} 상품 이미지`}
            fill
            className='rounded-2xl object-cover'
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-plant.jpg';
              target.alt = '상품 이미지를 불러올 수 없습니다';
            }}
          />

          {/* NEW 태그 */}
          {isNew && (
            <div className='absolute top-0 left-0 z-1' aria-label='신상품'>
              <div className='bg-secondary t-h4 rounded-ss-2xl rounded-ee-2xl px-3 py-2 text-white sm:px-4 sm:py-2 md:px-5 md:py-3'>NEW</div>
            </div>
          )}

          {/* 북마크 버튼 */}
          <div className='absolute top-3 right-3 sm:top-4 sm:right-4'>
            <BookmarkButton targetId={getProductId(productData)} type='product' myBookmarkId={productData.myBookmarkId} revalidate={false} variant='icon' />
          </div>
        </div>

        {/* 상품 정보 섹션 */}
        <div className='mx-4 mt-6 w-auto sm:mx-6 sm:mt-8 md:mx-8'>
          {/* 카테고리 및 상품명 */}
          <div className='mb-4'>
            <p className='mb-2 text-sm text-gray-500' aria-label={`상품 카테고리: ${getCategoryDisplayName()}`}>
              {getCategoryDisplayName()}
            </p>
            <h1 className='text-secondary t-h1 mb-4' role='heading' aria-level={1}>
              {productData.name}
            </h1>
          </div>

          {/* 태그 목록 */}
          <div className='mb-12 flex flex-wrap gap-2 sm:mb-8 sm:gap-3' role='list' aria-label='상품 태그'>
            {productTags.map((tag) => (
              <Badge key={tag} variant='default' className='t-desc md:t-body border-1 border-gray-300 px-3 py-1 sm:px-4 sm:py-1.5' role='listitem'>
                {tag}
              </Badge>
            ))}
          </div>

          {/* 화분 색상 선택 (옵션이 있는 경우에만 표시) */}
          {hasColorOptions && colorOptions.length > 0 && (
            <div role='group' aria-labelledby='color-selection-title'>
              <h3 id='color-selection-title' className='text-secondary t-h3 mb-3 sm:mb-4'>
                화분 색상
              </h3>
              <div className='mb-12 flex gap-3 sm:gap-4' role='radiogroup' aria-labelledby='color-selection-title'>
                {colorOptions.map((option, index) => (
                  <button
                    key={option.value}
                    ref={(el) => {
                      colorOptionsRef.current[index] = el;
                    }}
                    type='button'
                    role='radio'
                    aria-checked={selectedColorIndex === index}
                    aria-label={`화분 색상 ${option.label} 선택${selectedColorIndex === index ? ', 현재 선택됨' : ''}`}
                    onClick={() => handleColorChange(index)}
                    onKeyDown={(e) => handleColorKeyDown(e, index)}
                    className={`focus-visible:ring-secondary h-8 w-8 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-9 sm:w-9 md:h-10 md:w-10 ${
                      selectedColorIndex === index ? 'border-secondary scale-110 border-3' : 'border-gray-300'
                    } ${option.value === 'white' ? 'ring-1 ring-gray-200' : ''}`}
                    style={{ backgroundColor: option.color }}
                    tabIndex={selectedColorIndex === index ? 0 : -1}
                  />
                ))}
              </div>
              <span className='sr-only'>방향키로 색상 옵션을 탐색할 수 있습니다. 엔터 또는 스페이스바로 선택하세요.</span>
            </div>
          )}

          {/* 수량 선택 및 가격 */}
          <div className='mb-5 flex items-center justify-between'>
            {/* 수량 선택 */}
            <div className='flex items-center gap-3 rounded-4xl border-1 border-gray-300 bg-white p-2 sm:gap-4' role='group' aria-labelledby='quantity-label'>
              <span id='quantity-label' className='sr-only'>
                수량 선택
              </span>
              <Button
                variant='ghost'
                size='icon'
                disabled={quantity <= 1}
                onClick={() => handleQuantityChange(-1)}
                className='h-6 w-6 hover:bg-transparent active:bg-transparent sm:h-8 sm:w-8'
                aria-label={`수량 1개 감소. 현재 수량 ${quantity}개`}
                aria-describedby='current-quantity'
              >
                <Minus size={18} className='sm:size-5' aria-hidden='true' />
              </Button>

              <span id='current-quantity' className='text-secondary t-h4 min-w-[50px] text-center sm:min-w-[60px] sm:text-base' aria-label={`현재 수량 ${quantity}개`} role='status'>
                {quantity}
              </span>

              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleQuantityChange(1)}
                className='h-6 w-6 hover:bg-transparent active:bg-transparent sm:h-8 sm:w-8'
                aria-label={`수량 1개 증가. 현재 수량 ${quantity}개`}
                aria-describedby='current-quantity'
              >
                <Plus size={18} className='sm:size-5' aria-hidden='true' />
              </Button>
            </div>

            {/* 총 가격 */}
            <p className='text-secondary text-lg font-semibold sm:text-xl' aria-label={`총 가격 ${totalPrice.toLocaleString()}원`}>
              ₩ {totalPrice.toLocaleString()}
            </p>
          </div>

          <div className='pb-6 text-right'>
            <span className='t-desc' aria-label='배송비 3000원'>
              배송비 : 3000원
            </span>
          </div>

          {/* 액션 버튼 */}
          <div className='mb-10 flex gap-3 sm:mb-12 sm:gap-4' role='group' aria-label='상품 구매 옵션'>
            <Button onClick={handleAddToCart} variant='default' className='t-h4 sm:t-h3 h-10 flex-1 sm:h-12' aria-describedby='cart-button-description'>
              장바구니
            </Button>
            <span id='cart-button-description' className='sr-only'>
              {productData.name} {quantity}개{hasColorOptions ? ` ${colorOptions[selectedColorIndex]?.label} 색상` : ''}를 장바구니에 추가합니다
            </span>

            <Button onClick={handlePurchase} variant='primary' className='t-h4 sm:t-h3 h-10 flex-1 sm:h-12' aria-describedby='purchase-button-description'>
              구매하기
            </Button>
            <span id='purchase-button-description' className='sr-only'>
              {productData.name} {quantity}개{hasColorOptions ? ` ${colorOptions[selectedColorIndex]?.label} 색상` : ''}를 바로 구매합니다
            </span>
          </div>

          {/* 상품 설명 */}
          <section className='mb-8 border-y border-gray-300 py-8 sm:mb-10 sm:py-10 md:mb-12 md:py-12' aria-labelledby='product-description-title'>
            <h2 id='product-description-title' className='text-secondary t-h2 sm:t-h1 mb-4 sm:mb-5'>
              Description
            </h2>
            <div className='text-secondary t-body space-y-3 leading-relaxed sm:space-y-4' role='region' aria-labelledby='product-description-title'>
              {productData.content ? <div dangerouslySetInnerHTML={{ __html: productData.content }} /> : <p>상품 설명이 없습니다.</p>}
            </div>
          </section>

          {children}

          {/* 추천 상품 */}
          <section className='border-t-1 border-gray-300 pt-8 pb-8 sm:pb-10 md:pb-12' aria-labelledby='recommend-products-title'>
            <h2 id='recommend-products-title' className='text-secondary t-h2 sm:t-h1 mb-4 sm:mb-5'>
              Recommend
            </h2>
            {!recommendProducts || recommendProducts.length === 0 ? (
              <div className='py-8 text-center' role='status'>
                <p className='text-gray-600'>추천 상품이 없습니다.</p>
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-3 sm:gap-4 md:gap-6' role='list' aria-label='추천 상품 목록'>
                {recommendProducts.slice(0, 2).map((product) => (
                  <div key={getProductId(product)} role='listitem'>
                    <ProductDetailCard product={product} onClick={handleProductClick} />
                  </div>
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
          <div className='mb-12 flex gap-12 xl:gap-20'>
            {/* 상품 이미지 */}
            <div className='relative aspect-square w-full max-w-[800px] min-w-[280px] flex-1 lg:max-w-[350px] lg:min-w-[350px] xl:max-w-[800px] xl:min-w-[280px]'>
              <Image
                src={currentImageUrl}
                alt={`${productData.name}${hasColorOptions ? ` ${colorOptions[selectedColorIndex]?.label} 색상` : ''} 상품 이미지`}
                fill
                className='rounded-2xl object-cover'
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-plant.jpg';
                  target.alt = '상품 이미지를 불러올 수 없습니다';
                }}
              />

              {/* NEW 태그 */}
              {isNew && (
                <div className='bg-secondary t-h3 absolute top-0 left-0 z-1 rounded-ss-2xl rounded-ee-2xl px-6 py-3 text-white' aria-label='신상품'>
                  NEW
                </div>
              )}

              {/* 북마크 버튼 */}
              <div className='absolute top-4 right-4'>
                <BookmarkButton targetId={getProductId(productData)} type='product' myBookmarkId={productData.myBookmarkId} revalidate={false} variant='icon' />
              </div>
            </div>

            {/* 상품 정보 */}
            <div className='w-full min-w-[280px] flex-1'>
              {/* 카테고리 */}
              <p className='mb-2 text-lg text-gray-500' aria-label={`상품 카테고리: ${getCategoryDisplayName()}`}>
                {getCategoryDisplayName()}
              </p>

              <h1 className='text-secondary mb-6 text-3xl font-bold xl:text-4xl 2xl:text-5xl' role='heading' aria-level={1}>
                {productData.name}
              </h1>

              {/* 태그 */}
              <div className='mb-8 flex flex-wrap gap-3 xl:mb-10' role='list' aria-label='상품 태그'>
                {productTags.map((tag) => (
                  <Badge key={tag} variant='default' className='border-1 border-gray-300 px-3 py-1.5 text-sm xl:px-4 xl:py-2 xl:text-base' role='listitem'>
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* 화분 색상 (옵션이 있는 경우에만 표시) */}
              {hasColorOptions && colorOptions.length > 0 && (
                <div role='group' aria-labelledby='desktop-color-selection-title'>
                  <h3 id='desktop-color-selection-title' className='text-secondary t-h2 mb-3 xl:mb-4 xl:text-xl'>
                    화분 색상
                  </h3>
                  <div className='mb-8 flex gap-3 xl:mb-10 xl:gap-4' role='radiogroup' aria-labelledby='desktop-color-selection-title'>
                    {colorOptions.map((option, index) => (
                      <button
                        key={option.value}
                        ref={(el) => {
                          colorOptionsRef.current[index] = el;
                        }}
                        type='button'
                        role='radio'
                        aria-checked={selectedColorIndex === index}
                        aria-label={`화분 색상 ${option.label} 선택${selectedColorIndex === index ? ', 현재 선택됨' : ''}`}
                        onClick={() => handleColorChange(index)}
                        onKeyDown={(e) => handleColorKeyDown(e, index)}
                        className={`focus-visible:ring-secondary h-10 w-10 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 xl:h-12 xl:w-12 ${selectedColorIndex === index ? 'border-secondary scale-110 border-4' : 'border-gray-300'} ${option.value === 'white' ? 'ring-1 ring-gray-200' : ''}`}
                        style={{ backgroundColor: option.color }}
                        tabIndex={selectedColorIndex === index ? 0 : -1}
                      />
                    ))}
                  </div>
                  <span className='sr-only'>방향키로 색상 옵션을 탐색할 수 있습니다. 엔터 또는 스페이스바로 선택하세요.</span>
                </div>
              )}

              {/* 수량 선택 */}
              <div className='mb-5 flex items-center justify-between'>
                <div className='flex items-center gap-3 rounded-4xl border-1 border-gray-300 bg-white p-2 xl:gap-4' role='group' aria-labelledby='desktop-quantity-label'>
                  <span id='desktop-quantity-label' className='sr-only'>
                    수량 선택
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    disabled={quantity <= 1}
                    onClick={() => handleQuantityChange(-1)}
                    className='hover:bg-transparent active:bg-transparent xl:h-10 xl:w-10'
                    aria-label={`수량 1개 감소. 현재 수량 ${quantity}개`}
                    aria-describedby='desktop-current-quantity'
                  >
                    <Minus size={18} className='xl:size-5' aria-hidden='true' />
                  </Button>

                  <span id='desktop-current-quantity' className='text-secondary min-w-[50px] text-center text-lg font-medium xl:min-w-[60px] xl:text-xl' aria-label={`현재 수량 ${quantity}개`} role='status'>
                    {quantity}
                  </span>

                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleQuantityChange(1)}
                    className='hover:bg-transparent active:bg-transparent xl:h-10 xl:w-10'
                    aria-label={`수량 1개 증가. 현재 수량 ${quantity}개`}
                    aria-describedby='desktop-current-quantity'
                  >
                    <Plus size={18} className='xl:size-5' aria-hidden='true' />
                  </Button>
                </div>

                <p className='text-secondary t-h2' aria-label={`총 가격 ${totalPrice.toLocaleString()}원`}>
                  ₩ {totalPrice.toLocaleString()}
                </p>
              </div>

              <div className='pb-6 text-right'>
                <span className='t-desc' aria-label='배송비 3000원'>
                  배송비 : 3000원
                </span>
              </div>

              {/* 액션 버튼 */}
              <div className='flex gap-4 xl:gap-6' role='group' aria-label='상품 구매 옵션'>
                <Button onClick={handleAddToCart} variant='default' size='lg' className='t-h3 flex-1 p-8' aria-describedby='desktop-cart-button-description'>
                  장바구니
                </Button>
                <span id='desktop-cart-button-description' className='sr-only'>
                  {productData.name} {quantity}개{hasColorOptions ? ` ${colorOptions[selectedColorIndex]?.label} 색상` : ''}를 장바구니에 추가합니다
                </span>

                <Button onClick={handlePurchase} variant='primary' size='lg' className='t-h3 flex-1 p-8' aria-describedby='desktop-purchase-button-description'>
                  구매하기
                </Button>
                <span id='desktop-purchase-button-description' className='sr-only'>
                  {productData.name} {quantity}개{hasColorOptions ? ` ${colorOptions[selectedColorIndex]?.label} 색상` : ''}를 바로 구매합니다
                </span>
              </div>
            </div>
          </div>

          {/* 상품 설명 */}
          <section className='mb-10 border-y border-gray-300 py-8 xl:py-10' aria-labelledby='desktop-product-description-title'>
            <h2 id='desktop-product-description-title' className='text-secondary t-h1 mb-6 xl:mb-8 xl:text-3xl'>
              Description
            </h2>
            <div className='text-secondary max-w-[123ch] space-y-4 text-xl leading-relaxed xl:space-y-6 2xl:text-2xl' role='region' aria-labelledby='desktop-product-description-title'>
              {productData.content ? <div dangerouslySetInnerHTML={{ __html: productData.content }} /> : <p>상품 설명이 없습니다.</p>}
            </div>
          </section>

          {children}

          {/* 추천 상품 */}
          <section className='border-t-1 border-gray-300 pt-8' aria-labelledby='desktop-recommend-products-title'>
            <h2 id='desktop-recommend-products-title' className='text-secondary t-h1 mb-6 xl:mb-8'>
              Recommend
            </h2>
            {!recommendProducts || recommendProducts.length === 0 ? (
              <div className='py-8 text-center' role='status'>
                <p className='text-gray-600'>추천 상품이 없습니다.</p>
              </div>
            ) : (
              <div className='grid grid-cols-4 gap-6 xl:gap-8' role='list' aria-label='추천 상품 목록'>
                {recommendProducts.map((product) => (
                  <div key={getProductId(product)} role='listitem'>
                    <ProductDetailCard product={product} onClick={handleProductClick} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
