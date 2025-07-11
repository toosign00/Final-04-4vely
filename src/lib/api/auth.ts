// API 헤더 설정 함수
export const getApiHeaders = () => {
  const clientId = process.env.NEXT_PUBLIC_API_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_API_CLIENT_ID 환경변수가 설정되지 않았습니다.');
  }

  return {
    'Content-Type': 'application/json',
    'client-id': clientId,
  };
};

// API 서버 URL 가져오기
export const getApiServerUrl = () => {
  return process.env.API_SERVER_URL || 'https://fesp-api.koyeb.app/market';
};

// 유저 목록 조회 함수
export const fetchUsers = async (page: number = 1, limit: number = 10) => {
  try {
    const apiUrl = getApiServerUrl();
    const headers = getApiHeaders();

    const response = await fetch(`${apiUrl}/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API 서버 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('유저 목록 조회 오류:', error);
    throw error;
  }
};

// 상품 상세 조회 함수
export const fetchProduct = async (productId: number) => {
  try {
    const apiUrl = getApiServerUrl();
    const headers = getApiHeaders();

    const response = await fetch(`${apiUrl}/products/${productId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`상품 ${productId}을 찾을 수 없습니다.`);
      }
      throw new Error(`API 서버 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`상품 ${productId} 조회 오류:`, error);
    throw error;
  }
};
