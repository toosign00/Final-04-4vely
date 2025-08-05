/**
 * @fileoverview 북마크 관련 유틸리티 함수들
 */

/**
 * HTML 태그 제거 및 텍스트 추출
 */
export const stripHtmlTags = (htmlString: string): string => htmlString?.replace(/<[^>]*>/g, '').trim() || '상품 설명이 없습니다.';

/**
 * 이미지 경로 안전하게 추출
 */
export const extractImagePath = (imageData: { path: string } | string): string => (typeof imageData === 'string' ? imageData : imageData?.path || '');
