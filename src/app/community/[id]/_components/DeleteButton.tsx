'use client';

import { Button } from '@/components/ui/Button';
import { deletePostById } from '@/lib/functions/communityFunctions';
import { useAuth } from '@/store/authStore';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  postId: string;
}

export default function DeleteButton({ postId }: Props) {
  const router = useRouter();
  const { isLoggedIn, zustandUser, session } = useAuth();
  const token = zustandUser?.token?.accessToken || session?.accessToken;

  const handleDelete = async () => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    try {
      if (!isLoggedIn || !token) throw new Error('인증이 필요합니다.');
      await deletePostById(postId, token);
      alert('게시글이 삭제되었습니다.');
      router.push('/community');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes('403') || message.toLowerCase().includes('forbidden') || message.includes('리소스를 찾을 수 없습니다')) {
        alert('다른 사람의 게시물을 삭제할 수 없습니다.');
      } else {
        alert(message || '삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Button variant='destructive' size='sm' onClick={handleDelete}>
      <Trash2 size={12} className='mr-1' />
      삭제
    </Button>
  );
}
