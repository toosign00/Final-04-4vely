/**
 * 클라이언트에서 쿠키 파싱 유틸리티
 */
function parseCookies(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  return document.cookie.split(';').reduce((cookies: Record<string, string>, cookie) => {
    const [name, value] = cookie.split('=').map((c) => c.trim());
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
    return cookies;
  }, {});
}

/**
 * 클라이언트에서 액세스 토큰 가져오기
 */
export function getAccessToken(): string | null {
  try {
    const cookies = parseCookies();
    const userAuth = cookies['user-auth'];
    if (!userAuth) return null;

    const userData = JSON.parse(userAuth);
    return userData?.state?.user?.token?.accessToken || null;
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
    return null;
  }
}

/**
 * JWT 토큰 만료 여부 확인
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const decodedPayload = JSON.parse(atob(payload));
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedPayload.exp && decodedPayload.exp < currentTime;
  } catch {
    return true;
  }
}

/**
 * JWT 토큰 만료 임박 여부 확인 (5분 이내)
 */
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const decodedPayload = JSON.parse(atob(payload));
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutesFromNow = currentTime + 5 * 60;
    return decodedPayload.exp && decodedPayload.exp < fiveMinutesFromNow;
  } catch {
    return true;
  }
}

/**
 * 이미지 경로를 완전한 URL로 변환하는 클라이언트 함수
 */
export function getImageUrlClient(imagePath: string): string {
  if (!imagePath) return '';

  // 이미 완전한 URL인 경우 그대로 반환
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // NEXT_PUBLIC_API_URL 환경변수 사용
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error('NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.');
    return imagePath;
  }

  // 슬래시 처리
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${baseUrl}${path}`;
}
