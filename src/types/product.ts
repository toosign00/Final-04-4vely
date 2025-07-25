// src/types/product.types.ts

// ============================================================================
// API 응답 공통 타입
// ============================================================================
export interface ApiRes<T> {
  ok: number;
  message?: string;
  item?: T;
  items?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ApiResPromise<T> = Promise<ApiRes<T>>;

// ============================================================================
// 상품 관련 타입 (API 원본 + UI 확장)
// ============================================================================
export interface ProductExtra {
  isNew?: boolean;
  isBest?: boolean;
  tags?: string[];
  category?: string[];
  potColors?: string[];
  sort?: number;
}

export interface Product {
  _id: number;
  seller_id: number;
  name: string;
  price: number;
  shippingFees: number;
  show: boolean;
  active: boolean;
  quantity: number;
  buyQuantity: number;
  mainImages?: string[];
  content?: string;
  createdAt: string;
  updatedAt: string;
  extra?: ProductExtra;

  // UI용 추가 필드
  isBookmarked?: boolean;
}

// ============================================================================
// 필터링 관련 타입
// ============================================================================
export interface CategoryFilter {
  size: string[];
  difficulty: string[];
  light: string[];
  space: string[];
  season: string[];
  category: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

// ============================================================================
// 북마크 관련 타입
// ============================================================================
export interface BookmarkApiData {
  _id: number;
  user_id: number;
  product_id: number;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 이미지 URL 생성
 */
export function getImageUrl(imagePath?: string): string {
  if (!imagePath) return '/images/placeholder-plant.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const API_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
  return `${API_URL}${imagePath}`;
}

/**
 * 상품의 메인 이미지 URL 가져오기
 */
export function getProductImageUrl(product: Product): string {
  return getImageUrl(product.mainImages?.[0]);
}

/**
 * 상품 ID 가져오기
 */
export function getProductId(product: Product): number {
  return product._id;
}

/**
 * 상품이 신상품인지 확인
 */
export function isNewProduct(product: Product): boolean {
  return product.extra?.isNew || false;
}

/**
 * 상품이 베스트 상품인지 확인
 */
export function isBestProduct(product: Product): boolean {
  return product.extra?.isBest || false;
}

/**
 * 상품 카테고리 목록 가져오기
 */
export function getProductCategories(product: Product): string[] {
  return product.extra?.category || [];
}

/**
 * 상품 태그 목록 가져오기
 */
export function getProductTags(product: Product): string[] {
  return product.extra?.tags || [];
}

/**
 * 상품 화분 색상 목록 가져오기
 */
export function getProductPotColors(product: Product): string[] {
  return product.extra?.potColors || [];
}
