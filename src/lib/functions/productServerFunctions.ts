// src/lib/functions/productServerFunctions.ts
import { ApiResPromise, Product } from '@/types/product';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

// ============================================================================
// 서버 컴포넌트에서만 사용하는 함수들
// ============================================================================

/**
 * 서버에서 사용자의 액세스 토큰을 가져옵니다.
 */
async function getServerAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userAuthCookie = cookieStore.get('user-auth')?.value;

    if (!userAuthCookie) return null;

    const userData = JSON.parse(userAuthCookie);
    return userData?.state?.user?.token?.accessToken || null;
  } catch (error) {
    console.error('서버 토큰 파싱 오류:', error);
    return null;
  }
}

/**
 * 특정 상품의 북마크 정보를 조회합니다.
 */
async function getProductBookmark(productId: number, accessToken: string): Promise<any | null> {
  try {
    console.log(`[서버 북마크 조회] 상품 ID: ${productId}`);

    const res = await fetch(`${API_URL}/bookmarks/product/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-cache', // 캐시 완전 비활성화
    });

    console.log(`[서버 북마크 조회] 상품 ${productId} API 응답 상태: ${res.status}`);

    if (res.ok) {
      const data = await res.json();
      console.log(`[서버 북마크 조회] 상품 ${productId} 응답:`, {
        ok: data.ok,
        hasItem: !!data.item,
        bookmarkId: data.item?._id,
      });

      if (data.ok && data.item) {
        console.log(`[서버 북마크 조회] 상품 ${productId} 북마크 발견: ID=${data.item._id}`);
        return data.item;
      } else {
        console.log(`[서버 북마크 조회] 상품 ${productId} 북마크 없음 (data.ok=false)`);
      }
    } else if (res.status === 404) {
      // 404는 북마크가 없다는 정상적인 응답
      console.log(`[서버 북마크 조회] 상품 ${productId} 북마크 없음 (404)`);
    } else {
      const errorData = await res.json();
      console.error(`[서버 북마크 조회] 상품 ${productId} API 오류 (${res.status}):`, errorData);
    }

    return null;
  } catch (error) {
    console.error(`[서버 북마크 조회] 상품 ${productId} 네트워크 오류:`, error);
    return null;
  }
}

/**
 * 서버에서 모든 상품 목록을 가져옵니다. (북마크 정보 포함)
 */
export async function getServerAllProducts(params?: { page?: number; limit?: number; keyword?: string; sort?: string }): ApiResPromise<Product[]> {
  try {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.sort) searchParams.append('sort', params.sort);

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    // 서버에서 토큰 가져오기
    const accessToken = await getServerAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'client-id': CLIENT_ID,
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      headers,
      cache: 'no-cache', // 북마크 상태 변경 반영을 위해 캐시 비활성화
    });

    const data = await res.json();

    if (!res.ok) {
      return data;
    }

    // 로그인된 사용자인 경우 각 상품의 북마크 정보 추가
    if (accessToken && Array.isArray(data.item)) {
      console.log(`[서버 상품 목록] ${data.item.length}개 상품의 북마크 정보 조회 시작`);

      // 병렬로 모든 상품의 북마크 정보 조회
      const productsWithBookmarks = await Promise.all(
        data.item.map(async (product: Product) => {
          const bookmark = await getProductBookmark(product._id, accessToken);

          const updatedProduct = {
            ...product,
            myBookmarkId: bookmark?._id || undefined,
            isBookmarked: !!bookmark,
          };

          console.log(`[서버 상품 목록] 상품 ${product._id} (${product.name}) 북마크:`, {
            원본북마크ID: bookmark?._id,
            추가된myBookmarkId: updatedProduct.myBookmarkId,
            isBookmarked: updatedProduct.isBookmarked,
          });

          return updatedProduct;
        }),
      );

      data.item = productsWithBookmarks;
      console.log(`[서버 상품 목록] 북마크 정보 추가 완료`);

      // 북마크된 상품 개수 로그
      const bookmarkedCount = productsWithBookmarks.filter((p) => p.myBookmarkId).length;
      console.log(`[서버 상품 목록] 총 ${productsWithBookmarks.length}개 중 ${bookmarkedCount}개 북마크됨`);
    }

    return data;
  } catch (error) {
    console.error('서버 상품 목록 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 상품 목록 조회에 실패했습니다.',
    };
  }
}

/**
 * 서버에서 특정 상품의 상세 정보를 가져옵니다. (북마크 정보 포함)
 */
export async function getServerProductById(productId: number): ApiResPromise<Product> {
  try {
    console.log(`[서버 상품 상세 조회] 상품 ID: ${productId}`);

    // 서버에서 토큰 가져오기
    const accessToken = await getServerAccessToken();
    console.log(`[서버 상품 상세 조회] 토큰 존재: ${!!accessToken}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'client-id': CLIENT_ID,
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // 상품 정보와 북마크 정보를 병렬로 조회
    const [productRes, bookmark] = await Promise.all([
      fetch(`${API_URL}/products/${productId}`, {
        headers,
        cache: 'no-cache', // 북마크 상태 변경 반영을 위해 캐시 비활성화
      }),
      accessToken ? getProductBookmark(productId, accessToken) : null,
    ]);

    console.log(`[서버 상품 상세 조회] API 응답 상태: ${productRes.status}`);

    const data = await productRes.json();
    console.log(`[서버 상품 상세 조회] API 응답:`, {
      ok: data.ok,
      hasItem: !!data.item,
    });

    if (!productRes.ok) {
      return data;
    }

    // 북마크 정보 추가 (중복 조회 방지)
    if (data.item) {
      console.log('[서버 상품 상세 조회] 북마크 정보 추가:', {
        북마크존재: !!bookmark,
        북마크ID: bookmark?._id,
      });

      data.item = {
        ...data.item,
        myBookmarkId: bookmark?._id || undefined,
        isBookmarked: !!bookmark,
      };

      console.log('[서버 상품 상세 조회] 최종 상품 데이터:', {
        상품ID: data.item._id,
        상품명: data.item.name,
        myBookmarkId: data.item.myBookmarkId,
        isBookmarked: data.item.isBookmarked,
      });
    }

    return data;
  } catch (error) {
    console.error('서버 상품 상세 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 상품 상세 조회에 실패했습니다.',
    };
  }
}

// ============================================================================
// 고수준 조합 함수들 (서버 컴포넌트에서 사용)
// ============================================================================

/**
 * 서버에서 모든 상품을 조회합니다.
 * 로그인된 사용자의 경우 myBookmarkId가 포함된 상태로 반환됩니다.
 */
export async function searchAllProducts(): Promise<Product[]> {
  try {
    const response = await getServerAllProducts({ limit: 100 });

    if (!response.ok) {
      console.error('상품 로딩 실패:', response.message);
      return [];
    }

    return (response.item || response.items || []) as Product[];
  } catch (error) {
    console.error('상품 로딩 실패:', error);
    return [];
  }
}

/**
 * 서버에서 상품 상세 정보를 관련 데이터와 함께 조회합니다.
 * 로그인된 사용자의 경우 myBookmarkId가 포함된 상태로 반환됩니다.
 */
export async function getProductDetailWithRecommendations(id: string): Promise<{
  product: Product | null;
  recommendProducts: Product[];
}> {
  try {
    const productResponse = await getServerProductById(parseInt(id));

    if (!productResponse.ok || !productResponse.item) {
      throw new Error('상품을 찾을 수 없습니다.');
    }

    const product = productResponse.item;

    // 간단한 추천 로직: 베스트 상품에서 현재 상품 제외
    const recommendResponse = await getBestProducts(5);
    let recommendProducts: Product[] = [];

    if (recommendResponse.ok) {
      const recommendData = (recommendResponse.item || recommendResponse.items || []) as Product[];
      recommendProducts = recommendData.filter((p) => p._id.toString() !== id).slice(0, 4);
    }

    return {
      product,
      recommendProducts,
    };
  } catch (error) {
    console.error('상품 데이터 로딩 실패:', error);
    return {
      product: null,
      recommendProducts: [],
    };
  }
}

/**
 * 서버에서 베스트 상품 목록을 가져옵니다.
 */
export async function getBestProducts(limit: number = 4): ApiResPromise<Product[]> {
  try {
    // 서버에서 토큰 가져오기
    const accessToken = await getServerAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'client-id': CLIENT_ID,
    };

    // 토큰이 있으면 Authorization 헤더 추가
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}/products?custom.isBest=true&limit=${limit}`, {
      headers,
      cache: 'no-cache', // 북마크 상태 변경 반영을 위해 캐시 비활성화
    });

    const data = await res.json();

    if (!res.ok) {
      return data;
    }

    // 로그인된 사용자인 경우 각 상품의 북마크 정보 추가
    if (accessToken && Array.isArray(data.item)) {
      console.log(`[서버 베스트 상품] ${data.item.length}개 상품의 북마크 정보 조회 시작`);

      // 병렬로 모든 상품의 북마크 정보 조회
      const productsWithBookmarks = await Promise.all(
        data.item.map(async (product: Product) => {
          const bookmark = await getProductBookmark(product._id, accessToken);

          return {
            ...product,
            myBookmarkId: bookmark?._id || undefined,
            isBookmarked: !!bookmark,
          };
        }),
      );

      data.item = productsWithBookmarks;
      console.log(`[서버 베스트 상품] 북마크 정보 추가 완료`);
    }

    return data;
  } catch (error) {
    console.error('베스트 상품 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 베스트 상품 조회에 실패했습니다.',
    };
  }
}
