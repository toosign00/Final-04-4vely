/**
 * @fileoverview 북마크 데이터 변환 함수들
 */

import { BookmarkItem, TransformedBookmarkItem } from '@/types/mypageBookmark.types';
import { getPostDetail, getProductDetail } from './bookmarkApi';
import { extractImagePath, getImageUrl, stripHtmlTags } from './bookmarkUtils';

/**
 * 상품 북마크를 UI용 형태로 변환
 */
export async function transformProductBookmarks(bookmarks: BookmarkItem[]): Promise<TransformedBookmarkItem[]> {
  return Promise.all(
    bookmarks.map(async (bookmark): Promise<TransformedBookmarkItem> => {
      const product = bookmark.product;
      const defaultItem: TransformedBookmarkItem = {
        bookmarkId: bookmark._id,
        id: product?._id || 0,
        name: product?.name || '상품명 없음',
        price: product?.price || 0,
        description: '상품 설명이 없습니다.',
        imageUrl: getImageUrl(''),
        type: 'product',
        createdAt: bookmark.createdAt,
      };

      if (!product?._id) return defaultItem;

      try {
        const productDetail = await getProductDetail(product._id);
        if (!productDetail) return defaultItem;

        // 이미지 URL 처리
        let imageUrl = defaultItem.imageUrl;
        if (productDetail.mainImages?.length > 0) {
          const imagePath = extractImagePath(productDetail.mainImages[0]);
          if (imagePath) imageUrl = getImageUrl(imagePath);
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
      } catch (error) {
        console.warn(`상품 ${product._id} 상세 정보 조회 실패:`, error);
        return defaultItem;
      }
    }),
  );
}

/**
 * 커뮤니티 북마크를 UI용 형태로 변환
 */
export async function transformCommunityBookmarks(bookmarks: BookmarkItem[]): Promise<TransformedBookmarkItem[]> {
  return Promise.all(
    bookmarks.map(async (bookmark): Promise<TransformedBookmarkItem> => {
      const post = bookmark.post;
      const defaultItem: TransformedBookmarkItem = {
        bookmarkId: bookmark._id,
        id: post?._id || 0,
        name: post?.title || '게시글 제목 없음',
        description: '게시글 내용이 없습니다.',
        imageUrl: getImageUrl(''),
        views: 0,
        author: '작성자 없음',
        repliesCount: 0,
        type: 'community',
        createdAt: bookmark.createdAt,
      };

      if (!post?._id) return defaultItem;

      try {
        // 개별 게시글 상세 정보 조회
        const postDetail = await getPostDetail(post._id);
        if (!postDetail) return defaultItem;

        // 이미지 URL 처리 (게시글 이미지가 있는 경우)
        let imageUrl = defaultItem.imageUrl;
        if (postDetail.image) {
          imageUrl = getImageUrl(postDetail.image);
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
      } catch (error) {
        console.warn(`게시글 ${post._id} 상세 정보 조회 실패:`, error);
        return defaultItem;
      }
    }),
  );
}
