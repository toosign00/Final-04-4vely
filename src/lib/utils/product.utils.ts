import { Product } from '@/types/product.types';

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 이미지 URL 생성
 */
export function getImageUrl(imagePath?: string): string {
  if (!imagePath) return '/images/placeholder-plant.jpg';
  if (imagePath.startsWith('http')) return imagePath;

  // imagePath가 /로 시작하지 않으면 /를 추가
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return normalizedPath;
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
