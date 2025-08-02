// app/community/[id]/components/UpdateButton.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { fetchPostById } from '@/lib/functions/communityFunctions';
import useUserStore from '@/store/authStore';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  postId: string;
}

export default function UpdateButton({ postId }: Props) {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const token = user?.token?.accessToken;

  const handleEdit = async () => {
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const post = await fetchPostById(postId);
      // 작성자 체크
      if (post.author.id !== String(user._id)) {
        alert('다른 사람의 게시물을 수정할 수 없습니다.');
        router.push('/community');
        return;
      }
      // 본인이면 편집 페이지로 이동
      router.push(`/community/${postId}/edit`);
    } catch (err) {
      console.error('게시글 불러오기 실패', err);
      alert('게시글 정보를 가져오지 못했습니다.');
    }
  };

  return (
    <Button variant='default' size='sm' onClick={handleEdit}>
      <Pencil size={12} className='mr-1' />
      수정
    </Button>
  );
}
