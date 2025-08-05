// ============================================================================
// 마이페이지 북마크 함수에서 사용하는 확장 타입들
// ============================================================================

/**
 * 북마크 아이템 인터페이스 (API 응답용)
 */
export interface BookmarkItem {
  _id: number;
  user_id: number;
  memo: string;
  createdAt: string;
  product?: {
    _id: number;
    name: string;
    price: number;
    quantity: number;
    buyQuantity: number;
    image: {
      url: string;
      fileName: string;
      orgName: string;
    };
    extra: {
      isNew: boolean;
      isBest: boolean;
      category: string[];
      sort: number;
    };
  };
  post?: {
    _id: number;
    type: string; // 게시글 타입 (community, magazine 등)
    title: string;
    content: string;
    views: number;
    user: {
      _id: number;
      name: string;
      image: string;
    };
    image?: string;
    replies?: Array<{
      _id: number;
      user_id: number;
      user: {
        _id: number;
        name: string;
        email: string;
        image: string;
      };
      content: string;
      like: number;
      createdAt: string;
      updatedAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * UI용 변환된 북마크 아이템 인터페이스
 */
export interface TransformedBookmarkItem {
  bookmarkId: number; // 실제 북마크 ID (삭제용)
  id: number; // 상품/게시글 ID
  imageUrl: string;
  name: string;
  description: string;
  price?: number; // product 타입에서만 사용
  views?: number; // post 타입에서만 사용
  author?: string; // post 타입에서만 사용
  repliesCount?: number; // post 타입에서만 사용
  type: 'product' | 'community' | 'magazine'; // 실제 게시글 타입을 구분
  createdAt: string;
}

/**
 * 상품 상세 정보 인터페이스
 */
export interface ProductDetail {
  _id: number;
  name: string;
  price: number;
  content: string;
  mainImages: Array<{ path: string } | string>;
}

/**
 * 게시글 상세 정보 인터페이스
 */
export interface PostDetail {
  _id: number;
  type: string; // 게시글 타입 (community, magazine 등)
  title: string;
  content: string;
  views: number;
  user: {
    _id: number;
    name: string;
    image: string;
  };
  image?: string;
  replies?: Array<{
    _id: number;
    user_id: number;
    user: {
      _id: number;
      name: string;
      email: string;
      image: string;
    };
    content: string;
    like: number;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
