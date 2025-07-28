/**
 * @fileoverview 북마크 관련 유틸리티 함수들
 */

import { BookmarkItem } from '@/types/mypageBookmark.types';

// API 서버 설정
const API_BASE_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';

/**
 * 이미지 경로를 전체 URL로 변환
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/placeholder-plant.svg';
  if (imagePath.startsWith('http')) return imagePath;

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * HTML 태그 제거 및 텍스트 추출
 */
export const stripHtmlTags = (htmlString: string): string => htmlString?.replace(/<[^>]*>/g, '').trim() || '상품 설명이 없습니다.';

/**
 * 이미지 경로 안전하게 추출
 */
export const extractImagePath = (imageData: { path: string } | string): string => (typeof imageData === 'string' ? imageData : imageData?.path || '');

/**
 * API 응답에서 북마크 배열 추출
 */
export function extractBookmarkArray(response: { ok: number; item?: BookmarkItem[]; [key: string]: unknown }): BookmarkItem[] {
  if (response.item && Array.isArray(response.item)) {
    return response.item;
  } else if (response.item && typeof response.item === 'object') {
    return [response.item as BookmarkItem];
  } else {
    const responseKeys = Object.keys(response);
    const bookmarkKeys = responseKeys.filter((key) => key !== 'ok' && key !== 'item' && key !== 'message');

    if (bookmarkKeys.length > 0) {
      return bookmarkKeys.map((key) => (response as Record<string, unknown>)[key]).filter((item): item is BookmarkItem => typeof item === 'object' && item !== null && '_id' in item && typeof (item as BookmarkItem)._id === 'number');
    }
  }

  return [];
}
