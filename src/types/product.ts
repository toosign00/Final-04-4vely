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
// 상품 관련 원본 API 타입 (서버에서 받아오는 그대로)
// ============================================================================
export interface ProductExtra {
  isNew?: boolean;
  isBest?: boolean;
  tags?: string[];
  category?: string[];
  potColors?: string[];
  sort?: number;
}

export interface ProductApiData {
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
}

// ============================================================================
// UI에서 사용할 변환된 타입 (최소한만)
// ============================================================================
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  isNew: boolean;
  categories: string[]; // 필터링용
}

export interface ProductDetail extends Product {
  content: string;
  tags: string[];
  quantity: number;
  mainImages?: string[];
  extra?: ProductExtra;
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
