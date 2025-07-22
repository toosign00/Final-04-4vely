import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_API_BASE_URL;
const CLIENT_ID = process.env.NEXT_API_CLIENT_ID;

// 로그아웃 API - 사용자 로그아웃 처리
export async function POST(request: NextRequest) {
  try {
    // 요청 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: '토큰이 제공되지 않았습니다.' }, { status: 401 });
    }

    // 외부 API에 로그아웃 요청
    const res = await fetch(`${API_BASE_URL}/users/logout`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID || '',
        Authorization: `Bearer ${token}`,
      },
    });

    // API 응답 처리
    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.message || '로그아웃에 실패했습니다.' }, { status: res.status });
    }

    // 성공 시 응답
    return NextResponse.json({ message: '성공적으로 로그아웃되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('[로그아웃 API] 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
