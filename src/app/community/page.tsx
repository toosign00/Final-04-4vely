import ClientCommunity from '@/app/community/_components/ClientCommunity';
import { fetchPosts } from '@/lib/functions/communityFunctions';

export default async function CommunityPage() {
  const { posts, pagination } = await fetchPosts(1, 8, 'community');
  return <ClientCommunity initialPosts={posts} initialPagination={pagination} />;
}
