// src/lib/api/market.ts
import { ApiResponse, ProductApiData, ReviewApiData } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_SERVER || 'https://fesp-api.koyeb.app/market';

/* HTTP 클라이언트 래퍼 */

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': 'febc13-final04-emjf',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/* 상품 관련 API 함수들 */

// 상품 목록 조회
export async function getProducts(params?: { page?: number; limit?: number; keyword?: string; sort?: string; custom?: Record<string, string | number | boolean> }): Promise<ApiResponse<ProductApiData[]>> {
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

  return apiRequest<ProductApiData[]>(endpoint);
}

// 상품 상세 조회
export async function getProduct(productId: number): Promise<ProductApiData> {
  const response = await apiRequest<ProductApiData>(`/products/${productId}`);

  if (!response.item) {
    throw new Error('상품을 찾지 못했습니다!');
  }

  return response.item;
}

// 상품 리뷰 조회
export async function getProductReviews(
  productId: number,
  params?: {
    page?: number;
    limit?: number;
  },
): Promise<ApiResponse<ReviewApiData[]>> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const queryString = searchParams.toString();
  const endpoint = `/products/${productId}/replies${queryString ? `?${queryString}` : ''}`;

  return apiRequest<ReviewApiData[]>(endpoint);
}

// 추천 상품 조회 (베스트 상품)
export async function getRecommendProducts(limit: number = 4): Promise<ApiResponse<ProductApiData[]>> {
  return apiRequest<ProductApiData[]>(`/products?custom.isBest=true&limit=${limit}`);
}

/* 유틸리티 함수들 */

// 이미지 URL 헬퍼 함수
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/placeholder-plant.jpg';

  // 이미 전체 URL인 경우
  if (imagePath.startsWith('http')) return imagePath;

  // 상대 경로인 경우 API 서버 URL과 결합
  return `${API_BASE_URL}${imagePath}`;
}
