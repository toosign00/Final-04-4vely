'use server';

import { CommunityPost, CommunityPostServerRes } from '@/types/homeCommunityPop.types';

const API_URL = process.env.API_URL;
const CLIENT_ID = process.env.CLIENT_ID || '';

// 조회수 기준으로 커뮤니티 인기글 가져옴
export async function getCommunityPopPosts(type: string, page = 1, limit = 4): Promise<CommunityPost[]> {
  try {
    const res = await fetch(`${API_URL}/posts?type=${type}&page=${page}&limit=${limit}`, {
      headers: {
        'Client-Id': CLIENT_ID,
      },
      cache: 'force-cache',
    });

    const data: CommunityPostServerRes = await res.json();

    if (!data.ok || !data.item) return [];

    return data.item;
  } catch {
    throw new Error('홈의 커뮤니티 인기글을 불러오는 데 실패했습니다.');
  }
}
