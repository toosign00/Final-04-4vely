// 홈 화면 커뮤니티 인기글 타입
export interface CommunityPostServerRes {
  ok: number;
  item: CommunityPost[];
}

export interface CommunityPost {
  _id: number;
  type: string;
  title: string;
  content: string;
  image?: string;
  views: number;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
  bookmarks: number;
  repliesCount: number;
}
