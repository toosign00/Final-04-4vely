// src/types/bookmark.types.ts

/**
 * 북마크 관련 타입 정의
 * @description 상품(product), 게시글(post), 사용자(user) 등 다양한 타입의 북마크를 지원
 */

import { ApiRes } from './api.types';

/**
 * 북마크 타입
 */
export type BookmarkType = 'product' | 'post' | 'user';

/**
 * 북마크 기본 인터페이스
 */
export interface BookmarkBase {
  _id: number;
  user_id: number;
  target_id: number;
  type: BookmarkType;
  memo?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 상품 북마크 인터페이스
 */
export interface ProductBookmark extends BookmarkBase {
  type: 'product';
  product?: {
    _id: number;
    name: string;
    price: number;
    mainImages?: string[];
    extra?: {
      isNew?: boolean;
      isBest?: boolean;
      category?: string[];
    };
  };
}

/**
 * 게시글 북마크 인터페이스
 */
export interface PostBookmark extends BookmarkBase {
  type: 'post';
  post?: {
    _id: number;
    title: string;
    content: string;
    user?: {
      _id: number;
      name: string;
    };
    createdAt: string;
    views?: number;
    repliesCount?: number;
  };
}

/**
 * 사용자 북마크 인터페이스
 */
export interface UserBookmark extends BookmarkBase {
  type: 'user';
  user?: {
    _id: number;
    name: string;
    email: string;
    profileImage?: string;
  };
}

/**
 * 북마크 유니온 타입
 */
export type Bookmark = ProductBookmark | PostBookmark | UserBookmark;

/**
 * 북마크 액션 응답 타입
 */
export interface BookmarkActionResponse {
  action: 'added' | 'removed';
  bookmarkId?: number;
  type?: BookmarkType;
}

/**
 * 북마크 목록 응답 타입
 */
export interface BookmarkListResponse<T extends Bookmark = Bookmark> {
  ok: number;
  item: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 북마크 추가 요청 타입
 */
export interface AddBookmarkRequest {
  target_id: number;
  type?: BookmarkType;
  memo?: string;
}

/**
 * 북마크 API 응답 타입들
 */
export type BookmarkApiResponse = ApiRes<Bookmark>;
export type BookmarkListApiResponse = ApiRes<Bookmark[]>;
export type BookmarkActionApiResponse = ApiRes<BookmarkActionResponse>;
