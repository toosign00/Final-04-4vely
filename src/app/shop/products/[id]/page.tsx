// src/app/shop/products/[id]/page.tsx (서버 컴포넌트)
import { getImageUrl, getProduct, getProductReviews, getProducts, getRecommendProducts } from '@/lib/api/market';
import { Product, ProductApiData, ProductDetail, Review, ReviewApiData } from '@/types/product';
import { notFound } from 'next/navigation';
import ProductDetailClient from './_components/ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 카테고리 매핑 헬퍼 함수
function mapCategoryValue(categories: string[], targetCategories: string[], defaultValue: string) {
  const found = categories?.find((cat) => targetCategories.includes(cat));
  return found || defaultValue;
}

// 서버에서 상품 데이터 가져오기
async function fetchProductData(id: string): Promise<{
  product: ProductDetail;
  recommendProducts: Product[];
  initialReviews: Review[];
  reviewsPagination: { total: number; totalPages: number };
}> {
  try {
    // 현재 상품 정보 가져오기
    const productData = await getProduct(parseInt(id));

    const categories = productData.extra?.category || [];
    const transformedProduct: ProductDetail = {
      id: productData._id.toString(),
      name: productData.name,
      image: getImageUrl(productData.mainImages?.[0] || ''),
      price: productData.price,
      category: categories[0] || '식물',
      size: mapCategoryValue(categories, ['소형', '중형', '대형'], 'error'),
      difficulty: mapCategoryValue(categories, ['쉬움', '보통', '어려움'], 'error'),
      light: mapCategoryValue(categories, ['음지', '간접광', '직사광'], 'error'),
      space: mapCategoryValue(categories, ['실외', '거실', '침실', '욕실', '주방', '사무실'], 'error'),
      season: mapCategoryValue(categories, ['봄', '여름', '가을', '겨울'], 'error'),
      isNew: productData.extra?.isNew || false,
      isBookmarked: false,
      recommend: productData.extra?.isBest || false,
      tags: productData.extra?.tags || [],
      content: productData.content || '',
      quantity: productData.quantity,
      buyQuantity: productData.buyQuantity,
      seller_id: productData.seller_id,
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt,
      mainImages: productData.mainImages,
      options: productData.options,
    };

    // 추천 상품 가져오기
    let recommendedData: ProductApiData[];
    try {
      const bestProducts = await getRecommendProducts(4);
      recommendedData = (bestProducts.item || bestProducts.items || []) as ProductApiData[];

      // 베스트 상품이 부족한 경우 일반 상품으로 보충
      if (recommendedData.length < 4) {
        const allProducts = await getProducts({ limit: 20 });
        const allProductsData = (allProducts.item || allProducts.items || []) as ProductApiData[];
        const otherProducts = allProductsData.filter((p: ProductApiData) => p._id.toString() !== id && !recommendedData.some((rec: ProductApiData) => rec._id === p._id));
        const shuffled = otherProducts.sort(() => 0.5 - Math.random());
        recommendedData = [...recommendedData, ...shuffled].slice(0, 4);
      }
    } catch (recError) {
      console.warn('추천 상품 로딩 실패, 일반 상품으로 대체:', recError);
      const allProducts = await getProducts({ limit: 20 });
      const allProductsData = (allProducts.item || allProducts.items || []) as ProductApiData[];
      const otherProducts = allProductsData.filter((p: ProductApiData) => p._id.toString() !== id);
      const shuffled = otherProducts.sort(() => 0.5 - Math.random());
      recommendedData = shuffled.slice(0, 4);
    }

    const transformedRecommendProducts: Product[] = recommendedData.map((product: ProductApiData) => {
      const productCategories = product.extra?.category || [];
      return {
        id: product._id.toString(),
        name: product.name,
        image: getImageUrl(product.mainImages?.[0] || ''),
        price: product.price,
        category: productCategories[0] || '식물',
        size: mapCategoryValue(productCategories, ['소형', '중형', '대형'], 'medium'),
        difficulty: mapCategoryValue(productCategories, ['쉬움', '보통', '어려움'], 'easy'),
        light: mapCategoryValue(productCategories, ['음지', '간접광', '직사광'], 'medium'),
        space: mapCategoryValue(productCategories, ['거실', '침실', '욕실', '주방', '사무실', '실외'], 'indoor'),
        season: mapCategoryValue(productCategories, ['봄', '여름', '가을', '겨울'], 'spring'),
        isNew: product.extra?.isNew || false,
        isBookmarked: false,
        recommend: product.extra?.isBest || false,
      };
    });

    // 초기 리뷰 데이터 가져오기 (첫 번째 페이지)
    let initialReviews: Review[] = [];
    let reviewsPagination = { total: 0, totalPages: 0 };

    try {
      const reviewsResponse = await getProductReviews(parseInt(id), {
        page: 1,
        limit: 2,
      });

      const reviewsData = (reviewsResponse.item || reviewsResponse.items || []) as ReviewApiData[];
      initialReviews = reviewsData.map((review: ReviewApiData) => ({
        id: review._id.toString(),
        userName: review.user?.name || `사용자${review.user_id}`,
        userAvatar: review.user?.image || '/images/default-avatar.jpg',
        date: new Date(review.createdAt).toLocaleDateString('ko-KR'),
        rating: review.rating || 5,
        content: review.content || '리뷰 내용이 없습니다.',
      }));

      reviewsPagination = {
        total: reviewsResponse.pagination?.total || initialReviews.length,
        totalPages: reviewsResponse.pagination?.totalPages || Math.ceil(initialReviews.length / 2),
      };
    } catch (reviewError) {
      console.warn('리뷰 로딩 실패:', reviewError);
      // 리뷰 로딩 실패 시 빈 배열로 설정
    }

    return {
      product: transformedProduct,
      recommendProducts: transformedRecommendProducts,
      initialReviews,
      reviewsPagination,
    };
  } catch (error) {
    console.error('상품 데이터 로딩 실패:', error);
    throw error;
  }
}

// 메타데이터 생성 (SEO 최적화)
export async function generateMetadata({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;
    const productData = await getProduct(parseInt(id));
    return {
      title: `${productData.name} | 4vely Plant Shop`,
      description: productData.content ? productData.content.replace(/<[^>]*>/g, '').substring(0, 160) : `${productData.name} 상품 상세 정보`,
      openGraph: {
        title: productData.name,
        description: productData.content?.replace(/<[^>]*>/g, '').substring(0, 160),
        images: [getImageUrl(productData.mainImages?.[0] || '')],
      },
    };
  } catch {
    return {
      title: '상품 상세 | 4vely Plant Shop',
      description: '식물 상품 상세 정보',
    };
  }
}

// 메인 컴포넌트
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;

    // 서버에서 모든 필요한 데이터 미리 로딩
    const { product, recommendProducts, initialReviews, reviewsPagination } = await fetchProductData(id);

    return (
      <div className='bg-surface min-h-screen'>
        {/* 클라이언트 컴포넌트에 서버 데이터 전달 */}
        <ProductDetailClient product={product} recommendProducts={recommendProducts} initialReviews={initialReviews} initialReviewsPagination={reviewsPagination} productId={id} />
      </div>
    );
  } catch (error) {
    console.error('상품 페이지 로딩 실패:', error);
    notFound();
  }
}
