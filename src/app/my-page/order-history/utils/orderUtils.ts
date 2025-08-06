/**
 * @fileoverview 주문 관련 유틸리티 함수들
 */

import type { DeliveryStatus } from '../_types';

/**
 * 주문 날짜를 한국어 형식으로 변환
 * @param dateString - 변환할 날짜 문자열 (예: "2024.01.15 11:25:30")
 * @returns 변환된 날짜 문자열 (예: "2024년 1월 15일 11시 25분")
 */
export function formatOrderDate(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') {
    return '';
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
  } catch {
    return '';
  }
}

/**
 * 가격을 한국어 형식으로 포맷팅
 * @param price - 포맷팅할 가격 (숫자)
 * @returns 포맷팅된 가격 문자열 (예: "15,000원")
 */
export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0원';
  }

  return `${price.toLocaleString()}원`;
}

/**
 * 주문 상태 코드를 배송 상태로 변환
 * @param stateCode - 주문 상태 코드
 * @returns 배송 상태 ('preparing' | 'shipping' | 'completed')
 */
export function getDeliveryStatus(stateCode: string): DeliveryStatus {
  if (!stateCode || typeof stateCode !== 'string') {
    return 'preparing';
  }

  switch (stateCode) {
    case 'OS010': // 주문 완료
      return 'preparing';
    case 'OS035': // 배송중
      return 'shipping';
    case 'OS040': // 배송 완료
      return 'completed';
    default:
      return 'preparing';
  }
}
