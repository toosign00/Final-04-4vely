'use server';

import { ApiRes } from '@/types/api.types';
import { User } from '@/types/user.types';
import { cookies } from 'next/headers';

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

// 인증 정보 추출 유틸 함수
async function getAuthInfo() {
  const cookieStore = await cookies();
  const userAuthCookie = cookieStore.get('user-auth')?.value;
  if (!userAuthCookie) return null;
  const userData = JSON.parse(userAuthCookie);
  const accessToken = userData.state?.user?.token?.accessToken;
  const userId = userData.state?.user?._id;
  return accessToken && userId ? { accessToken, userId } : null;
}

/**
 * 내 회원 상세 정보 조회 (모든 속성 포함)
 * @returns ApiRes<UserDetail>
 */
export async function getUserDetail(): Promise<ApiRes<UserDetail>> {
  const auth = await getAuthInfo();
  if (!auth) throw new Error('로그인이 필요합니다.');
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

    // 이미지 경로 보정
    if (data.ok && data.item && data.item.image) {
      data.item.image = `${API_URL}/${data.item.image}`;
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
