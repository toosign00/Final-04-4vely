'use server';
// src/lib/functions/community.ts
import type { CommunityComment } from '@/types/commnunity.types';
import { Post } from '@/types/commnunity.types';

const API_BASE_URL = process.env.API_SERVER || 'https://fesp-api.koyeb.app/market';
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
  extra: { contents: PostContentPayload[]; name?: string; nickname?: string; species?: string };
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
  user: { _id: number; name: string; image?: string };
  title: string;
  content: string;
  image: string;
  views?: number;
  extra?: { contents: RawContent[]; name: string; nickname: string; species: string };
  createdAt: string;
  updatedAt: string;
  repliesCount?: number;
  myBookmarkId?: number | null;
  isBookmarked: boolean;
}

// ------------------------------
// 공통 헤더(토큰)
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
    coverImage: item.image,
    contents:
      item.extra?.contents.map((c) => ({
        id: c.id,
        title: c.title,
        content: c.content,
        postImage: c.postImage,
        thumbnailImage: c.thumbnailImage,
      })) || [],
    author: {
      id: String(item.user._id),
      username: item.user.name,
      avatar: item.user.image ?? '',
    },
    stats: {
      likes: 0,
      comments: item.repliesCount ?? 0,
      views: item.views ?? 0,
    },
    repliesCount: item.repliesCount,
    type: item.type,
    myBookmarkId: item.myBookmarkId ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    name: item.extra?.name ?? '',
    nickname: item.extra?.nickname ?? '',
    species: item.extra?.species ?? '',
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
  if (!filePath) return '';
  return filePath.startsWith('http') ? filePath : filePath.startsWith('/') ? filePath : `/${filePath}`;
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
export async function fetchPosts(page = 1, limit = 8, type = 'community', token?: string): Promise<{ posts: Post[]; pagination: Pagination }> {
  const url = `${API_BASE_URL}/posts?type=${type}&page=${page}&limit=${limit}`;
  const headers = makeHeaders(token);

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const { item, pagination } = (await res.json()) as {
    ok: number;
    item: RawPost[];
    pagination: Pagination;
  };
  console.log('게시물 조회 RawPost:', item);
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

export async function fetchPostsByUserId(page = 1, limit = 8, token?: string): Promise<{ posts: Post[]; pagination: Pagination }> {
  const url = `${API_BASE_URL}/posts/users/?page=${page}&limit=${limit}&type=community`;

  const headers: Record<string, string> = {
    'client-id': CLIENT_ID,
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const { item, pagination } = (await res.json()) as {
    ok: number;
    item: RawPost[];
    pagination: Pagination;
  };
  console.log('내가 쓴글 RawPost:', item);
  console.log(headers);
  const posts = item.map(mapRawPost);
  console.log('내가 쓴글 Post:', posts); // 변환된 값 확인

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
    headers: makeHeaders(token),
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
      name?: string;
      nickname?: string;
      species?: string;
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
    console.log('[update 응답 결과]', json);

    if (!json || !json.item) {
      return await fetchPostById(id); // 서버가 item 안 줄 경우 재조회
    }

    return mapRawPost(json.item);
  } catch (err) {
    console.error('[updatePostById JSON 파싱 실패]', err);

    return await fetchPostById(id);
  }
}

// 댓글 목록
export async function fetchComments(postId: string): Promise<CommunityComment[]> {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/replies`, {
    headers: makeHeaders(),
  });
  if (!res.ok) throw new Error(`댓글 조회 실패: HTTP ${res.status}`);
  const { item } = await res.json();
  return item;
}

// 댓글 생성
export async function createComment(postId: string, content: string, token: string): Promise<CommunityComment> {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/replies`, {
    method: 'POST',
    headers: makeHeaders(token),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `댓글 작성 실패: HTTP ${res.status}`);
  }
  const { item } = await res.json();
  return item as CommunityComment;
}

// 댓글 수정
export async function updateComment(postId: string, replyId: string, content: string, token: string): Promise<CommunityComment> {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/replies/${replyId}`, {
    method: 'PATCH',
    headers: makeHeaders(token),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `댓글 수정 실패: HTTP ${res.status}`);
  }
  const { item } = await res.json();
  return item as CommunityComment;
}

// 댓글 삭제
export async function deleteComment(postId: string, replyId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/posts/${postId}/replies/${replyId}`, {
    method: 'DELETE',
    headers: makeHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `댓글 삭제 실패: HTTP ${res.status}`);
  }
}
