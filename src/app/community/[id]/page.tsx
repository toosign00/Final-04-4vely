import ClientDetail from '@/app/community/[id]/_components/ClientDetail';
import { fetchPostById } from '@/lib/functions/communityFunctions';
import { notFound } from 'next/navigation';

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetchPostById(id).catch(() => null);
  if (!post) {
    notFound();
  }
  return <ClientDetail post={post} />;
}
