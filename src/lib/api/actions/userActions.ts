'use server';

import { uploadFile } from '@/lib/api/actions/fileActions';
import { ApiRes } from '@/types/api.types';
import { User } from '@/types/user.types';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 프로필 이미지 업로드를 지원하는 회원 정보 수정
 * @param formData - 수정할 정보가 담긴 FormData 객체 (name, email, phone, address, attach)
 * @returns ApiRes<User>
 */
export async function updateUserProfile(formData: FormData): Promise<ApiRes<User>> {
  const cookieStore = await cookies();
  const userAuthCookie = cookieStore.get('user-auth')?.value;

  if (!userAuthCookie) {
    return {
      ok: 0,
      message: '로그인이 필요합니다.',
    };
  }

  const userData = JSON.parse(userAuthCookie);
  const accessToken = userData.state?.user?.token?.accessToken;
  const userId = userData.state?.user?._id;

  if (!accessToken) {
    return {
      ok: 0,
      message: '인증 토큰이 없습니다.',
    };
  }
  if (!userId) {
    return {
      ok: 0,
      message: '사용자 id가 없습니다.',
    };
  }

  let image: string | undefined;
  const attach = formData.get('attach') as File;
  if (attach && attach.size > 0) {
    const fileRes = await uploadFile(formData);
    if (fileRes.ok) {
      image = fileRes.item[0].path;
    } else {
      return fileRes as ApiRes<User>;
    }
  }

  const name = formData.get('name') as string | undefined;
  const email = formData.get('email') as string | undefined;
  const address = formData.get('address') as string | undefined;
  const phone = formData.get('phone') as string | undefined;

  try {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(address ? { address } : {}),
        ...(phone ? { phone } : {}),
        ...(image ? { image } : {}),
      }),
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
