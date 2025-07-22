import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_API_BASE_URL;
const CLIENT_ID = process.env.NEXT_API_CLIENT_ID;

// 로그인 API - 사용자 로그인 처리
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 로그인 데이터 추출
    const loginData = await request.json();

    // 외부 API에 로그인 요청 (1일 만료)
    const res = await fetch(`${API_BASE_URL}/users/login?expiresIn=1d`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID || '',
      },
      body: JSON.stringify(loginData),
    });

    // API 응답 처리
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || '로그인에 실패했습니다.' }, { status: res.status });
    }

    // item과 accessToken 추출
    const user = data.item;
    const token = data.item?.token?.accessToken;

    if (!user || !token) {
      return NextResponse.json({ error: '로그인 정보가 올바르지 않습니다.' }, { status: 400 });
    }

    console.log('[로그인 API] 성공:', { userId: user._id, email: user.email });
    return NextResponse.json({ user, token }, { status: 200 });
  } catch (error) {
    console.error('[로그인 API] 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
