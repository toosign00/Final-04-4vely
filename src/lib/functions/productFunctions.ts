// src/lib/functions/productFunctions.ts
import { ApiResPromise, Product, ProductApiData, ProductDetail } from '@/types/product';

const API_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

// ============================================================================
// API 호출 함수들 (원본 데이터만 가져옴)
// ============================================================================

/**
 * 모든 상품 목록을 가져옵니다.
 */
export async function getAllProducts(params?: { page?: number; limit?: number; keyword?: string; sort?: string }): ApiResPromise<ProductApiData[]> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
      cache: 'force-cache',
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
export async function getProductById(productId: number): ApiResPromise<ProductApiData> {
  try {
    const res = await fetch(`${API_URL}/products/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
      cache: 'force-cache',
    });

    return res.json();
  } catch (error) {
    console.error('상품 상세 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 상품 상세 조회에 실패했습니다.',
    };
  }
}

/**
 * 베스트 상품 목록을 가져옵니다.
 */
export async function getBestProducts(limit: number = 4): ApiResPromise<ProductApiData[]> {
  try {
    const res = await fetch(`${API_URL}/products?custom.isBest=true&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
      cache: 'force-cache',
    });

    return res.json();
  } catch (error) {
    console.error('베스트 상품 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 베스트 상품 조회에 실패했습니다.',
    };
  }
}

/**
 * 신상품 목록을 가져옵니다.
 */
export async function getNewProducts(limit: number = 4): ApiResPromise<ProductApiData[]> {
  try {
    const res = await fetch(`${API_URL}/products?custom.isNew=true&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
      cache: 'force-cache',
    });

    return res.json();
  } catch (error) {
    console.error('신상품 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 신상품 조회에 실패했습니다.',
    };
  }
}

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 이미지 URL 생성
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/placeholder-plant.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath}`;
}

/**
 * API 상품 데이터를 UI용 Product 타입으로 간단 변환
 */
export function transformToProduct(productApi: ProductApiData): Product {
  return {
    id: productApi._id.toString(),
    name: productApi.name,
    image: getImageUrl(productApi.mainImages?.[0] || ''),
    price: productApi.price,
    isNew: productApi.extra?.isNew || false,
    categories: productApi.extra?.category || [],
  };
}

/**
 * API 상품 데이터를 UI용 ProductDetail 타입으로 변환
 */
export function transformToProductDetail(productApi: ProductApiData): ProductDetail {
  const baseProduct = transformToProduct(productApi);

  return {
    ...baseProduct,
    content: productApi.content || '',
    tags: productApi.extra?.tags || [],
    quantity: productApi.quantity,
    mainImages: productApi.mainImages,
    extra: productApi.extra,
  };
}

// ============================================================================
// 고수준 조합 함수들
// ============================================================================

/**
 * 모든 상품을 변환된 형태로 조회합니다.
 */
export async function getAllProductsTransformed(): Promise<Product[]> {
  try {
    const response = await getAllProducts({ limit: 12 });

    if (!response.ok) {
      console.error('상품 로딩 실패:', response.message);
      return [];
    }

    const productsData = (response.item || response.items || []) as ProductApiData[];
    return productsData.map(transformToProduct);
  } catch (error) {
    console.error('상품 로딩 실패:', error);
    return [];
  }
}

/**
 * 상품 상세 정보를 관련 데이터와 함께 조회합니다.
 */
export async function getProductDetailWithRecommendations(id: string): Promise<{
  product: ProductDetail | null;
  recommendProducts: Product[];
}> {
  try {
    const productResponse = await getProductById(parseInt(id));

    if (!productResponse.ok || !productResponse.item) {
      throw new Error('상품을 찾을 수 없습니다.');
    }

    const product = transformToProductDetail(productResponse.item);

    // 간단한 추천 로직: 베스트 상품에서 현재 상품 제외
    const recommendResponse = await getBestProducts(5);
    let recommendProducts: Product[] = [];

    if (recommendResponse.ok) {
      const recommendData = (recommendResponse.item || recommendResponse.items || []) as ProductApiData[];
      recommendProducts = recommendData
        .filter((p) => p._id.toString() !== id)
        .slice(0, 4)
        .map(transformToProduct);
    }

    return {
      product,
      recommendProducts,
    };
  } catch (error) {
    console.error('상품 데이터 로딩 실패:', error);
    return {
      product: null,
      recommendProducts: [],
    };
  }
}
