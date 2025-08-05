'use server';

import { getAuthInfo } from '@/lib/utils/auth.server';
import { ApiRes } from '@/types/api.types';
import { User } from '@/types/user.types';

// 상세 정보 타입 (User 확장)
export interface UserDetail extends User {
  posts?: number;
  postViews?: number;
  bookmark?: {
    products: number;
    users: number;
    posts: number;
  };
  bookmarkedBy?: {
    users: number;
  };
}

const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 내 회원 상세 정보 조회 (모든 속성 포함)
 * @returns ApiRes<UserDetail>
 */
export async function getUserDetail(): Promise<ApiRes<UserDetail>> {
  const { getAuthInfo } = await import('@/lib/utils/auth.server');
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }
  const { userId } = auth;

  try {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '회원 정보 조회에 실패했습니다.',
      };
    }

    return data;
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 회원 정보를 불러오지 못했습니다.',
    };
  }
}

export async function getUserProfileImageUrl(): Promise<ApiRes<User>> {
  const auth = await getAuthInfo();
  if (!auth) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }
  const { accessToken, userId } = auth;

  try {
    const res = await fetch(`${API_URL}/users/${userId}/profile_image`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '회원 정보 수정에 실패했습니다.',
      };
    }
    return data;
  } catch {
    return {
      ok: 0,
      message: '서버 오류로 회원 정보를 수정하지 못했습니다.',
    };
  }
}
