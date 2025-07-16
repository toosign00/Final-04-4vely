// src/types/product.ts

/**
 * 상품 데이터 타입
 */
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  size: 'small' | 'medium' | 'large';
  difficulty: 'easy' | 'medium' | 'hard';
  light: 'low' | 'medium' | 'high';
  space: 'indoor' | 'outdoor' | 'bedroom' | 'bathroom' | 'kitchen' | 'office';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  isNew: boolean;
  isBookmarked: boolean;
  recommend: boolean;
}

/**
 * 카테고리 필터 상태 타입
 */
export interface CategoryFilter {
  size: string[];
  difficulty: string[];
  light: string[];
  space: string[];
  season: string[];
}

/**
 * 정렬 옵션 타입
 */
export interface SortOption {
  value: string;
  label: string;
}
