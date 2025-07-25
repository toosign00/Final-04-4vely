// src/app/shop/products/[id]/_components/ProductDetailClient.tsx
'use client';

import BookmarkButton from '@/app/shop/_components/BookmarkButton';
import { Button } from '@/components/ui/Button';
import { getBestProducts } from '@/lib/functions/productFunctions';
import { Product, getImageUrl, getProductCategories, getProductId, getProductPotColors, getProductTags, isNewProduct } from '@/types/product';
import { Minus, Plus } from 'lucide-react';
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
  productData: Product;
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

export default function ProductDetailClient({ productData, productId }: ProductDetailClientProps) {
  const router = useRouter();

  // ⚠️ 모든 Hook을 먼저 호출 (조건부 return 이전에)

  // 상태 관리 (항상 호출)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [recommendProducts, setRecommendProducts] = useState<Product[]>([]);

  // 상품 기본 정보 (안전하게 추출) - Hook을 먼저 호출
  const productTags = useMemo(() => {
    if (!productData) return [];
    return getProductTags(productData) || [];
  }, [productData]);

  const productCategories = useMemo(() => {
    if (!productData) return [];
    return getProductCategories(productData) || [];
  }, [productData]);

  const isNew = useMemo(() => {
    if (!productData) return false;
    return isNewProduct(productData);
  }, [productData]);

  // 상품의 화분 색상 정보 추출 (안전하게)
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

  // 현재 선택된 색상에 해당하는 이미지 URL 계산 (안전하게)
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

  // 카테고리 표시 이름 가져오기 (안전하게)
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

  // 추천 상품 로딩 (Hook이므로 항상 호출)
  useEffect(() => {
    const loadRecommendProducts = async () => {
      try {
        console.log('[ProductDetailClient] 추천 상품 로딩 시작');
        const response = await getBestProducts(4);
        if (response.ok) {
          const products = (response.item || response.items || []) as Product[];
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

  // ✅ 이제 모든 Hook 호출이 완료된 후 조건부 return
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

  const handleAddToCart = () => {
    // TODO: 장바구니 기능 구현시 추가
    console.log('장바구니에 추가:', {
      productId: getProductId(productData),
      quantity,
      selectedColor: hasColorOptions ? colorOptions[selectedColorIndex] : null,
    });
    alert('장바구니 기능은 아직 구현되지 않았습니다.');
  };

  const handlePurchase = () => {
    // TODO: 구매 기능 구현시 추가
    console.log('구매하기:', {
      productId: getProductId(productData),
      quantity,
      selectedColor: hasColorOptions ? colorOptions[selectedColorIndex] : null,
    });
    alert('구매 기능은 아직 구현되지 않았습니다.');
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

          {/* 북마크 버튼 - myBookmarkId prop 추가 */}
          <div className='absolute top-3 right-3 sm:top-4 sm:right-4'>
            <BookmarkButton productId={getProductId(productData)} myBookmarkId={productData.myBookmarkId} size={32} variant='default' className='sm:scale-110 md:scale-125' />
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
                    className={`h-8 w-8 rounded-full border-2 transition sm:h-9 sm:w-9 md:h-10 md:w-10 ${selectedColorIndex === index ? 'border-secondary scale-110 border-3' : 'border-gray-300'} ${option.value === 'white' ? 'bg-white' : ''}`}
                    style={{ backgroundColor: option.value !== 'white' ? option.color : undefined }}
                  />
                ))}
              </div>
            </>
          )}

          {/* 가격 및 수량 선택 */}
          <div className='mb-8 space-y-4 sm:mb-10'>
            <div className='flex items-center justify-between'>
              <span className='text-secondary t-h2 sm:t-h1'>₩ {totalPrice.toLocaleString()}</span>
              <div className='flex items-center space-x-3'>
                <button
                  type='button'
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className='flex h-10 w-10 items-center justify-center rounded-full border-1 border-gray-300 bg-white transition hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 sm:h-12 sm:w-12'
                >
                  <Minus size={16} />
                </button>
                <span className='text-secondary t-h3 min-w-[3rem] text-center'>{quantity}</span>
                <button type='button' onClick={() => handleQuantityChange(1)} className='flex h-10 w-10 items-center justify-center rounded-full border-1 border-gray-300 bg-white transition hover:bg-gray-50 sm:h-12 sm:w-12'>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 구매 버튼들 */}
          <div className='mb-12 space-y-3 sm:mb-8'>
            <Button onClick={handleAddToCart} variant='outline' className='bg-secondary hover:bg-secondary/90 w-full border-none py-6 text-lg font-semibold text-white sm:py-8 sm:text-xl'>
              장바구니
            </Button>
            <Button onClick={handlePurchase} className='bg-primary hover:bg-primary/90 w-full py-6 text-lg font-semibold sm:py-8 sm:text-xl'>
              구매하기
            </Button>
          </div>

          {/* 상품 설명 */}
          <section className='border-t-1 border-gray-300 pt-8 pb-8 sm:pb-10 md:pb-12'>
            <h2 className='text-secondary t-h2 sm:t-h1 mb-4 sm:mb-5'>Description</h2>
            <div className='text-secondary prose max-w-none'>{productData.content ? <div dangerouslySetInnerHTML={{ __html: productData.content }} /> : <p>상품 설명이 없습니다.</p>}</div>
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
                <BookmarkButton productId={getProductId(productData)} myBookmarkId={productData.myBookmarkId} size={48} variant='default' />
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
                        className={`h-10 w-10 rounded-full border-2 transition xl:h-12 xl:w-12 ${selectedColorIndex === index ? 'border-secondary scale-110 border-4' : 'border-gray-300'} ${option.value === 'white' ? 'bg-white' : ''}`}
                        style={{ backgroundColor: option.value !== 'white' ? option.color : undefined }}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* 가격 및 수량 */}
              <div className='mb-10 space-y-6 xl:mb-12 xl:space-y-8'>
                <div className='flex items-center justify-between'>
                  <span className='text-secondary text-4xl font-bold xl:text-5xl'>₩ {totalPrice.toLocaleString()}</span>
                  <div className='flex items-center space-x-4'>
                    <button
                      type='button'
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className='flex h-12 w-12 items-center justify-center rounded-full border-1 border-gray-300 bg-white transition hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 xl:h-14 xl:w-14'
                    >
                      <Minus size={20} />
                    </button>
                    <span className='text-secondary min-w-[4rem] text-center text-2xl font-semibold xl:text-3xl'>{quantity}</span>
                    <button type='button' onClick={() => handleQuantityChange(1)} className='flex h-12 w-12 items-center justify-center rounded-full border-1 border-gray-300 bg-white transition hover:bg-gray-50 xl:h-14 xl:w-14'>
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 구매 버튼들 */}
              <div className='space-y-4 xl:space-y-6'>
                <Button onClick={handleAddToCart} variant='outline' className='bg-secondary hover:bg-secondary/90 w-full border-none py-6 text-xl font-semibold text-white xl:py-8 xl:text-2xl'>
                  장바구니
                </Button>
                <Button onClick={handlePurchase} className='bg-primary hover:bg-primary/90 w-full py-6 text-xl font-semibold xl:py-8 xl:text-2xl'>
                  구매하기
                </Button>
              </div>
            </div>
          </div>

          {/* 상품 설명 */}
          <section className='mb-24 border-t-1 border-gray-300 pt-12'>
            <h2 className='text-secondary mb-8 text-3xl font-bold xl:text-4xl'>Description</h2>
            <div className='text-secondary prose max-w-none text-lg xl:text-xl'>{productData.content ? <div dangerouslySetInnerHTML={{ __html: productData.content }} /> : <p>상품 설명이 없습니다.</p>}</div>
          </section>

          {/* 추천 상품 */}
          <section className='border-t-1 border-gray-300 pt-12'>
            <h2 className='text-secondary mb-8 text-3xl font-bold xl:text-4xl'>Recommend</h2>
            {recommendProducts.length === 0 ? (
              <div className='py-12 text-center'>
                <p className='text-xl text-gray-600'>추천 상품이 없습니다.</p>
              </div>
            ) : (
              <div className='grid grid-cols-4 gap-8'>
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
