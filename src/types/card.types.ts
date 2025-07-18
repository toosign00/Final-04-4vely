import Image from 'next/image';

// ============================================================================
// 기본 타입 정의
// ============================================================================
export type CardProps = React.ComponentProps<'div'>;
export type CardContentProps = React.ComponentProps<'div'>;

// ============================================================================
// 이미지 관련 타입
// ============================================================================
export interface CardImageProps extends React.ComponentProps<typeof Image> {
  fill?: boolean;
  onError?: () => void;
}

// ============================================================================
// 텍스트 콘텐츠 관련 타입
// ============================================================================
export interface CardTitleProps extends React.ComponentProps<'div'> {
  title?: string;
}

export interface CardDescriptionProps extends React.ComponentProps<'div'> {
  description?: string;
}

// ============================================================================
// 사용자 정보 관련 타입
// ============================================================================
export interface CardAvatarProps extends React.ComponentProps<'div'> {
  src?: string;
  alt?: string;
  fallback?: string;
  username?: string;
}

// ============================================================================
// 상호작용 관련 타입
// ============================================================================
export interface CardFooterProps extends React.ComponentProps<'div'> {
  likes?: number;
  comments?: number;
  views?: number;
  timeAgo?: string;
  onLike?: () => void;
  isLiked?: boolean;
  dateTime?: string;
}
