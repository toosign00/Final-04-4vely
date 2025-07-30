import { Post } from '@/types/post.types';

/**
 * Green Magazine에서 사용하는 게시글 카드 타입
 */
export type MagazinePostData = Pick<Post, '_id' | 'type' | 'title' | 'content' | 'createdAt' | 'updatedAt' | 'views' | 'user'> & {
  bookmarks: number;
  myBookmarkId?: number | null;
  image: string;
  extra?: {
    contents: {
      content: string;
      postImage: string;
    }[];
  };
};

/*
 * 매거진 데이터 서버에서 자르기 위한 타입
 */
export interface MagazinePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GreenMagazineRes {
  ok: 1;
  item: MagazinePostData[];
  pagination: MagazinePagination;
}
