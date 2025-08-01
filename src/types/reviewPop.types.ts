// 홈 화면 인기 리뷰 타입
export interface ReviewPopCard {
  content: string;
  rating: number;
  createdAt: string;
  product_id: number;
  user: {
    name: string;
    image?: string;
  };
  product?: {
    _id: number;
    name: string;
    image: string;
  };
}
