// src/lib/functions/shop/productClientFunctions.ts

/**
 * 상품 클라이언트 함수
 * @description 클라이언트 컴포넌트에서 사용하는 상품 관련 API 함수들
 * @module productClientFunctions
 */

import { ApiResPromise, Product } from '@/types/product.types';

const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/**
 * API 요청을 위한 기본 헤더를 생성합니다
 * @private
 * @param {string} token - 인증 토큰 (선택)
 * @returns {HeadersInit} 헤더 객체
 */
function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'client-id': CLIENT_ID,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * 모든 상품 목록을 가져옵니다
 * @param {Object} params - 조회 파라미터
 * @param {number} params.page - 페이지 번호
 * @param {number} params.limit - 페이지당 항목 수
 * @param {string} params.keyword - 검색어
 * @param {string} params.sort - 정렬 기준
 * @returns {Promise<ApiResPromise<Product[]>>} 상품 목록
 * @example
 * // 기본 조회
 * const products = await getAllProducts();
 *
 * // 검색 및 정렬
 * const products = await getAllProducts({
 *   keyword: '몬스테라',
 *   sort: 'price-low',
 *   limit: 20
 * });
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
      headers: getHeaders(),
    });

    return res.json();
  } catch {
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 상품 목록 조회에 실패했습니다.',
    };
  }
}

/**
 * 특정 상품의 상세 정보를 가져옵니다
 * @param {number} productId - 상품 ID
 * @returns {Promise<ApiResPromise<Product>>} 상품 상세 정보
 * @example
 * const product = await getProductById(123);
 * if (product.ok) {
 *   console.log(product.item.name);
 * }
 */
export async function getProductById(productId: number): ApiResPromise<Product> {
  try {
    const res = await fetch(`${API_URL}/products/${productId}`, {
      headers: getHeaders(),
    });

    return res.json();
  } catch {
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 상품 상세 조회에 실패했습니다.',
    };
  }
}

/**
 * 베스트 상품 목록을 가져옵니다
 * @param {number} limit - 조회할 상품 수
 * @returns {Promise<ApiResPromise<Product[]>>} 베스트 상품 목록
 * @example
 * const bestProducts = await getBestProducts(8);
 */
export async function getBestProducts(limit: number = 4): ApiResPromise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?custom.isBest=true&limit=${limit}`, {
      headers: getHeaders(),
    });

    return res.json();
  } catch {
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 베스트 상품 조회에 실패했습니다.',
    };
  }
}

/**
 * 신상품 목록을 가져옵니다
 * @param {number} limit - 조회할 상품 수
 * @returns {Promise<ApiResPromise<Product[]>>} 신상품 목록
 * @example
 * const newProducts = await getNewProducts(12);
 */
export async function getNewProducts(limit: number = 4): ApiResPromise<Product[]> {
  try {
    const params = new URLSearchParams({
      custom: JSON.stringify({ 'extra.isNew': true }),

      // 불러올 상품 개수 제한
      limit: limit.toString(),
    });

    // 신상품만 필터링된 목록 반환
    const res = await fetch(`${API_URL}/products?${params}`, {
      headers: getHeaders(),
    });

    return res.json();
  } catch {
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 신상품 조회에 실패했습니다.',
    };
  }
}

/**
 * 카테고리별 상품 목록을 가져옵니다
 * @param {string} category - 카테고리명
 * @param {Object} options - 추가 옵션
 * @returns {Promise<ApiResPromise<Product[]>>} 카테고리 상품 목록
 * @example
 * // 식물 카테고리 상품 조회
 * const plants = await getProductsByCategory('식물', { limit: 12 });
 *
 * // 화분 카테고리 상품 조회 (정렬 포함)
 * const pots = await getProductsByCategory('화분', {
 *   limit: 12,
 *   sort: 'price-low'
 * });
 */
export async function getProductsByCategory(category: string, options?: { limit?: number; sort?: string }): ApiResPromise<Product[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('custom.category', category);

    if (options?.limit) searchParams.append('limit', options.limit.toString());
    if (options?.sort) searchParams.append('sort', options.sort);

    const res = await fetch(`${API_URL}/products?${searchParams}`, {
      headers: getHeaders(),
    });

    return res.json();
  } catch {
    return {
      ok: 0,
      message: `일시적인 네트워크 문제로 ${category} 상품 조회에 실패했습니다.`,
    };
  }
}

/**
 * 상품 검색을 수행합니다
 * @param {string} keyword - 검색어
 * @param {Object} options - 검색 옵션
 * @returns {Promise<ApiResPromise<Product[]>>} 검색 결과
 * @example
 * // 간단한 검색
 * const results = await searchProducts('몬스테라');
 *
 * // 상세 검색
 * const results = await searchProducts('선인장', {
 *   category: '식물',
 *   minPrice: 10000,
 *   maxPrice: 50000,
 *   sort: 'price-low'
 * });
 */
export async function searchProducts(
  keyword: string,
  options?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    limit?: number;
  },
): ApiResPromise<Product[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('keyword', keyword);

    if (options?.category) searchParams.append('custom.category', options.category);
    if (options?.minPrice) searchParams.append('minPrice', options.minPrice.toString());
    if (options?.maxPrice) searchParams.append('maxPrice', options.maxPrice.toString());
    if (options?.sort) searchParams.append('sort', options.sort);
    if (options?.limit) searchParams.append('limit', options.limit.toString());

    const res = await fetch(`${API_URL}/products?${searchParams}`, {
      headers: getHeaders(),
    });

    return res.json();
  } catch {
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 상품 검색에 실패했습니다.',
    };
  }
}
