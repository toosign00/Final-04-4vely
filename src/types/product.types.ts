// src/types/product.types.ts

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
