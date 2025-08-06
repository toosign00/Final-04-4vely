export interface PostContent {
  id: string;
  title: string;
  content: string;
  postImage: string;
  thumbnailImage: string;
}

export interface CommunityComment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Post {
  name: string;
  nickname: string;
  species: string;
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
    bookmarks: number;
    comments: number;
    views: number;
  };
  type?: string;
  myBookmarkId?: number | null;

  repliesCount?: number;
  createdAt: string;
  updatedAt?: string;
  replies?: CommunityComment[];
}
