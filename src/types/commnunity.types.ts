export interface PostContent {
  id: string;
  title: string;
  content: string;
  postImage: string;
  thumbnailImage: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  contents: PostContent[];
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  stats: {
    likes: number;
    comments: number;
    views: number;
    bookmarks?: number;
  };
  type?: string;
  myBookmarkId?: number | null;
  product_id?: number | string;
  seller_id?: number | string;
  product?: {
    name: string;
    image: {
      url: string;
      fileName: string;
      orgName: string;
    };
  };
  repliesCount?: number;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt?: string;
}
