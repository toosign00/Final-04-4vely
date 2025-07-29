// src/lib/actions/orderReviewServerActions.ts

'use server';

import { getAuthInfo } from '@/lib/utils/auth.server';
import { ApiRes } from '@/types/api.types';
import { ProductReply, ReplyActionResult } from '@/types/review.types';
import { revalidatePath } from 'next/cache';

/**
 * API 응답에서 받는 리뷰 데이터의 타입 정의
 * 서버에서 반환하는 리뷰 구조를 정의합니다.
 */
interface ApiReviewResponse {
  /** 리뷰 고유 ID */
  _id: number;
  /** 리뷰 내용 */
  content: string;
  /** 평점 (1-5) */
  rating: number;
  /** 추가 정보 (주문 ID 등) */
  extra?: {
    /** 주문 ID - 중복 리뷰 방지를 위한 식별자 */
    order_id?: number;
    [key: string]: unknown;
  };
  /** 리뷰 대상 상품 정보 */
  product?: {
    /** 상품 ID */
    _id: number;
    /** 상품명 */
    name: string;
    /** 상품 이미지 URL */
    image: string;
  };
  [key: string]: unknown;
}

/** API 서버 기본 URL */
const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
/** 클라이언트 ID */
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/**
 * 특정 주문의 상품별 리뷰 상태를 확인하는 서버 액션
 *
 * 이 함수는 주어진 주문 ID에 대해 사용자가 이미 작성한 리뷰가 있는 상품들을 확인합니다.
 * extra.order_id 필드를 활용하여 중복 리뷰 작성을 방지하기 위한 검사를 수행합니다.
 *
 * @param {number} orderId - 확인할 주문의 고유 ID
 * @returns {Promise<{success: boolean, reviewedProductIds: number[]}>}
 *   - success: 작업 성공 여부
 *   - reviewedProductIds: 이미 리뷰가 작성된 상품 ID 배열
 */
export async function getOrderReviewStatusAction(orderId: number): Promise<{ success: boolean; reviewedProductIds: number[] }> {
  try {
    // 사용자 인증 정보 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return {
        success: false,
        reviewedProductIds: [],
      };
    }

    // API 서버에서 사용자의 모든 리뷰 데이터 조회
    const res = await fetch(`${API_URL}/replies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${authInfo.accessToken}`,
      },
    });

    // API 요청 실패 시 처리
    if (!res.ok) {
      return {
        success: false,
        reviewedProductIds: [],
      };
    }

    // 응답 데이터 파싱
    const data: ApiRes<ApiReviewResponse[]> = await res.json();

    // API 응답이 실패인 경우 빈 배열 반환
    if (data.ok === 0) {
      return {
        success: true,
        reviewedProductIds: [],
      };
    }

    // 해당 주문에 대한 리뷰만 필터링하여 상품 ID 배열 생성
    // extra.order_id가 요청된 orderId와 일치하는 리뷰들을 찾아 상품 ID 추출
    const reviewedProductIds =
      data.ok === 1 && Array.isArray(data.item)
        ? data.item
            .filter((review: ApiReviewResponse) => {
              const reviewOrderId = review.extra?.order_id;
              return reviewOrderId === orderId;
            })
            .map((review: ApiReviewResponse) => review.product?._id)
            .filter((id): id is number => typeof id === 'number')
        : [];

    return {
      success: true,
      reviewedProductIds,
    };
  } catch (error) {
    // 네트워크 오류 또는 예상치 못한 에러 처리
    console.error('[Order Review Server Action] Network error during review status check:', error);
    return {
      success: false,
      reviewedProductIds: [],
    };
  }
}

/**
 * 리뷰를 작성하는 서버 액션
 *
 * 이 함수는 사용자가 특정 주문의 상품에 대해 리뷰를 작성할 때 호출됩니다.
 * 중복 리뷰 방지를 위한 검증과 함께 API 서버로 리뷰 데이터를 전송합니다.
 * 작성 완료 후 관련 페이지들의 캐시를 무효화하여 최신 데이터를 반영합니다.
 *
 * @param {number} productId - 리뷰를 작성할 상품의 고유 ID
 * @param {number} orderId - 상품을 구매한 주문의 고유 ID
 * @param {string} content - 사용자가 작성한 리뷰 내용
 * @param {number} rating - 사용자가 매긴 평점 (1-5 범위)
 * @returns {Promise<ReplyActionResult>} 리뷰 작성 결과 객체
 *   - success: 작성 성공 여부
 *   - message: 사용자에게 표시할 메시지
 *   - data?: 작성된 리뷰 데이터 (성공 시에만)
 */
export async function createReviewAction(productId: number, orderId: number, content: string, rating: number): Promise<ReplyActionResult> {
  try {
    // 사용자 인증 정보 확인
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return {
        success: false,
        message: '로그인이 필요합니다.',
      };
    }

    // 중복 리뷰 검사 수행
    // 같은 주문에서 이미 해당 상품에 대한 리뷰가 작성되었는지 확인
    const reviewStatus = await getOrderReviewStatusAction(orderId);
    if (reviewStatus.success && reviewStatus.reviewedProductIds.includes(productId)) {
      return {
        success: false,
        message: '이미 해당 상품에 대한 리뷰를 작성하셨습니다.',
      };
    }

    // API 서버로 리뷰 작성 요청 전송
    const res = await fetch(`${API_URL}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${authInfo.accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId, // 리뷰 대상 상품 ID
        order_id: orderId, // API 요구사항에 따른 필수 필드
        content, // 리뷰 텍스트 내용
        rating, // 1-5 범위의 평점
        extra: {
          order_id: orderId, // 중복 검사를 위한 주문 ID 저장
        },
      }),
    });

    // API 응답 데이터 파싱
    const data: ApiRes<ProductReply> = await res.json();

    // API 요청 실패 또는 서버 오류 응답 처리
    if (!res.ok || data.ok === 0) {
      return {
        success: false,
        message: '리뷰 작성에 실패했습니다.',
      };
    }

    // 관련 페이지들의 Next.js 캐시 무효화
    // 상품 상세 페이지: 새로운 리뷰가 즉시 표시되도록
    revalidatePath(`/shop/products/${productId}`);
    // 주문 내역 페이지: 리뷰 작성 상태가 업데이트되도록
    revalidatePath('/my-page/order-history');

    return {
      success: true,
      message: '리뷰가 성공적으로 작성되었습니다.',
      data: data.item,
    };
  } catch (error) {
    // 네트워크 오류 또는 예상치 못한 에러 처리
    console.error('[Create Review Server Action] Network error during review creation:', error);
    return {
      success: false,
      message: '일시적인 네트워크 문제로 리뷰 작성에 실패했습니다.',
    };
  }
}
