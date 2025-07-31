// src/lib/functions/shop/productServerFunctions.ts

import { getBulkBookmarks, getServerAccessToken } from '@/lib/functions/shop/bookmarkServerFunctions';
import { ApiResPromise } from '@/types/api.types';
import { Product } from '@/types/product.types';

const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 서버에서 필터링과 페이지네이션이 적용된 상품 목록을 조회합니다.
 * API 문서에 따른 정확한 구현
 */
export async function getFilteredProductsWithPagination(params: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  category?: string;
  filters?: {
    size?: string[];
    difficulty?: string[];
    light?: string[];
    space?: string[];
    season?: string[];
    suppliesCategory?: string[];
  };
}): Promise<{
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    const page = params.page || 1;
    const limit = params.limit || 12;

    // API 쿼리 파라미터
    const queryParams = new URLSearchParams();

    // 페이지네이션 파라미터
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    // 검색어
    if (params.search && params.search.trim()) {
      queryParams.append('keyword', params.search.trim());
    }

    // 정렬 - API 문서 형식에 맞춰 수정
    if (params.sort) {
      let sortValue = '';
      switch (params.sort) {
        case 'price-low':
          sortValue = '{"price": 1}';
          break;
        case 'price-high':
          sortValue = '{"price": -1}';
          break;
        case 'new':
          sortValue = '{"createdAt": -1}';
          break;
        case 'old':
          sortValue = '{"createdAt": 1}';
          break;
        case 'name':
          sortValue = '{"name": 1}';
          break;
        case 'recommend':
          sortValue = '{"extra.sort": 1, "_id": 1}';
          break;
      }

      if (sortValue) {
        queryParams.append('sort', sortValue);
        console.log('[정렬 적용]:', params.sort, '→', sortValue);
      }
    }

    // custom 파라미터를 사용한 필터링
    let customFilterString = '';
    const category = params.category || 'plant';

    // 카테고리별 기본 필터
    if (category === 'new') {
      customFilterString = JSON.stringify({ 'extra.isNew': true });
    } else if (category === 'supplies') {
      // 원예용품은 여러 카테고리를 포함
      customFilterString = JSON.stringify({
        $or: [{ 'extra.category': '원예 용품' }, { 'extra.category': '화분' }, { 'extra.category': '도구' }, { 'extra.category': '조명' }],
      });
    } else if (category === 'plant') {
      customFilterString = JSON.stringify({ 'extra.category': '식물' });
    }

    // 세부 필터 추가
    if (params.filters) {
      const allFilterValues: string[] = [];

      Object.values(params.filters).forEach((filterArray) => {
        if (filterArray && filterArray.length > 0) {
          allFilterValues.push(...filterArray);
        }
      });

      if (allFilterValues.length > 0) {
        // 세부 필터와 카테고리 필터를 AND로 결합
        if (category === 'supplies') {
          // 원예용품 + 세부 필터
          customFilterString = JSON.stringify({
            $and: [
              {
                $or: [{ 'extra.category': '원예 용품' }, { 'extra.category': '화분' }, { 'extra.category': '도구' }, { 'extra.category': '조명' }],
              },
              { 'extra.category': { $in: allFilterValues } },
            ],
          });
        } else if (category === 'plant') {
          // 식물 + 세부 필터
          customFilterString = JSON.stringify({
            $and: [{ 'extra.category': '식물' }, { 'extra.category': { $in: allFilterValues } }],
          });
        } else if (category === 'new') {
          // 신상품 + 세부 필터
          customFilterString = JSON.stringify({
            $and: [{ 'extra.isNew': true }, { 'extra.category': { $in: allFilterValues } }],
          });
        } else {
          // 세부 필터만
          customFilterString = JSON.stringify({ 'extra.category': { $in: allFilterValues } });
        }
      }
    }

    // custom 파라미터 추가 (값이 있을 때만)
    if (customFilterString) {
      queryParams.append('custom', customFilterString);
      console.log('[custom 파라미터]:', customFilterString);
    }

    // API 호출
    const apiUrl = `${API_URL}/products?${queryParams.toString()}`;
    console.log('[API 호출]:', apiUrl);

    const res = await fetch(apiUrl, {
      headers: {
        'Client-Id': CLIENT_ID,
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      console.error('[API 오류]:', data.message);
      return {
        products: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const products = data.item || [];

    console.log('[API 응답]:', {
      상태: 'OK',
      받은상품수: products.length,
      전체상품수: data.pagination?.total,
      현재페이지: data.pagination?.page,
      전체페이지: data.pagination?.totalPages,
    });

    // 추천순 정렬
    if (!params.sort || params.sort === 'recommend') {
      products.sort((a: Product, b: Product) => {
        // 1. extra.sort 필드 우선
        const aSort = a.extra?.sort ?? 999;
        const bSort = b.extra?.sort ?? 999;
        if (aSort !== bSort) return aSort - bSort;

        // 2. 베스트 상품 우선
        if (a.extra?.isBest && !b.extra?.isBest) return -1;
        if (!a.extra?.isBest && b.extra?.isBest) return 1;

        // 3. 신상품 우선
        if (a.extra?.isNew && !b.extra?.isNew) return -1;
        if (!a.extra?.isNew && b.extra?.isNew) return 1;

        // 4. ID 순서
        return a._id - b._id;
      });
    }

    // 북마크 정보 추가
    let finalProducts = products;
    const accessToken = await getServerAccessToken();

    if (accessToken && products.length > 0) {
      console.log(`[북마크 정보 조회] ${products.length}개 상품`);

      const targets = products.map((product: Product) => ({
        id: product._id,
        type: 'product' as const,
      }));

      const bookmarkMap = await getBulkBookmarks(targets);

      finalProducts = products.map((product: Product) => {
        const key = `product-${product._id}`;
        const bookmark = bookmarkMap.get(key);
        return {
          ...product,
          myBookmarkId: bookmark?._id,
          isBookmarked: !!bookmark,
        };
      });
    }

    // 페이지네이션 정보
    const pagination = {
      page: data.pagination?.page || page,
      limit: data.pagination?.limit || limit,
      total: data.pagination?.total || 0,
      totalPages: data.pagination?.totalPages || 0,
    };

    console.log('[서버 상품 조회] 완료:', {
      필터후상품수: finalProducts.length,
      페이지정보: pagination,
    });

    return {
      products: finalProducts,
      pagination,
    };
  } catch (error) {
    console.error('상품 조회 실패:', error);
    return {
      products: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/**
 * 서버에서 상품 상세 정보를 조회합니다.
 */
export async function getServerProductById(id: number): ApiResPromise<Product> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      headers: {
        'Client-Id': CLIENT_ID,
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!data.ok || !data.item) {
      return data;
    }

    // 로그인된 사용자인 경우 북마크 정보 추가
    const accessToken = await getServerAccessToken();
    if (accessToken) {
      try {
        const targets = [{ id: data.item._id, type: 'product' as const }];
        const bookmarkMap = await getBulkBookmarks(targets);
        const bookmark = bookmarkMap.get(`product-${data.item._id}`);

        data.item = {
          ...data.item,
          myBookmarkId: bookmark?._id,
          isBookmarked: !!bookmark,
        };
      } catch (error) {
        console.error('북마크 정보 조회 실패:', error);
      }
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

/**
 * 서버에서 베스트 상품 목록을 가져옵니다.
 */
export async function getBestProducts(limit: number = 4): ApiResPromise<Product[]> {
  try {
    // custom 파라미터로 베스트 상품 필터링
    const customFilter = JSON.stringify({ 'extra.isBest': true });

    const queryParams = new URLSearchParams();
    queryParams.append('custom', customFilter);
    queryParams.append('limit', limit.toString());
    queryParams.append('sort', '{"extra.sort": 1}');

    const res = await fetch(`${API_URL}/products?${queryParams.toString()}`, {
      headers: {
        'Client-Id': CLIENT_ID,
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!data.ok || !data.item || data.item.length === 0) {
      // custom 파라미터가 작동하지 않으면 일반 조회
      console.warn('[베스트 상품] custom 필터 미작동, 일반 조회 시도');
      const fallbackRes = await fetch(`${API_URL}/products?limit=${limit}&sort={"createdAt": -1}`, {
        headers: {
          'Client-Id': CLIENT_ID,
        },
        cache: 'no-store',
      });

      const fallbackData = await fallbackRes.json();
      if (fallbackData.ok && fallbackData.item) {
        // 서버에서 받은 상품 중 베스트 표시된 것만 사용
        // 현재 페이지에서만 필터링
        const bestInPage = (fallbackData.item as Product[]).filter((product: Product) => product.extra?.isBest === true);

        data.ok = 1;
        data.item = bestInPage.length > 0 ? bestInPage : fallbackData.item.slice(0, limit);
      } else {
        return fallbackData;
      }
    }

    let bestProducts = data.item || [];

    // 북마크 정보 추가
    const accessToken = await getServerAccessToken();
    if (accessToken && bestProducts.length > 0) {
      const targets = bestProducts.map((product: Product) => ({
        id: product._id,
        type: 'product' as const,
      }));

      const bookmarkMap = await getBulkBookmarks(targets);
      bestProducts = bestProducts.map((product: Product) => {
        const key = `product-${product._id}`;
        const bookmark = bookmarkMap.get(key);
        return {
          ...product,
          myBookmarkId: bookmark?._id,
          isBookmarked: !!bookmark,
        };
      });
    }

    return {
      ok: 1,
      item: bestProducts,
    };
  } catch (error) {
    console.error('베스트 상품 조회 실패:', error);
    return {
      ok: 0,
      message: '일시적인 네트워크 문제로 베스트 상품 조회에 실패했습니다.',
    };
  }
}

/**
 * 서버에서 상품 상세 정보를 관련 데이터와 함께 조회합니다.
 */
export async function getProductDetailWithRecommendations(productId: string): Promise<{
  product: Product | null;
  recommendProducts: Product[];
}> {
  try {
    const productResponse = await getServerProductById(parseInt(productId));

    if (!productResponse.ok || !productResponse.item) {
      return {
        product: null,
        recommendProducts: [],
      };
    }

    const product = productResponse.item;

    // 추천 상품 가져오기 - 같은 카테고리의 상품들
    const category = product.extra?.category?.[0] || '식물';
    const { products: recommendProducts } = await getFilteredProductsWithPagination({
      limit: 4, // 필요한 개수만 요청
      category: category === '식물' ? 'plant' : 'supplies',
    });

    // 현재 상품 제외
    const filteredRecommendProducts = recommendProducts.filter((p: Product) => p._id !== product._id);

    return {
      product,
      recommendProducts: filteredRecommendProducts,
    };
  } catch (error) {
    console.error('상품 상세 정보 로딩 실패:', error);
    return {
      product: null,
      recommendProducts: [],
    };
  }
}
