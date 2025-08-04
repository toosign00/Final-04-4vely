'use server';

import { EmailCheckResult, NicknameCheckResult, SignUpRequestData, SignUpResult } from '@/app/(auth)/sign-up/_types';
import { signIn } from '@/auth';
import { ApiResPromise } from '@/types/api.types';
import { OAuthUser, User } from '@/types/user.types';

const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

/**
 * 회원가입 서버 액션
 * @param signUpData - 회원가입 데이터
 * @returns 표준화된 API 응답 형태
 */
export async function signUpAction(signUpData: SignUpRequestData): Promise<SignUpResult> {
  try {
    const result = await signUpUser(signUpData);
    return result;
  } catch {
    return {
      ok: 0,
      message: '회원가입 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 이메일 중복 확인 서버 액션
 * @param email - 확인할 이메일
 * @returns 이메일 사용 가능 여부
 */
export async function checkEmailAction(email: string): Promise<EmailCheckResult> {
  try {
    const result = await checkEmailAvailability(email);
    return result;
  } catch {
    return {
      ok: 0,
      message: '이메일 확인 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 닉네임 중복 확인 서버 액션
 * @param nickname - 확인할 닉네임
 * @returns 닉네임 사용 가능 여부
 */
export async function checkNicknameAction(nickname: string): Promise<NicknameCheckResult> {
  try {
    const result = await checkNicknameAvailability(nickname);
    return result;
  } catch {
    return {
      ok: 0,
      message: '닉네임 확인 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 회원가입 API 호출 함수
 * @param signUpData - 회원가입 데이터
 * @returns 표준화된 API 응답 형태
 */
async function signUpUser(signUpData: SignUpRequestData): Promise<SignUpResult> {
  try {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
      },
      body: JSON.stringify(signUpData),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: 0,
        message: data.message || '회원가입에 실패했습니다.',
        errors: data.errors,
      };
    }

    const user: User = data.item;
    if (!user) {
      return {
        ok: 0,
        message: '회원가입 정보가 올바르지 않습니다.',
      };
    }

    return {
      ok: 1,
      item: user,
    };
  } catch {
    return {
      ok: 0,
      message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

/**
 * 이메일 중복 확인 API 호출 함수
 * @param email - 확인할 이메일
 * @returns 이메일 사용 가능 여부
 */
async function checkEmailAvailability(email: string): Promise<EmailCheckResult> {
  try {
    const res = await fetch(`${API_URL}/users/email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Client-Id': CLIENT_ID,
      },
    });

    const data = await res.json();

    if (data.ok === 1) {
      return {
        ok: 1,
        item: { available: true },
      };
    } else if (data.ok === 0) {
      return {
        ok: 1, // API 통신은 성공했으므로 ok: 1, 비즈니스 로직 결과는 available: false
        item: { available: false },
      };
    } else {
      return {
        ok: 0,
        message: data.message || '서버 응답이 올바르지 않습니다.',
      };
    }
  } catch {
    return {
      ok: 0,
      message: '네트워크 오류가 발생했습니다.',
    };
  }
}

/**
 * 닉네임 중복 확인 API 호출 함수
 * @param nickname - 확인할 닉네임
 * @returns 닉네임 사용 가능 여부
 */
async function checkNicknameAvailability(nickname: string): Promise<NicknameCheckResult> {
  try {
    const res = await fetch(`${API_URL}/users/name?name=${encodeURIComponent(nickname)}`, {
      method: 'GET',
      headers: {
        'Client-Id': CLIENT_ID,
      },
    });

    const data = await res.json();

    if (data.ok === 1) {
      return {
        ok: 1,
        item: { available: true },
      };
    } else if (data.ok === 0) {
      return {
        ok: 1, // API 통신은 성공했으므로 ok: 1, 비즈니스 로직 결과는 available: false
        item: { available: false },
      };
    } else {
      return {
        ok: 0,
        message: data.message || '서버 응답이 올바르지 않습니다.',
      };
    }
  } catch {
    return {
      ok: 0,
      message: '네트워크 오류가 발생했습니다.',
    };
  }
}

/**
 * OAuth 인증 후 자동 회원가입 함수
 * @param user - OAuth 사용자 정보 객체
 * @returns 회원가입 결과 응답 객체
 * @description
 * OAuth 제공자 인증 후 자동으로 회원가입을 처리합니다.
 */
export async function createUserWithOAuth(user: OAuthUser): ApiResPromise<User> {
  const res = await fetch(`${API_URL}/users/signup/oauth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': CLIENT_ID,
    },
    body: JSON.stringify(user),
  });

  return res.json();
}

/**
 * OAuth 제공자로 인증된 사용자를 API 서버에 로그인 처리
 * @param providerAccountId - OAuth 제공자 계정 ID
 * @returns 로그인 결과 응답 객체
 * @description
 * OAuth 제공자 계정 ID를 사용하여 기존 사용자를 로그인 처리합니다.
 */
export async function loginWithOAuth(providerAccountId: string): ApiResPromise<User> {
  const res = await fetch(`${API_URL}/users/login/with`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Client-Id': CLIENT_ID,
    },
    body: JSON.stringify({ providerAccountId }),
  });
  return res.json();
}

/**
 * Auth.js 기반 로그인 함수
 * @param provider - 로그인 제공자 ('credentials', 'google', 'github', 'naver', 'kakao')
 * @param formData - 로그인 폼 데이터(FormData 객체)
 * @returns Promise<void>
 * @description
 * credentials 로그인 시 email/password를 사용하고, OAuth 로그인 시 provider만 사용합니다.
 */
export async function loginWithAuthjs(provider: string, formData: FormData) {
  // 로그인 후에 이동해야 할 페이지(redirect 파라미터) 추출
  const redirectTo = (formData.get('redirect') as string) || '/';

  await signIn(provider, { redirectTo });
}
