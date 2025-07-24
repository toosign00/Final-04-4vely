// src/lib/functions/market.ts
import { ApiResPromise, Product, ProductApiData, ProductDetail, ProductMainCategory, Review, ReviewApiData } from '@/types/product';

const API_BASE_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/* 카테고리 분류 및 매핑 헬퍼 함수들 */

/**
 * 카테고리 배열에서 특정 값들 중 하나를 찾아 반환
 */
function findCategoryValue(categories: string[], targetCategories: string[], defaultValue: string = ''): string {
  const found = categories?.find((cat) => targetCategories.includes(cat));
  return found || defaultValue;
}

/**
 * 상품이 식물인지 원예용품인지 판단
 */
function determineMainCategory(categories: string[]): ProductMainCategory {
  if (categories?.includes('식물')) {
    return 'plant';
  } else if (categories?.includes('원예 용품')) {
    return 'supplies';
  }
  // 기본값: 첫 번째 카테고리가 화분/도구/조명이면 원예용품
  const suppliesCategories = ['화분', '도구', '조명'];
  if (categories?.some((cat) => suppliesCategories.includes(cat))) {
    return 'supplies';
  }
  return 'plant'; // 기본값
}

/**
 * 식물 속성 매핑
 */
function extractPlantAttributes(categories: string[]) {
  return {
    size: findCategoryValue(categories, ['소형', '중형', '대형'], '소형') as '소형' | '중형' | '대형',
    difficulty: findCategoryValue(categories, ['쉬움', '보통', '어려움'], '쉬움') as '쉬움' | '보통' | '어려움',
    light: findCategoryValue(categories, ['음지', '간접광', '직사광'], '간접광') as '음지' | '간접광' | '직사광',
    space: findCategoryValue(categories, ['실외', '거실', '침실', '욕실', '주방', '사무실'], '거실') as '실외' | '거실' | '침실' | '욕실' | '주방' | '사무실',
    season: findCategoryValue(categories, ['봄', '여름', '가을', '겨울'], '봄') as '봄' | '여름' | '가을' | '겨울',
  };
}

/**
 * 원예용품 속성 매핑
 */
function extractSuppliesAttributes(categories: string[]) {
  return {
    category: findCategoryValue(categories, ['화분', '도구', '조명'], '화분') as '화분' | '도구' | '조명',
  };
}

/* 데이터 변환 함수들 */

/**
 * API 상품 데이터를 UI용 Product 타입으로 변환
 */
function transformProductApiToProduct(productApi: ProductApiData): Product {
  const categories = productApi.extra?.category || [];
  const mainCategory = determineMainCategory(categories);

  const baseProduct: Product = {
    id: productApi._id.toString(),
    name: productApi.name,
    image: getImageUrl(productApi.mainImages?.[0] || ''),
    price: productApi.price,
    mainCategory,
    isNew: productApi.extra?.isNew || false,
    isBookmarked: false, // 초기값, 나중에 북마크 스토어에서 업데이트
    recommend: productApi.extra?.isBest || false,
    originalCategories: categories, // 필터링 용
  };

  // 카테고리별 속성 추가
  if (mainCategory === 'plant') {
    baseProduct.plantAttributes = extractPlantAttributes(categories);
  } else if (mainCategory === 'supplies') {
    baseProduct.suppliesAttributes = extractSuppliesAttributes(categories);
  }

  return baseProduct;
}

/**
 * API 상품 데이터를 UI용 ProductDetail 타입으로 변환
 */
function transformProductApiToProductDetail(productApi: ProductApiData): ProductDetail {
  console.log('=== transformProductApiToProductDetail 디버깅 ===');
  console.log('원본 API 데이터:', productApi);
  console.log('extra 데이터:', productApi.extra);
  console.log('extra.potColors:', productApi.extra?.potColors);
  console.log('mainImages 데이터:', productApi.mainImages);

  const baseProduct = transformProductApiToProduct(productApi);

  const productDetail: ProductDetail = {
    ...baseProduct,
    content: productApi.content || '',
    tags: productApi.extra?.tags || [],
    quantity: productApi.quantity,
    buyQuantity: productApi.buyQuantity,
    seller_id: productApi.seller_id,
    createdAt: productApi.createdAt,
    updatedAt: productApi.updatedAt,
    mainImages: productApi.mainImages,
    extra: productApi.extra,
  };

  console.log('변환된 ProductDetail:', productDetail);
  console.log('변환된 extra:', productDetail.extra);
  console.log('변환된 potColors:', productDetail.extra?.potColors);
  console.log('=== 디버깅 끝 ===');

  return productDetail;
}

/**
 * API 리뷰 데이터를 UI용 Review 타입으로 변환
 */
function transformReviewApiToReview(reviewApi: ReviewApiData): Review {
  return {
    id: reviewApi._id.toString(),
    userName: reviewApi.user?.name || `사용자${reviewApi.user_id}`,
    userAvatar: reviewApi.user?.image || '/images/default-avatar.jpg',
    date: new Date(reviewApi.createdAt).toLocaleDateString('ko-KR'),
    rating: reviewApi.rating || 5,
    content: reviewApi.content || '리뷰 내용이 없습니다.',
  };
}

/* 기본 API 함수들 */

/**
 * 상품 목록을 가져옵니다.
 */
export async function getProducts(params?: { page?: number; limit?: number; keyword?: string; sort?: string; custom?: Record<string, string | number | boolean> }): ApiResPromise<ProductApiData[]> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.custom) {
      Object.entries(params.custom).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(`custom.${key}`, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
    });

    return res.json();
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 상품 목록 조회에 실패했습니다.',
    };
  }
}

/**
 * 특정 상품의 상세 정보를 가져옵니다.
 */
export async function getProduct(productId: number): ApiResPromise<ProductApiData> {
  try {
    console.log('=== getProduct API 호출 ===');
    console.log('productId:', productId);

    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
    });

    const result = await res.json();
    console.log('API 응답:', result);
    console.log('=== getProduct API 끝 ===');

    return result;
  } catch (error) {
    console.error('상품 상세 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 상품 상세 조회에 실패했습니다.',
    };
  }
}

/**
 * 특정 상품의 리뷰 목록을 가져옵니다.
 */
export async function getProductReviews(productId: number, params?: { page?: number; limit?: number }): ApiResPromise<ReviewApiData[]> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/products/${productId}/replies${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
    });

    return res.json();
  } catch (error) {
    console.error('리뷰 목록 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 리뷰 목록 조회에 실패했습니다.',
    };
  }
}

/**
 * 추천 상품 목록을 가져옵니다.
 */
export async function getRecommendProducts(limit: number = 4): ApiResPromise<ProductApiData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?custom.isBest=true&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
    });

    return res.json();
  } catch (error) {
    console.error('추천 상품 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 추천 상품 조회에 실패했습니다.',
    };
  }
}

/**
 * 모든 상품을 변환된 형태로 조회합니다.
 */
export async function getAllProductsTransformed(): Promise<Product[]> {
  try {
    // 첫 번째 페이지 로드
    const response = await getProducts({ limit: 100 });

    if (!response.ok) {
      console.error('상품 로딩 실패:', response.message);
      return [];
    }

    const productsData = (response.item || response.items || []) as ProductApiData[];
    let allProducts = [...productsData];

    // 추가 페이지가 있다면 모두 가져오기
    if (response.pagination && response.pagination.totalPages > 1) {
      for (let page = 2; page <= response.pagination.totalPages; page++) {
        const additionalResponse = await getProducts({ limit: 100, page: page });
        if (additionalResponse.ok) {
          const additionalData = (additionalResponse.item || additionalResponse.items || []) as ProductApiData[];
          allProducts = [...allProducts, ...additionalData];
        }
      }
    }

    // API 데이터를 Product 타입으로 변환
    return allProducts.map(transformProductApiToProduct);
  } catch (error) {
    console.error('상품 로딩 실패:', error);
    return [];
  }
}

/**
 * 상품 상세 정보를 모든 관련 데이터와 함께 조회합니다.
 */
export async function getProductDetailWithRelatedData(id: string): Promise<{
  product: ProductDetail | null;
  recommendProducts: Product[];
  initialReviews: Review[];
  reviewsPagination: { total: number; totalPages: number };
}> {
  try {
    console.log('=== getProductDetailWithRelatedData 시작 ===');
    console.log('상품 ID:', id);

    // 현재 상품 정보 가져오기
    const productResponse = await getProduct(parseInt(id));

    if (!productResponse.ok || !productResponse.item) {
      throw new Error('상품을 찾을 수 없습니다.');
    }

    console.log('상품 응답 데이터:', productResponse.item);

    const transformedProduct = transformProductApiToProductDetail(productResponse.item);

    console.log('변환된 상품 데이터:', transformedProduct);

    // 추천 상품 로직
    const recommendedProducts = await generateSmartRecommendations(transformedProduct, id);

    const transformedRecommendProducts = recommendedProducts;

    // 초기 리뷰 데이터 가져오기 (첫 번째 페이지)
    let initialReviews: Review[] = [];
    let reviewsPagination = { total: 0, totalPages: 0 };

    const reviewsResponse = await getProductReviews(parseInt(id), { page: 1, limit: 2 });

    if (reviewsResponse.ok) {
      const reviewsData = (reviewsResponse.item || reviewsResponse.items || []) as ReviewApiData[];
      initialReviews = reviewsData.map(transformReviewApiToReview);

      reviewsPagination = {
        total: reviewsResponse.pagination?.total || initialReviews.length,
        totalPages: reviewsResponse.pagination?.totalPages || Math.ceil(initialReviews.length / 2),
      };
    }

    console.log('=== getProductDetailWithRelatedData 끝 ===');

    return {
      product: transformedProduct,
      recommendProducts: transformedRecommendProducts,
      initialReviews,
      reviewsPagination,
    };
  } catch (error) {
    console.error('상품 데이터 로딩 실패:', error);
    return {
      product: null,
      recommendProducts: [],
      initialReviews: [],
      reviewsPagination: { total: 0, totalPages: 0 },
    };
  }
}

/**
 * 상품 리뷰를 변환된 형태로 조회합니다.
 */
export async function getProductReviewsTransformed(
  productId: number,
  params?: { page?: number; limit?: number },
): Promise<{
  reviews: Review[];
  pagination: { total: number; totalPages: number };
}> {
  try {
    const reviewsResponse = await getProductReviews(productId, params);

    if (!reviewsResponse.ok) {
      return {
        reviews: [],
        pagination: { total: 0, totalPages: 0 },
      };
    }

    const reviewsData = (reviewsResponse.item || reviewsResponse.items || []) as ReviewApiData[];
    const transformedReviews = reviewsData.map(transformReviewApiToReview);

    const pagination = {
      total: reviewsResponse.pagination?.total || transformedReviews.length,
      totalPages: reviewsResponse.pagination?.totalPages || Math.ceil(transformedReviews.length / (params?.limit || 2)),
    };

    return {
      reviews: transformedReviews,
      pagination,
    };
  } catch (error) {
    console.warn('리뷰 로딩 실패:', error);
    return {
      reviews: [],
      pagination: { total: 0, totalPages: 0 },
    };
  }
}

/* 추천 상품 로직 */

/**
 * 배열에서 랜덤하게 지정된 개수만큼 선택
 */
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * 태그가 일치하는 식물 찾기
 */
function findPlantsByMatchingTags(currentProduct: ProductDetail, allPlants: Product[], count: number): Product[] {
  const currentTags = currentProduct.tags || [];

  // 태그가 겹치는 식물들을 찾되, 현재 상품은 제외
  const matchingPlants = allPlants.filter((plant) => {
    if (plant.id === currentProduct.id) return false; // 현재 상품 제외

    const plantTags = plant.originalCategories.filter((cat) => currentTags.includes(cat));
    return plantTags.length > 0; // 하나라도 태그가 일치하면 포함
  });

  // 태그 일치도에 따라 정렬 (더 많은 태그가 일치할수록 우선순위)
  matchingPlants.sort((a, b) => {
    const aMatchCount = a.originalCategories.filter((cat) => currentTags.includes(cat)).length;
    const bMatchCount = b.originalCategories.filter((cat) => currentTags.includes(cat)).length;
    return bMatchCount - aMatchCount;
  });

  // 만약 태그가 일치하는 식물이 부족하다면, 같은 카테고리 식물로 보충
  if (matchingPlants.length < count) {
    const sameCategoryPlants = allPlants.filter((plant) => plant.id !== currentProduct.id && plant.mainCategory === 'plant' && !matchingPlants.some((matched) => matched.id === plant.id));

    const additionalPlants = getRandomItems(sameCategoryPlants, count - matchingPlants.length);
    return [...matchingPlants, ...additionalPlants].slice(0, count);
  }

  return getRandomItems(matchingPlants, count);
}

/**
 * 추천 상품 생성 함수
 */
async function generateSmartRecommendations(currentProduct: ProductDetail, currentProductId: string): Promise<Product[]> {
  try {
    // 모든 상품 가져오기
    const allProductsResponse = await getProducts({ limit: 100 });

    if (!allProductsResponse.ok) {
      console.error('추천 상품용 전체 상품 로딩 실패');
      return [];
    }

    const allProductsData = (allProductsResponse.item || allProductsResponse.items || []) as ProductApiData[];

    // 추가 페이지가 있다면 모두 가져오기
    let allProducts = [...allProductsData];
    if (allProductsResponse.pagination && allProductsResponse.pagination.totalPages > 1) {
      for (let page = 2; page <= allProductsResponse.pagination.totalPages; page++) {
        const additionalResponse = await getProducts({ limit: 100, page: page });
        if (additionalResponse.ok) {
          const additionalData = (additionalResponse.item || additionalResponse.items || []) as ProductApiData[];
          allProducts = [...allProducts, ...additionalData];
        }
      }
    }

    // API 데이터를 Product 타입으로 변환하고 현재 상품 제외
    const transformedProducts = allProducts.filter((p) => p._id.toString() !== currentProductId).map(transformProductApiToProduct);

    // 카테고리별로 분류
    const plants = transformedProducts.filter((p) => p.mainCategory === 'plant');
    const supplies = transformedProducts.filter((p) => p.mainCategory === 'supplies');

    let recommendedProducts: Product[] = [];

    if (currentProduct.mainCategory === 'plant') {
      // 식물 상품인 경우
      // PC용 (4개): 1,2번째 = 원예용품 2개, 3,4번째 = 태그 매칭 식물 2개
      // 모바일용 (2개): 1번째 = 원예용품, 2번째 = 태그 매칭 식물

      const randomSupplies = getRandomItems(supplies, 2);
      const matchingPlants = findPlantsByMatchingTags(currentProduct, plants, 2);

      // PC: [원예용품1, 원예용품2, 식물1, 식물2]
      // 모바일: [원예용품1, 식물1] (첫 2개만 사용)
      recommendedProducts = [...randomSupplies, ...matchingPlants];
    } else if (currentProduct.mainCategory === 'supplies') {
      // 원예용품 상품인 경우
      // PC용 (4개): 1,2번째 = 원예용품 2개, 3,4번째 = 식물 2개
      // 모바일용 (2개): 1번째 = 원예용품, 2번째 = 식물

      const randomSupplies = getRandomItems(supplies, 2);
      const randomPlants = getRandomItems(plants, 2);

      // 모바일: [원예용품1, 식물1, 원예용품2, 식물2]
      recommendedProducts = [
        randomSupplies[0], // 1번째: 원예용품1
        randomPlants[0], // 2번째: 식물1 (모바일에서 2번째 자리)
        randomSupplies[1] || randomSupplies[0], // 3번째: 원예용품2
        randomPlants[1] || randomPlants[0], // 4번째: 식물2
      ].filter(Boolean); // undefined 제거
    }

    // 부족한 경우 랜덤으로 보충 (현재 상품 제외)
    if (recommendedProducts.length < 4) {
      const remainingProducts = transformedProducts.filter((p) => !recommendedProducts.some((rec) => rec.id === p.id));
      const additionalProducts = getRandomItems(remainingProducts, 4 - recommendedProducts.length);
      recommendedProducts = [...recommendedProducts, ...additionalProducts];
    }

    return recommendedProducts.slice(0, 4); // 최대 4개까지만
  } catch (error) {
    console.error('추천 생성 실패:', error);
    return [];
  }
}

/**
 * 이미지 URL 생성
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/placeholder-plant.jpg';

  // 이미 전체 URL인 경우
  if (imagePath.startsWith('http')) return imagePath;

  // 상대 경로인 경우 API 서버 URL과 결합
  return `${API_BASE_URL}${imagePath}`;
}
