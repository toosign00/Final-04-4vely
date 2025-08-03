// src/app/community/page.tsx
import ClientCommunity from '@/app/community/_components/ClientCommunity';
import { getBulkBookmarks } from '@/lib/functions/shop/bookmarkServerFunctions';
import { fetchPosts } from '@/lib/functions/communityFunctions';

export default async function CommunityPage() {
  // 1) 커뮤니티 글 목록만 가져오기
  const { posts, pagination } = await fetchPosts(1, 4, 'community');

  // 2) Bulk로 북마크 조회
  const bmMap = await getBulkBookmarks(posts.map((p) => ({ id: Number(p.id), type: 'post' })));
  // bmMap의 키는 `post-<id>` 형식이고 값은 Bookmark 객체

  // 3) myBookmarkId 머지
  const initialPosts = posts.map((p) => ({
    ...p,
    myBookmarkId: bmMap.get(`post-${p.id}`)?._id ?? null,
  }));

  return <ClientCommunity initialPosts={initialPosts} initialPagination={pagination} />;
}
