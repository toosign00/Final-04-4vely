/**
 * @fileoverview 북마크 데이터 변환 함수들
 */

'use server';

import { getImageUrl } from '@/lib/utils/auth.server';
import { BookmarkItem, TransformedBookmarkItem } from '@/types/mypageBookmark.types';
import { getPostDetailsBatch, getProductDetailsBatch } from './bookmarkApi';
import { extractImagePath, stripHtmlTags } from './bookmarkUtils';

// 기본 플레이스홀더 이미지 URL (캐싱)
let cachedPlaceholderUrl: string | null = null;

/**
 * 기본 플레이스홀더 이미지 URL 가져오기 (캐싱 적용)
 */
async function getPlaceholderImageUrl(): Promise<string> {
  if (cachedPlaceholderUrl) return cachedPlaceholderUrl;
  cachedPlaceholderUrl = await getImageUrl('');
  return cachedPlaceholderUrl;
}

/**
 * 상품 북마크를 UI용 형태로 변환 (성능 최적화)
 */
export async function transformProductBookmarks(bookmarks: BookmarkItem[]): Promise<TransformedBookmarkItem[]> {
  if (bookmarks.length === 0) return [];

  // 기본 플레이스홀더 이미지 URL 미리 가져오기
  const placeholderUrl = await getPlaceholderImageUrl();

  // 유효한 상품 ID들만 추출
  const validProductIds = bookmarks.map((bookmark) => bookmark.product?._id).filter((id): id is number => id !== undefined && id !== null);

  // 상품 상세 정보 배치 조회
  const productDetailsMap = await getProductDetailsBatch(validProductIds);

  // 북마크 변환 (동기 처리로 변경)
  return bookmarks.map((bookmark): TransformedBookmarkItem => {
    const product = bookmark.product;
    const defaultItem: TransformedBookmarkItem = {
      bookmarkId: bookmark._id,
      id: product?._id || 0,
      name: product?.name || '상품명 없음',
      price: product?.price || 0,
      description: '상품 설명이 없습니다.',
      imageUrl: placeholderUrl, // 캐시된 URL 사용
      type: 'product',
      createdAt: bookmark.createdAt,
    };

    if (!product?._id) return defaultItem;

    const productDetail = productDetailsMap.get(product._id);
    if (!productDetail) return defaultItem;

    // 이미지 URL 처리 (동기 처리)
    let imageUrl = placeholderUrl;
    if (productDetail.mainImages?.length > 0) {
      const imagePath = extractImagePath(productDetail.mainImages[0]);
      if (imagePath) {
        // API_URL을 직접 사용하여 동기 처리
        const API_URL = process.env.API_URL;
        imageUrl = imagePath.startsWith('http') ? imagePath : `${API_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
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
  });
}

/**
 * 커뮤니티 북마크를 UI용 형태로 변환 (성능 최적화)
 */
export async function transformCommunityBookmarks(bookmarks: BookmarkItem[]): Promise<TransformedBookmarkItem[]> {
  if (bookmarks.length === 0) return [];

  // 기본 플레이스홀더 이미지 URL 미리 가져오기
  const placeholderUrl = await getPlaceholderImageUrl();

  // 유효한 게시글 ID들만 추출
  const validPostIds = bookmarks.map((bookmark) => bookmark.post?._id).filter((id): id is number => id !== undefined && id !== null);

  // 게시글 상세 정보 배치 조회
  const postDetailsMap = await getPostDetailsBatch(validPostIds);

  // 북마크 변환 (동기 처리로 변경)
  return bookmarks.map((bookmark): TransformedBookmarkItem => {
    const post = bookmark.post;
    const defaultItem: TransformedBookmarkItem = {
      bookmarkId: bookmark._id,
      id: post?._id || 0,
      name: post?.title || '게시글 제목 없음',
      description: '게시글 내용이 없습니다.',
      imageUrl: placeholderUrl, // 캐시된 URL 사용
      views: 0,
      author: '작성자 없음',
      repliesCount: 0,
      type: 'community',
      createdAt: bookmark.createdAt,
    };

    if (!post?._id) return defaultItem;

    const postDetail = postDetailsMap.get(post._id);
    if (!postDetail) return defaultItem;

    // 이미지 URL 처리 (동기 처리)
    let imageUrl = placeholderUrl;
    if (postDetail.image) {
      // API_URL을 직접 사용하여 동기 처리
      const API_URL = process.env.API_URL;
      imageUrl = postDetail.image.startsWith('http') ? postDetail.image : `${API_URL}${postDetail.image.startsWith('/') ? postDetail.image : `/${postDetail.image}`}`;
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
      type: 'community',
      createdAt: bookmark.createdAt,
    };
  });
}
