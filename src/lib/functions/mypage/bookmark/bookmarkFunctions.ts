/**
 * @fileoverview 북마크 관리를 위한 메인 함수들을 제공하는 모듈
 */

'use server';

import { BookmarkItem, PostDetail, ProductDetail, TransformedBookmarkItem } from '@/types/mypageBookmark.types';
import { getBookmarks, getPostDetail, getProductDetail } from './bookmarkApi';
import { extractImagePath, stripHtmlTags } from './bookmarkUtils';

// 타입 재 export
export type { BookmarkItem, TransformedBookmarkItem } from '@/types/mypageBookmark.types';

// 상세 정보 캐시
const detailCache = new Map<string, ProductDetail | PostDetail>();

// 기본 플레이스홀더 이미지 URL
const PLACEHOLDER_IMAGE_URL = '/images/placeholder-plant.svg';

/**
 * 캐시를 사용한 상품 상세 정보 조회
 */
async function getProductDetailCached(productId: number): Promise<ProductDetail | null> {
  const cacheKey = `product-${productId}`;

  if (detailCache.has(cacheKey)) {
    const cached = detailCache.get(cacheKey);
    return cached && 'mainImages' in cached ? (cached as ProductDetail) : null;
  }

  const detail = await getProductDetail(productId);
  if (detail) {
    detailCache.set(cacheKey, detail);
  }
  return detail;
}

/**
 * 캐시를 사용한 게시글 상세 정보 조회
 */
async function getPostDetailCached(postId: number): Promise<PostDetail | null> {
  const cacheKey = `post-${postId}`;

  if (detailCache.has(cacheKey)) {
    const cached = detailCache.get(cacheKey);
    return cached && 'title' in cached ? (cached as PostDetail) : null;
  }

  const detail = await getPostDetail(postId);
  if (detail) {
    detailCache.set(cacheKey, detail);
  }
  return detail;
}

/**
 * 개별 상품 북마크를 UI용 형태로 변환
 */
async function transformProductBookmarkItem(bookmark: BookmarkItem): Promise<TransformedBookmarkItem> {
  const product = bookmark.product;
  const defaultItem: TransformedBookmarkItem = {
    bookmarkId: bookmark._id,
    id: product?._id || 0,
    name: product?.name || '상품명 없음',
    price: product?.price || 0,
    description: '상품 설명이 없습니다.',
    imageUrl: PLACEHOLDER_IMAGE_URL,
    type: 'product',
    createdAt: bookmark.createdAt,
  };

  if (!product?._id) return defaultItem;

  const productDetail = await getProductDetailCached(product._id);
  if (!productDetail) return defaultItem;

  // 이미지 URL 처리
  let imageUrl = PLACEHOLDER_IMAGE_URL;
  if (productDetail.mainImages?.length > 0) {
    const imagePath = extractImagePath(productDetail.mainImages[0]);
    if (imagePath) {
      imageUrl = imagePath;
    }
  }

  return {
    bookmarkId: bookmark._id,
    id: product._id,
    name: productDetail.name || defaultItem.name,
    price: productDetail.price || defaultItem.price!,
    description: stripHtmlTags(productDetail.content),
    imageUrl,
    type: 'product',
    createdAt: bookmark.createdAt,
  };
}

/**
 * 개별 게시글 북마크를 UI용 형태로 변환
 */
async function transformCommunityBookmarkItem(bookmark: BookmarkItem): Promise<TransformedBookmarkItem> {
  const post = bookmark.post;
  const defaultItem: TransformedBookmarkItem = {
    bookmarkId: bookmark._id,
    id: post?._id || 0,
    name: post?.title || '게시글 제목 없음',
    description: '게시글 내용이 없습니다.',
    imageUrl: PLACEHOLDER_IMAGE_URL,
    views: 0,
    author: '작성자 없음',
    repliesCount: 0,
    type: post?.type === 'magazine' ? 'magazine' : 'community',
    createdAt: bookmark.createdAt,
  };

  if (!post?._id) return defaultItem;

  const postDetail = await getPostDetailCached(post._id);
  if (!postDetail) return defaultItem;

  // 이미지 URL 처리
  let imageUrl = PLACEHOLDER_IMAGE_URL;
  if (postDetail.image) {
    imageUrl = postDetail.image;
  }

  return {
    bookmarkId: bookmark._id,
    id: postDetail._id,
    name: postDetail.title || defaultItem.name,
    description: stripHtmlTags(postDetail.content),
    imageUrl,
    views: postDetail.views,
    author: postDetail.user?.name || defaultItem.author,
    repliesCount: postDetail.replies?.length || 0,
    type: postDetail.type === 'magazine' ? 'magazine' : 'community',
    createdAt: bookmark.createdAt,
  };
}

/**
 * 페이지네이션 기반으로 북마크 목록을 조회하고 변환
 */
export async function getBookmarksFromServer(
  type: 'product' | 'post',
  page: number = 1,
  limit: number = 5,
): Promise<{
  success: boolean;
  data?: TransformedBookmarkItem[];
  error?: string;
  total?: number;
  hasMore?: boolean;
}> {
  try {
    const { getAuthInfo } = await import('@/lib/utils/auth.server');
    const authInfo = await getAuthInfo();

    if (!authInfo) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const response = await getBookmarks(type, authInfo.accessToken);

    if (!response.ok) {
      return {
        success: false,
        error: response.message || '북마크 목록을 불러올 수 없습니다.',
      };
    }

    // 전체 북마크 목록
    const allBookmarks = response.item || [];
    const total = allBookmarks.length;

    console.log(`[${type} 북마크] 전체: ${total}개, 페이지: ${page}, 페이지당: ${limit}개`);

    // 현재 페이지에 해당하는 북마크만 선택
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pageBookmarks = allBookmarks.slice(startIndex, endIndex);

    // 현재 페이지 북마크들을 개별적으로 변환 (순차 처리)
    const data: TransformedBookmarkItem[] = [];

    for (const bookmark of pageBookmarks) {
      try {
        let transformedItem: TransformedBookmarkItem;

        if (type === 'product') {
          transformedItem = await transformProductBookmarkItem(bookmark);
        } else {
          transformedItem = await transformCommunityBookmarkItem(bookmark);
        }

        data.push(transformedItem);
      } catch (error) {
        console.warn(`북마크 ${bookmark._id} 변환 실패:`, error);
        // 실패한 항목은 기본값으로 처리하여 전체 프로세스 중단 방지
        continue;
      }
    }

    return {
      success: true,
      data,
      total,
      hasMore: endIndex < total,
    };
  } catch (error) {
    console.error('북마크 조회 중 오류 발생:', error);
    return {
      success: false,
      error: '북마크 목록 조회 중 오류가 발생했습니다.',
    };
  }
}
