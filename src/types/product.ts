// src/types/product.ts

/* API 응답 타입 (백엔드에서 오는 데이터) */

// API 응답 공통 구조
export interface ApiResponse<T> {
  ok: number;
  item?: T;
  items?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

// UI에서 사용하는 상품 타입
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  // 카테고리에서 추출된 속성들
  size: '소형' | '중형' | '대형' | string;
  difficulty: '쉬움' | '보통' | '어려움' | string;
  light: '음지' | '간접광' | '직사광' | string;
  space: '실외' | '거실' | '침실' | '욕실' | '주방' | '사무실' | string;
  season: '봄' | '여름' | '가을' | '겨울' | string;
  // UI 전용 속성들
  isNew: boolean;
  isBookmarked: boolean;
  recommend: boolean;
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

/* 필터 및 정렬 타입 */

// 카테고리 필터
export interface CategoryFilter {
  size: string[];
  difficulty: string[];
  light: string[];
  space: string[];
  season: string[];
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
