import ClientEdit from '@/app/community/[id]/edit/_components/ClientEdit';

export default async function CommunityEditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <ClientEdit postId={id} />;
}
