// src/types/api.types.ts

/**
 * ===========================
 * API 공통 응답 타입
 * ===========================
 */

/** 기본 API 응답 구조 */
export interface ApiRes<T = any, E = any> {
  ok: number; // 1: 성공, 0: 실패
  message?: string; // 응답 메시지
  item?: T; // 단일 데이터 (성공 시)
  items?: T[]; // 배열 데이터 (성공 시)
  errors?: E; // 에러 정보 (실패 시)
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** API 응답 Promise 타입 */
export type ApiResPromise<T = any, E = any> = Promise<ApiRes<T, E>>;

/**
 * ===========================
 * 페이지네이션 관련 타입
 * ===========================
 */

/** 페이지네이션 정보 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 페이지네이션이 포함된 목록 응답 */
export interface PaginatedResponse<T> {
  ok: number;
  items: T[];
  pagination: Pagination;
}

/**
 * ===========================
 * 에러 관련 타입
 * ===========================
 */

/** 필드별 에러 */
export interface FieldErrors {
  [fieldName: string]: string;
}

/** 일반적인 에러 응답 */
export interface ErrorResponse {
  ok: 0;
  message: string;
  errors?: FieldErrors;
}
