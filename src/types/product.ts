// src/types/product.ts

// type alias
export type ApiResPromise<T> = Promise<ApiRes<T>>;

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

// 상품 옵션 인터페이스
export interface ProductOption {
  name: string;
  values: string[];
}

// extra 필드 타입 정의
export interface ProductExtra {
  isNew?: boolean;
  isBest?: boolean;
  tags?: string[];
  category?: string[];
  potColors?: string[];
  sort?: number;
}

// API에서 받아오는 원본 상품 데이터 타입
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
  options?: ProductOption[];
  mainImages?: string[];
  content?: string;
  createdAt: string;
  updatedAt: string;
  extra?: ProductExtra;
}

// 메인 카테고리 타입
export type ProductMainCategory = 'plant' | 'supplies';

// 식물 속성 타입
export interface PlantAttributes {
  size: '소형' | '중형' | '대형';
  difficulty: '쉬움' | '보통' | '어려움';
  light: '음지' | '간접광' | '직사광';
  space: '실외' | '거실' | '침실' | '욕실' | '주방' | '사무실';
  season: '봄' | '여름' | '가을' | '겨울';
}

// 원예용품 속성 타입
export interface SuppliesAttributes {
  category: '화분' | '도구' | '조명';
}

// UI에서 사용하는 기본 상품 타입
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  mainCategory: ProductMainCategory;
  isNew: boolean;
  isBookmarked: boolean;
  recommend: boolean;
  originalCategories: string[]; // 필터링 용
  plantAttributes?: PlantAttributes;
  suppliesAttributes?: SuppliesAttributes;
}

// 상품 상세 페이지용 확장 타입
export interface ProductDetail extends Product {
  content: string;
  tags: string[];
  quantity: number;
  buyQuantity: number;
  seller_id: number;
  createdAt: string;
  updatedAt: string;
  mainImages?: string[];
  extra?: ProductExtra;
}

// API에서 받아오는 리뷰 데이터 타입
export interface ReviewApiData {
  _id: number;
  user_id: number;
  product_id: number;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: number;
    name: string;
    image?: string;
  };
}

// UI에서 사용하는 리뷰 타입
export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  date: string;
  rating: number;
  content: string;
}

// 필터링 관련 타입들
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
