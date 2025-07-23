// src/types/product.ts

/* API 응답 타입 (백엔드에서 오는 데이터) */

// API 응답 공통 구조 (강사님 스타일)
export interface ApiRes<T> {
  ok: number; // 1: 성공, 0: 실패
  message?: string; // 에러 메시지 (실패 시 필수)
  item?: T; // 단일 아이템
  items?: T[]; // 배열 아이템
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Promise 타입
export type ApiResPromise<T> = Promise<ApiRes<T>>;

// 기존 호환성을 위한 별칭
export type ApiResponse<T> = ApiRes<T>;

// 상품 API 데이터 (백엔드에서 오는 원본 구조)
export interface ProductApiData {
  _id: number;
  seller_id: number;
  price: number;
  shippingFees?: number;
  show?: boolean;
  active?: boolean;
  quantity: number;
  buyQuantity: number;
  name: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  mainImages: string[];
  options?: Array<{
    name: string;
    values: string[];
  }>;
  extra?: {
    isNew?: boolean;
    isBest?: boolean;
    category?: string[];
    tags?: string[];
    sort?: number;
  };
}

// 리뷰 API 데이터
export interface ReviewApiData {
  _id: number;
  user_id: number;
  product_id: number;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    image?: string;
  };
}

/* UI에서 사용하는 타입 (변환된 데이터) */

// 기본 상품 카테고리 타입
export type ProductMainCategory = 'plant' | 'supplies';

// UI에서 사용하는 상품 타입
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  mainCategory: ProductMainCategory; // 주 카테고리 (식물/원예용품)

  // 공통 속성
  isNew: boolean;
  isBookmarked: boolean;
  recommend: boolean;

  // 원본 카테고리 배열 (필터링용)
  originalCategories: string[];

  // 식물 전용 속성 (식물일 때만 유효)
  plantAttributes?: {
    size: '소형' | '중형' | '대형';
    difficulty: '쉬움' | '보통' | '어려움';
    light: '음지' | '간접광' | '직사광';
    space: '실외' | '거실' | '침실' | '욕실' | '주방' | '사무실';
    season: '봄' | '여름' | '가을' | '겨울';
  };

  // 원예용품 전용 속성 (원예용품일 때만 유효)
  suppliesAttributes?: {
    category: '화분' | '도구' | '조명';
  };
}

// 상품 상세 정보 (Product 확장)
export interface ProductDetail extends Product {
  content?: string;
  tags?: string[];
  quantity?: number;
  buyQuantity?: number;
  seller_id?: number;
  createdAt?: string;
  updatedAt?: string;
  mainImages?: string[];
  options?: Array<{
    name: string;
    values: string[];
  }>;
}

// 리뷰 타입 (UI용)
export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  date: string;
  rating: number;
  content: string;
}

/* 필터 타입 */

// 식물 필터
export interface PlantFilter {
  size: string[];
  difficulty: string[];
  light: string[];
  space: string[];
  season: string[];
}

// 원예용품 필터
export interface SuppliesFilter {
  category: string[];
}

// 통합 필터 (카테고리별로 조건부 사용)
export interface CategoryFilter {
  // 식물 필터
  size: string[];
  difficulty: string[];
  light: string[];
  space: string[];
  season: string[];
  // 원예용품 필터
  category: string[];
}

// 정렬 옵션
export interface SortOption {
  value: string;
  label: string;
}

/* 장바구니 및 주문 타입 */

// 장바구니 아이템
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  color?: string;
  selectedOptions?: Record<string, string | number | boolean>;
}

// 주문 정보
export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    detailAddress: string;
    zipCode: string;
  };
  paymentMethod: string;
}

/* 기타 타입 */

// 북마크
export interface Bookmark {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
}

// 사용자
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: 'user' | 'seller' | 'admin';
  createdAt: string;
  updatedAt: string;
}
