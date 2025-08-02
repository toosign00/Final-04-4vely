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
