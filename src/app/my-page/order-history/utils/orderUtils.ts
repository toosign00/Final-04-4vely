/**
 * @fileoverview 주문 관련 유틸리티 함수들
 */

// 배송 상태 타입 정의
export type DeliveryStatus = 'preparing' | 'shipping' | 'completed';

/**
 * 주문 날짜를 한국어 형식으로 변환
 * @param dateString - 변환할 날짜 문자열 (예: "2024.01.15 11:25:30")
 * @returns 변환된 날짜 문자열 (예: "2024년 1월 15일 11시 25분")
 */
export function formatOrderDate(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') {
    console.warn('Invalid date string provided to formatOrderDate:', dateString);
    return '';
  }

  try {
    // 날짜 문자열을 Date 객체로 변환
    const date = new Date(dateString);

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format provided to formatOrderDate:', dateString);
      return '';
    }

    // 년, 월, 일, 시, 분 추출
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 한국어 형식으로 포맷팅
    return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
  } catch (error) {
    console.warn('Error formatting date in formatOrderDate:', error);
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
    console.warn('Invalid price provided to formatPrice:', price);
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
    case 'OS010':
    case 'OS020':
    case 'OS030':
      return 'preparing';
    case 'OS040':
      return 'shipping';
    case 'OS050':
    case 'OS060':
      return 'completed';
    default:
      return 'preparing';
  }
}
