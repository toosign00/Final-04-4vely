// src/lib/functions/productFunctions.ts
import { ApiResPromise, Product } from '@/types/product';

const API_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

// ============================================================================
// API 호출 함수들
// ============================================================================

/**
 * 모든 상품 목록을 가져옵니다.
 */
export async function getAllProducts(params?: { page?: number; limit?: number; keyword?: string; sort?: string }): ApiResPromise<Product[]> {
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
export async function getProductById(productId: number): ApiResPromise<Product> {
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
export async function getBestProducts(limit: number = 4): ApiResPromise<Product[]> {
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
export async function getNewProducts(limit: number = 4): ApiResPromise<Product[]> {
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
 * 북마크 상태가 포함된 상품 목록으로 변환
 */
export function addBookmarkStatus(products: Product[], bookmarkedIds: number[]): Product[] {
  return products.map((product) => ({
    ...product,
    isBookmarked: bookmarkedIds.includes(product._id),
  }));
}

/**
 * 북마크 상태가 포함된 단일 상품으로 변환
 */
export function addBookmarkStatusToProduct(product: Product, isBookmarked: boolean): Product {
  return {
    ...product,
    isBookmarked,
  };
}

// ============================================================================
// 고수준 조합 함수들 (서버 컴포넌트에서 사용)
// ============================================================================

/**
 * 모든 상품을 조회합니다.
 */
export async function searchAllProducts(): Promise<Product[]> {
  try {
    const response = await getAllProducts({ limit: 12 });

    if (!response.ok) {
      console.error('상품 로딩 실패:', response.message);
      return [];
    }

    return (response.item || response.items || []) as Product[];
  } catch (error) {
    console.error('상품 로딩 실패:', error);
    return [];
  }
}

/**
 * 상품 상세 정보를 관련 데이터와 함께 조회합니다.
 */
export async function getProductDetailWithRecommendations(id: string): Promise<{
  product: Product | null;
  recommendProducts: Product[];
}> {
  try {
    const productResponse = await getProductById(parseInt(id));

    if (!productResponse.ok || !productResponse.item) {
      throw new Error('상품을 찾을 수 없습니다.');
    }

    const product = productResponse.item;

    // 간단한 추천 로직: 베스트 상품에서 현재 상품 제외
    const recommendResponse = await getBestProducts(5);
    let recommendProducts: Product[] = [];

    if (recommendResponse.ok) {
      const recommendData = (recommendResponse.item || recommendResponse.items || []) as Product[];
      recommendProducts = recommendData.filter((p) => p._id.toString() !== id).slice(0, 4);
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
