// src/app/shop/products/[id]/_components/ProductDetailClient.tsx
'use client';

import BookmarkButton from '@/components/ui/BookmarkButton';
import { Button } from '@/components/ui/Button';
import { addToCartAction, checkLoginStatusAction } from '@/lib/actions/cartServerActions';
import { checkOrderLoginStatusAction } from '@/lib/actions/orderServerActions';
import { getBestProducts } from '@/lib/functions/productClientFunctions';
import { useCartStore } from '@/store/cartStore';
import { usePurchaseStore } from '@/store/orderStore';
import { DirectPurchaseItem } from '@/types/order.types';
import { Product, getImageUrl, getProductCategories, getProductId, getProductPotColors, getProductTags, isNewProduct } from '@/types/product';
import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
}

// 한국어 -> 영어 매핑 함수
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

export default function ProductDetailClient({ productData, productId }: ProductDetailClientProps) {
  const router = useRouter();

  // Zustand 스토어 사용
  const { addItem } = useCartStore();
  const { setDirectPurchase } = usePurchaseStore();

  // 상태 관리
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [recommendProducts, setRecommendProducts] = useState<Product[]>([]);

  // 상품 기본 정보
  const productTags = useMemo(() => {
    if (!productData) return [];
    try {
      return getProductTags(productData) || [];
    } catch (error) {
      console.error('[ProductDetailClient] 태그 추출 오류:', error);
      return [];
    }
  }, [productData]);

  const productCategories = useMemo(() => {
    if (!productData) return [];
    try {
      return getProductCategories(productData) || [];
    } catch (error) {
      console.error('[ProductDetailClient] 카테고리 추출 오류:', error);
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

  // 계산된 값들
  const totalPrice = useMemo(() => {
    if (!productData) return 0;
    return productData.price * quantity;
  }, [productData, quantity]);

  // 카테고리 표시 이름 가져오기
  const getCategoryDisplayName = useMemo(() => {
    return () => {
      if (!productData) return '상품';

      try {
        if (productCategories.includes('식물') || (!productCategories.includes('원예 용품') && !productCategories.includes('화분') && !productCategories.includes('도구') && !productCategories.includes('조명'))) {
          return '식물';
        } else if (productCategories.includes('원예 용품') || productCategories.includes('화분') || productCategories.includes('도구') || productCategories.includes('조명')) {
          return '원예 용품';
        }
        return '상품';
      } catch (error) {
        console.error('[ProductDetailClient] 카테고리 표시명 오류:', error);
        return '상품';
      }
    };
  }, [productData, productCategories]);

  // 추천 상품 로딩
  useEffect(() => {
    const loadRecommendProducts = async () => {
      try {
        console.log('[ProductDetailClient] 추천 상품 로딩 시작');
        const response = await getBestProducts(4);
        if (response.ok) {
          const products = (response.item || []) as Product[];
          const transformedProducts = products.filter((p) => p._id.toString() !== productId).slice(0, 4);
          setRecommendProducts(transformedProducts);
          console.log('[ProductDetailClient] 추천 상품 로딩 완료:', transformedProducts.length);
        }
      } catch (error) {
        console.error('[ProductDetailClient] 추천 상품 로딩 실패:', error);
      }
    };

    if (productId) {
      loadRecommendProducts();
    }
  }, [productId]);

  // 모든 Hook 호출이 완료된 후 조건부 return
  if (!productData) {
    console.error('[ProductDetailClient] 상품 데이터가 없습니다.');
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-red-500'>상품 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  console.log('[ProductDetailClient] 렌더링 시작:', {
    상품ID: productData._id,
    상품명: productData.name,
    myBookmarkId: productData.myBookmarkId,
    extra존재: !!productData.extra,
    extra내용: productData.extra,
  });

  console.log('[ProductDetailClient] 기본 정보 추출 완료:', {
    태그수: productTags.length,
    카테고리수: productCategories.length,
    신상품여부: isNew,
  });

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

  // Zustand 스토어를 사용한 장바구니 추가 기능
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
              // 현재 페이지를 callback URL로 하여 로그인 페이지로 이동
              const currentUrl = window.location.pathname + window.location.search;
              window.location.href = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
            },
          },
          duration: 5000,
        });
        return;
      }

      // 2. 서버 API 호출 데이터 준비
      const cartData = {
        product_id: productData._id,
        quantity,
        size: hasColorOptions ? colorOptions[selectedColorIndex]?.label || '' : undefined,
      };

      console.log('[장바구니 추가] 서버 요청 데이터:', cartData);

      // 3. 서버에 장바구니 추가 요청
      const result = await addToCartAction(cartData);

      if (!result.success) {
        console.error('[장바구니 추가] 서버 오류:', result.message);
        toast.error('장바구니 추가 실패', {
          description: result.message,
          duration: 4000,
        });
        return;
      }

      // 4. 성공 시 로컬 스토어에도 추가 (UI 반영용)
      const localCartItem = {
        productId: productData._id.toString(),
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

      addItem(localCartItem);

      // 5. 성공 알림
      toast.success('장바구니에 추가되었습니다!', {
        description: `${productData.name} ${quantity}개${hasColorOptions ? ` (${colorOptions[selectedColorIndex]?.label})` : ''}`,
        action: {
          label: undefined,
          onClick: () => {
            window.location.href = '/cart';
          },
        },
        duration: 4000,
      });

      console.log('[장바구니 추가] 성공 완료');
    } catch (error) {
      console.error('[장바구니 추가] 예상치 못한 오류:', error);
      toast.error('장바구니 추가에 실패했습니다', {
        description: '잠시 후 다시 시도해주세요.',
        duration: 4000,
      });
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
              // 현재 페이지를 callback URL로 하여 로그인 페이지로 이동
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

      // 3. 구매 스토어에 데이터 설정
      setDirectPurchase(purchaseItem);

      // 4. 결제 페이지로 이동
      console.log('[직접 구매] 결제 페이지로 이동');

      toast.success('결제 페이지로 이동합니다', {
        description: `${productData.name} ${quantity}개${hasColorOptions ? ` (${colorOptions[selectedColorIndex]?.label})` : ''}`,
        duration: 2000,
      });

      // 약간의 딜레이 후 페이지 이동 (toast 메시지 표시 시간)
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

  const handleProductClick = (id: number) => {
    router.push(`/shop/products/${id}`);
  };

  console.log('[ProductDetailClient] 렌더링 준비 완료');

  return (
    <>
      {/* 모바일/태블릿 레이아웃 */}
      <div className='lg:hidden'>
        {/* 상품 이미지 섹션 */}
        <div className='relative mx-4 mt-4 aspect-square w-auto rounded-2xl bg-white sm:mx-6 sm:mt-6 md:mx-8 md:mt-8'>
          <Image
            src={currentImageUrl}
            alt={`${productData.name}${hasColorOptions ? ` - ${colorOptions[selectedColorIndex]?.label}` : ''}`}
            fill
            className='rounded-2xl object-cover'
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-plant.jpg';
            }}
          />

          {/* NEW 태그 */}
          {isNew && (
            <div className='absolute top-0 left-0 z-1'>
              <div className='bg-secondary t-h4 rounded-ss-2xl rounded-ee-2xl px-3 py-2 text-white sm:px-4 sm:py-2 md:px-5 md:py-3'>NEW</div>
            </div>
          )}

          {/* 북마크 버튼 */}
          <div className='absolute top-3 right-3 sm:top-4 sm:right-4'>
            <BookmarkButton productId={getProductId(productData)} myBookmarkId={productData.myBookmarkId} size={32} className='sm:scale-110 md:scale-125' />
          </div>
        </div>

        {/* 상품 정보 섹션 */}
        <div className='mx-4 mt-6 w-auto sm:mx-6 sm:mt-8 md:mx-8'>
          {/* 카테고리 및 상품명 */}
          <div className='mb-4'>
            <p className='mb-2 text-sm text-gray-500'>{getCategoryDisplayName()}</p>
            <h1 className='text-secondary t-h1 mb-4'>{productData.name}</h1>
          </div>

          {/* 태그 목록 */}
          <div className='mb-12 flex flex-wrap gap-2 sm:mb-8 sm:gap-3'>
            {productTags.map((tag) => (
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
            <div className='text-secondary t-body sm:t-h4 space-y-3 sm:space-y-4'>{productData.content ? <div dangerouslySetInnerHTML={{ __html: productData.content }} /> : <p>상품 설명이 없습니다.</p>}</div>
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
                  <ProductDetailCard key={getProductId(product)} product={product} onClick={handleProductClick} />
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
                alt={`${productData.name}${hasColorOptions ? ` - ${colorOptions[selectedColorIndex]?.label}` : ''}`}
                fill
                className='rounded-2xl object-cover'
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-plant.jpg';
                }}
              />

              {/* NEW 태그 */}
              {isNew && <div className='bg-secondary t-h3 absolute top-0 left-0 z-1 rounded-ss-2xl rounded-ee-2xl px-6 py-3 text-white'>NEW</div>}

              {/* 북마크 버튼 - myBookmarkId prop 추가 */}
              <div className='absolute top-4 right-4'>
                <BookmarkButton productId={getProductId(productData)} myBookmarkId={productData.myBookmarkId} size={48} />
              </div>
            </div>

            {/* 상품 정보 */}
            <div className='w-full min-w-[280px] flex-1'>
              {/* 카테고리 */}
              <p className='mb-2 text-lg text-gray-500'>{getCategoryDisplayName()}</p>

              <h1 className='text-secondary mb-6 text-3xl font-bold xl:text-4xl 2xl:text-5xl'>{productData.name}</h1>

              {/* 태그 */}
              <div className='mb-8 flex flex-wrap gap-3 xl:mb-10'>
                {productTags.map((tag) => (
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
            <div className='text-secondary t-h3 space-y-4 xl:space-y-6'>{productData.content ? <div dangerouslySetInnerHTML={{ __html: productData.content }} /> : <p>상품 설명이 없습니다.</p>}</div>
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
                  <ProductDetailCard key={getProductId(product)} product={product} onClick={handleProductClick} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
