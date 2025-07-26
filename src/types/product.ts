// src/types/product.ts

// ============================================================================
// 상품 관련 타입 (API 원본 + UI 확장)
// ============================================================================

// 북마크 관련 타입
export type { Bookmark as BookmarkItem } from './bookmark.types';

export type ProductCategory = 'new' | 'plant' | 'supplies';

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

  // 북마크 관련 (로그인된 사용자에게만 제공)
  isBookmarked?: boolean;
  myBookmarkId?: number; // 북마크된 경우에만 존재하는 북마크 ID
}

/**
 * 페이지네이션 타입 (API 응답에 포함될 수 있음)
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 배열 응답을 위한 확장 타입
 * ApiRes를 확장하지 않고 별도로 정의
 */
export interface ApiArrayResponse<T> {
  ok: 1;
  item: T[];
  pagination?: Pagination;
}

/**
 * 북마크 액션 응답 타입
 */
export interface BookmarkActionResponse {
  action: 'added' | 'removed';
  bookmarkId?: number;
}

export type { ApiRes, ApiResPromise } from './api.types';

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
 * 상품이 북마크되어 있는지 확인 (로그인된 사용자만)
 */
export function isBookmarked(product: Product): boolean {
  return !!product.myBookmarkId;
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
