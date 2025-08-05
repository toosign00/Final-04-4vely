import ClientEdit from '@/app/community/[id]/edit/_components/ClientEdit';

export default async function CommunityEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientEdit postId={id} />;
}
