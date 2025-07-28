import { Post } from '@/types/post.types';

/**
 * Green Magazine에서 사용하는 게시글 카드 타입
 */
export type MagazinePostData = Pick<Post, '_id' | 'type' | 'title' | 'content' | 'createdAt' | 'updatedAt' | 'views' | 'user'> & {
  bookmarks: number;
  myBookmarkId: number | null;
  image: string;
  extra?: {
    contents: {
      content: string;
      postImage: string;
    }[];
  };
};
