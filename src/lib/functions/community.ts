// src/lib/functions/community.ts
import { Post } from '@/types/commnunity.types';

export const API_BASE_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
const CLIENT_ID = process.env.CLIENT_ID || 'febc13-final04-emjf';

// ------------------------------
// 타입 정의
// ------------------------------
export interface PostContentPayload {
  id: string;
  title: string;
  content: string;
  postImage: string;
  thumbnailImage: string;
}

export interface CreatePostData {
  type?: string;
  title: string;
  content: string;
  image: string;
  extra: { contents: PostContentPayload[] };
  tag?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface RawContent {
  id: string;
  title: string;
  content: string;
  postImage: string;
  thumbnailImage: string;
}

interface RawPost {
  _id: number;
  type: string;
  product_id?: number | string | null;
  seller_id?: number | string | null;
  user: { _id: number; name: string; avatar?: string };
  title: string;
  content: string;
  image: string;
  extra?: { contents: RawContent[] };
  createdAt: string;
  updatedAt: string;
  repliesCount?: number;
  bookmarks?: number;
  myBookmarkId?: number | null;
}

// ------------------------------
// 공통 유틸
// ------------------------------
function makeHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'client-id': CLIENT_ID,
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function mapRawPost(item: RawPost): Post {
  return {
    id: String(item._id),
    title: item.title,
    description: item.content,
    coverImage: `${API_BASE_URL}${item.image}`,
    contents:
      item.extra?.contents.map((c) => ({
        id: c.id,
        title: c.title,
        content: c.content,
        postImage: `${API_BASE_URL}${c.postImage}`,
        thumbnailImage: `${API_BASE_URL}${c.thumbnailImage}`,
      })) || [],
    author: {
      id: String(item.user._id),
      username: item.user.name,
      avatar: item.user.avatar ? `${API_BASE_URL}/${item.user.avatar}` : '',
    },
    stats: {
      likes: 0,
      comments: item.repliesCount ?? 0,
      views: 0,
      bookmarks: item.bookmarks,
    },
    repliesCount: item.repliesCount,
    type: item.type,
    myBookmarkId: item.myBookmarkId ?? null,
    product_id: item.product_id ?? undefined,
    seller_id: item.seller_id ?? undefined,
    product: undefined,
    isBookmarked: Boolean(item.myBookmarkId),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// ------------------------------
// API 함수
// ------------------------------

/**
 * 파일 업로드
 */
export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('attach', file);

  const res = await fetch(`${API_BASE_URL}/files`, {
    method: 'POST',
    headers: { 'client-id': CLIENT_ID },
    body: form,
  });
  if (!res.ok) throw new Error('파일 업로드에 실패했습니다.');

  const { item } = await res.json();
  const filePath = Array.isArray(item) && item[0]?.path;
  return filePath.startsWith('/') ? filePath : `/${filePath}`;
}

/**
 * 게시글 생성
 * @param data 글 데이터
 * @param token 로그인 사용자 토큰 (없으면 익명)
 */
export async function createPost(
  data: CreatePostData,
  token?: string, // ← 토큰 파라미터 추가
): Promise<Post> {
  const body = {
    type: data.type ?? 'community',
    title: data.title,
    content: data.content,
    image: data.image,
    extra: data.extra,
    tag: data.tag,
  };

  const headers: Record<string, string> = {
    'client-id': CLIENT_ID,
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * 게시글 목록 조회
 */
export async function fetchPosts(page = 1, limit = 8, type = 'community'): Promise<{ posts: Post[]; pagination: Pagination }> {
  const url = new URL(`${API_BASE_URL}/posts`);
  url.searchParams.set('type', type);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), { headers: makeHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const { item, pagination } = (await res.json()) as {
    ok: number;
    item: RawPost[];
    pagination: Pagination;
  };
  return {
    posts: item.map(mapRawPost),
    pagination,
  };
}

/**
 *  게시글 상세 조회
 */
export async function fetchPostById(id: string): Promise<Post> {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    headers: makeHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const { item } = (await res.json()) as { ok: number; item: RawPost };
  if (item.type !== 'community') throw new Error(`잘못된 타입: ${item.type}`);
  return mapRawPost(item);
}

/**
 * 내가 쓴 게시글 조회
 * @param token 로그인 사용자 토큰 (필요 시)
 */

export async function fetchPostsByUserId(userId: string, page = 1, limit = 8, token?: string): Promise<{ posts: Post[]; pagination: Pagination }> {
  const url = new URL(`${API_BASE_URL}/posts/users/${userId}`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  // (선택) community 타입만 보고 싶으면 type 파라미터도 추가
  url.searchParams.set('type', 'community');

  // 올바른 헤더 키는 'client-id' 입니다.
  const headers: Record<string, string> = {
    'client-id': CLIENT_ID,
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const { item, pagination } = (await res.json()) as {
    ok: number;
    item: RawPost[];
    pagination: Pagination;
  };

  return {
    posts: item.map(mapRawPost),
    pagination,
  };
}

/**
 * 게시글 삭제
 */
export async function deletePostById(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: {
      'client-id': CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
}
//게시물 수정
export async function updatePostById(
  id: string,
  data: {
    title: string;
    content?: string;
    coverImage?: string;
    extra: {
      contents: { id: string; content?: string; postImage?: string }[];
    };
  },
  token: string,
): Promise<Post> {
  const url = new URL(`${API_BASE_URL}/posts/${id}`);

  const res = await fetch(url.toString(), {
    method: 'PATCH',
    headers: makeHeaders(token),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  try {
    const json = await res.json();
    console.log('[update 응답 결과]', json); // ⚠️ 디버깅용

    if (!json || !json.item) {
      console.warn('⚠️ 서버 응답에 item이 없습니다. fetchPostById로 fallback.');
      return await fetchPostById(id); // 서버가 item 안 줄 경우 재조회
    }

    return mapRawPost(json.item);
  } catch (err) {
    console.error('[updatePostById JSON 파싱 실패]', err);
    // fallback 처리: 상세 조회로 대체
    return await fetchPostById(id);
  }
}
