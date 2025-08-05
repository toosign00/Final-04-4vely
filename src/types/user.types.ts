export interface User {
  _id: number; // 사용자 고유 ID
  email: string; // 이메일 주소
  name: string; // 사용자 이름
  phone?: string; // 전화번호
  address?: string; // 주소
  type: 'user' | 'seller' | 'admin'; // 사용자 유형
  loginType?: 'email' | 'kakao' | 'google' | 'github' | 'naver'; // 로그인 방식
  image?: string; // 프로필 이미지
  token?: {
    accessToken: string; // 액세스 토큰
    refreshToken: string; // 리프레시 토큰
  };
  extra?: {
    providerAccountId?: string;
    response?: {
      id?: string;
      name?: string;
      email?: string;
      mobile?: string; // 네이버 특정
      profile_image?: string;
    };
    [key: string]: unknown; // 추가 필드
  }; // 소셜 로그인 추가 정보
  createdAt?: string; // 생성일
  updatedAt?: string; // 수정일
  rememberLogin?: boolean; // 자동 로그인 설정 (클라이언트에서만 사용)
  sessionStartTime?: number; // 세션 시작 시간 (클라이언트에서만 사용)
  lastActivityTime?: number; // 마지막 활동 시간 (클라이언트에서만 사용)
}

export interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  resetUser: () => void;
}

export type OAuthUser = Required<Pick<User, 'type' | 'loginType'>> &
  Partial<Pick<User, 'name' | 'email' | 'image'>> & {
    extra: {
      providerAccountId: string;
      [key: string]: unknown; // Allow additional fields from provider
    };
  };
