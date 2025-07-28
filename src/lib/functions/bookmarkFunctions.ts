/**
 * @fileoverview 북마크 관리를 위한 함수들을 제공하는 모듈
 * @description 사용자의 북마크 목록 조회, 상품 상세 정보 조회, 이미지 URL 생성 등의 기능을 포함
 * @author 4vely Team
 * @since 2025-07-26
 */

import { ApiResPromise } from '@/types/product';

// API 서버 설정
const API_BASE_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

/**
 * 이미지 경로를 전체 URL로 변환하는 유틸리티 함수
 * @param imagePath - 변환할 이미지 경로 (상대 경로 또는 절대 경로)
 * @returns 전체 이미지 URL 또는 기본 placeholder 이미지 경로
 * @example
 * ```typescript
 * getImageUrl('/files/sample.jpg') // 'https://api.server.com/files/sample.jpg'
 * getImageUrl('') // '/images/placeholder-plant.svg'
 * ```
 */
function getImageUrl(imagePath: string): string {
  // 빈 경로인 경우 기본 placeholder 이미지 반환
  if (!imagePath) {
    return '/images/placeholder-plant.svg';
  }

  // 이미 완전한 URL인 경우 그대로 반환
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // 경로가 슬래시로 시작하지 않으면 추가하여 절대 경로로 만들기
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // API 서버 URL과 결합하여 완전한 URL 생성
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * API에서 반환되는 북마크 아이템의 원본 데이터 구조
 * @interface BookmarkItem
 */
export interface BookmarkItem {
  /** 북마크 고유 ID */
  _id: number;
  /** 북마크를 생성한 사용자 ID */
  user_id: number;
  /** 사용자가 작성한 북마크 메모 */
  memo: string;
  /** 북마크 생성일 (YYYY.MM.DD HH:mm:ss 형식) */
  createdAt: string;
  /** 북마크된 상품 정보 */
  product: {
    /** 상품 고유 ID */
    _id: number;
    /** 상품명 */
    name: string;
    /** 상품 가격 */
    price: number;
    /** 재고 수량 */
    quantity: number;
    /** 판매된 수량 */
    buyQuantity: number;
    /** 상품 이미지 정보 (북마크 API에서 제공되는 기본 이미지) */
    image: {
      /** 이미지 URL */
      url: string;
      /** 파일명 */
      fileName: string;
      /** 원본 파일명 */
      orgName: string;
    };
    /** 상품 추가 정보 */
    extra: {
      /** 신상품 여부 */
      isNew: boolean;
      /** 베스트 상품 여부 */
      isBest: boolean;
      /** 상품 카테고리 배열 */
      category: string[];
      /** 정렬 순서 */
      sort: number;
    };
  };
}

/**
 * 북마크 목록 API 응답 구조
 * @interface BookmarkListResponse
 */
export interface BookmarkListResponse {
  /** API 호출 성공 여부 (1: 성공, 0: 실패) */
  ok: number;
  /** 북마크 아이템 배열 */
  item: BookmarkItem[];
}

/**
 * 사용자의 북마크 목록을 조회하는 기본 함수 (클라이언트에서 사용)
 * @param type - 북마크 타입 ('product' | 'user' | 'post')
 * @param accessToken - 사용자 인증 토큰 (선택사항, 없으면 로그인 필요 오류 반환)
 * @returns Promise<ApiResPromise<BookmarkItem[]>> - API 응답 객체
 * @throws 네트워크 오류 시 에러 메시지와 함께 실패 응답 반환
 * @example
 * ```typescript
 * const result = await getBookmarks('product', userToken);
 * if (result.ok) {
 *   console.log('북마크 목록:', result.item);
 * }
 * ```
 */
export async function getBookmarks(type: 'product' | 'user' | 'post', accessToken?: string): ApiResPromise<BookmarkItem[]> {
  try {
    // 인증 토큰 유효성 검사
    if (!accessToken) {
      return {
        ok: 0,
        message: '로그인이 필요합니다.',
      };
    }

    // API 요청 실행
    const response = await fetch(`${API_BASE_URL}/bookmarks/${type}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // JSON 응답 반환
    return await response.json();
  } catch {
    // 네트워크 오류 등 예외 상황 처리
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 북마크 목록 조회에 실패했습니다.',
    };
  }
}

/**
 * 상품 상세 정보 타입 정의 (API 응답 기반)
 * @interface ProductDetail
 */
interface ProductDetail {
  _id: number;
  name: string;
  price: number;
  content: string;
  mainImages: Array<{ path: string } | string>;
}

/**
 * 개별 상품의 상세 정보를 조회하는 내부 함수
 * @param productId - 조회할 상품의 고유 ID
 * @returns Promise<ProductDetail | null> - 상품 상세 정보 또는 null (조회 실패 시)
 * @description
 * - 북마크된 상품의 실제 이미지와 상세 설명을 가져오기 위해 사용
 * - 메인 이미지 배열의 첫 번째 이미지를 우선적으로 사용
 * - API 호출 실패 시 null을 반환하여 graceful degradation 지원
 * @example
 * ```typescript
 * const productDetail = await getProductDetail(123);
 * if (productDetail?.mainImages?.length > 0) {
 *   const imageUrl = getImageUrl(productDetail.mainImages[0]);
 * }
 * ```
 */
async function getProductDetail(productId: number): Promise<ProductDetail | null> {
  try {
    // 상품 상세 정보 API 호출
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
      },
    });

    const result = await response.json();

    // API 응답 성공 시 상품 데이터 반환, 실패 시 null 반환
    return result.ok ? result.item : null;
  } catch {
    // 네트워크 오류 등 예외 상황에서 null 반환
    return null;
  }
}

/**
 * UI 컴포넌트에서 사용하기 위해 변환된 북마크 아이템 타입
 * @interface TransformedBookmarkItem
 * @description
 * - API에서 받은 원본 데이터를 프론트엔드에서 사용하기 쉽게 변환한 구조
 * - 실제 상품 이미지와 상세 설명이 포함됨
 * - ProductCard 컴포넌트와 호환되는 인터페이스
 */
export interface TransformedBookmarkItem {
  /** 상품 고유 ID */
  id: number;
  /** 상품 이미지 완전한 URL (mainImages 첫 번째 또는 placeholder) */
  imageUrl: string;
  /** 상품명 */
  name: string;
  /** 상품 상세 설명 (HTML 태그 제거된 텍스트) */
  description: string;
  /** 상품 가격 */
  price: number;
}

/**
 * HTML 태그를 제거하고 순수 텍스트만 추출하는 유틸리티 함수
 * @param htmlString - HTML이 포함된 문자열
 * @returns 태그가 제거된 순수 텍스트
 * @description 상품의 content 필드에서 HTML을 제거하여 설명 텍스트만 추출
 */
function stripHtmlTags(htmlString: string): string {
  if (!htmlString) return '';

  const cleanText = htmlString.replace(/<[^>]*>/g, '').trim();
  return cleanText || '상품 설명이 없습니다.';
}

/**
 * 이미지 경로를 안전하게 추출하는 유틸리티 함수
 * @param imageData - 이미지 객체 또는 문자열
 * @returns 추출된 이미지 경로
 * @description mainImages 배열의 요소가 객체 또는 문자열일 수 있어서 안전하게 처리
 */
function extractImagePath(imageData: { path: string } | string): string {
  if (typeof imageData === 'string') {
    return imageData;
  }
  return imageData?.path || '';
}

/**
 * 서버에서 사용자의 북마크 목록을 조회하고 UI에 최적화된 형태로 변환하는 메인 함수
 * @param type - 북마크 타입 ('product' | 'user' | 'post')
 * @returns Promise<서버 응답 객체> - 성공/실패 여부와 변환된 데이터 또는 오류 메시지
 * @description
 * - 서버 환경에서 쿠키로부터 인증 정보를 추출하여 북마크 조회
 * - product 타입의 경우 각 상품의 상세 정보를 추가로 조회하여 실제 이미지와 설명 포함
 * - 모든 API 호출을 병렬로 처리하여 성능 최적화
 * - UI 컴포넌트에서 바로 사용할 수 있는 형태로 데이터 변환
 * @performance Promise.all을 사용하여 여러 상품의 상세 정보를 병렬로 조회
 * @example
 * ```typescript
 * const result = await getBookmarksFromServer('product');
 * if (result.success) {
 *   // result.data는 TransformedBookmarkItem[] 타입
 *   return <BookmarkList bookmarks={result.data} />;
 * }
 * ```
 */
export async function getBookmarksFromServer(type: 'product' | 'user' | 'post'): Promise<{
  success: boolean;
  data?: TransformedBookmarkItem[];
  error?: string;
}> {
  try {
    // 서버 환경에서 사용자 인증 정보 추출
    const { getAuthInfo } = await import('@/lib/utils/auth.server');
    const authInfo = await getAuthInfo();

    // 인증 정보 유효성 검사
    if (!authInfo) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      };
    }

    // 북마크 목록 조회
    const response = await getBookmarks(type, authInfo.accessToken);

    if (!response.ok) {
      return {
        success: false,
        error: response.message || '북마크 목록을 불러올 수 없습니다.',
      };
    }

    // API 응답 데이터 정규화 (객체 형태를 배열로 변환)
    const bookmarkArray = response.item || Object.values(response).filter((item): item is BookmarkItem => typeof item === 'object' && item !== null && '_id' in item);

    // product 타입인 경우 상품 상세 정보 조회 및 데이터 변환
    if (type === 'product') {
      return {
        success: true,
        data: await transformProductBookmarks(bookmarkArray as BookmarkItem[]),
      };
    }

    // user, post 타입은 아직 구현하지 않음
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    // 예외 상황 처리
    console.error('북마크 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '북마크 목록 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 상품 북마크 배열을 UI 컴포넌트용 형태로 변환하는 함수
 * @param bookmarks - 원본 북마크 아이템 배열
 * @returns Promise<TransformedBookmarkItem[]> - 변환된 북마크 아이템 배열
 * @description
 * - 각 북마크에 대해 상품 상세 정보를 병렬로 조회
 * - 실제 상품 이미지와 설명을 포함한 완전한 데이터 생성
 * - 에러가 발생한 개별 아이템에 대해서도 기본값으로 처리하여 전체 목록이 깨지지 않도록 보장
 * @performance Promise.all을 사용하여 모든 상품 상세 정보를 병렬로 조회
 */
async function transformProductBookmarks(bookmarks: BookmarkItem[]): Promise<TransformedBookmarkItem[]> {
  return Promise.all(
    bookmarks.map(async (bookmark): Promise<TransformedBookmarkItem> => {
      // 기본값 설정
      const defaultValues = {
        id: bookmark.product?._id || 0,
        name: bookmark.product?.name || '상품명 없음',
        price: bookmark.product?.price || 0,
        description: '상품 설명이 없습니다.',
        imageUrl: getImageUrl(''), // 기본 placeholder 이미지
      };

      // 상품 ID가 없는 경우 기본값 반환
      if (!bookmark.product?._id) {
        return defaultValues;
      }

      try {
        // 상품 상세 정보 조회
        const productDetail = await getProductDetail(bookmark.product._id);

        if (!productDetail) {
          return defaultValues;
        }

        // 상품 이미지 URL 생성
        let imageUrl = defaultValues.imageUrl;
        if (productDetail.mainImages?.length > 0) {
          const imagePath = extractImagePath(productDetail.mainImages[0]);
          if (imagePath) {
            imageUrl = getImageUrl(imagePath);
          }
        }

        return {
          id: defaultValues.id,
          name: productDetail.name || defaultValues.name,
          price: productDetail.price || defaultValues.price,
          description: stripHtmlTags(productDetail.content),
          imageUrl,
        };
      } catch (error) {
        // 개별 상품 조회 실패 시 기본값 반환 (전체 목록이 실패하지 않도록)
        console.warn(`상품 ${bookmark.product._id} 상세 정보 조회 실패:`, error);
        return defaultValues;
      }
    }),
  );
}
