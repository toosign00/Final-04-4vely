'use server';

import { uploadFile } from '@/lib/actions/fileActions';
import { ApiRes } from '@/types/api.types';
import { User } from '@/types/user.types';
import { getAuthInfo } from '@/lib/utils/auth.server';

const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 프로필 이미지 업로드를 지원하는 회원 정보 수정 및 비밀번호 변경
 * @param formData - 수정할 정보가 담긴 FormData 객체 (name, email, phone, address, attach, currentPassword, newPassword)
 * @returns ApiRes<User>
 */
export async function updateUserProfile(formData: FormData): Promise<ApiRes<User>> {
  // 인증 정보 검증
  const authResult = await validateAuth();
  if (!authResult.success) {
    return {
      ok: 0,
      message: authResult.message,
    };
  }

  const { accessToken, userId } = authResult;

  // FormData에서 데이터 추출
  const profileData = extractFormData(formData);
  const isPasswordChange = profileData.currentPassword && profileData.newPassword;

  // 이미지 파일 처리
  let image: string | undefined;
  if (profileData.attach && profileData.attach.size > 0) {
    const fileRes = await uploadFile(formData);
    if (fileRes.ok) {
      image = fileRes.item[0].path;
    } else {
      return fileRes as ApiRes<User>;
    }
  }

  // 요청 본문 구성
  const requestBody = isPasswordChange ? buildPasswordChangeBody(profileData.currentPassword!, profileData.newPassword!) : buildProfileUpdateBody(profileData, image);

  // API 요청 실행
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: 0,
        message: data.message || getErrorMessage(!!isPasswordChange),
      };
    }

    // 비밀번호 변경인 경우 성공 메시지 반환
    if (isPasswordChange) {
      return {
        ok: 1,
        item: { message: '비밀번호가 성공적으로 변경되었습니다.' } as User & { message: string },
      };
    }

    return data;
  } catch {
    return {
      ok: 0,
      message: getServerErrorMessage(!!isPasswordChange),
    };
  }
}

// 인증 정보 검증 헬퍼 함수
async function validateAuth(): Promise<{ success: false; message: string } | { success: true; accessToken: string; userId: string }> {
  const authInfo = await getAuthInfo();

  if (!authInfo) {
    return { success: false, message: '로그인이 필요합니다.' };
  }

  return { success: true, accessToken: authInfo.accessToken, userId: String(authInfo.userId) };
}

// FormData에서 데이터 추출 헬퍼 함수
function extractFormData(formData: FormData) {
  return {
    name: formData.get('name') as string | undefined,
    email: formData.get('email') as string | undefined,
    address: formData.get('address') as string | undefined,
    phone: formData.get('phone') as string | undefined,
    currentPassword: formData.get('currentPassword') as string | undefined,
    newPassword: formData.get('newPassword') as string | undefined,
    attach: formData.get('attach') as File | undefined,
  };
}

// 비밀번호 변경 요청 본문 구성
function buildPasswordChangeBody(currentPassword: string, newPassword: string) {
  return {
    currentPassword,
    password: newPassword,
  };
}

// 프로필 업데이트 요청 본문 구성
function buildProfileUpdateBody(data: ReturnType<typeof extractFormData>, image?: string) {
  return {
    ...(data.name && { name: data.name }),
    ...(data.email && { email: data.email }),
    ...(data.address && { address: data.address }),
    ...(data.phone && { phone: data.phone }),
    ...(image && { image }),
  };
}

// 에러 메시지 헬퍼 함수들
function getErrorMessage(isPasswordChange: boolean) {
  return isPasswordChange ? '비밀번호 변경에 실패했습니다.' : '회원 정보 수정에 실패했습니다.';
}

function getServerErrorMessage(isPasswordChange: boolean) {
  return isPasswordChange ? '서버 오류로 비밀번호를 변경하지 못했습니다.' : '서버 오류로 회원 정보를 수정하지 못했습니다.';
}
