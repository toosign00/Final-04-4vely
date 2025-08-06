// app/community/[id]/components/UpdateButton.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { fetchPostById } from '@/lib/functions/communityFunctions';
import { useAuth } from '@/store/authStore';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
  postId: string;
}

export default function UpdateButton({ postId }: Props) {
  const router = useRouter();
  const { isLoggedIn, zustandUser, session } = useAuth();
  const token = zustandUser?.token?.accessToken || session?.accessToken;
  const currentUserId = zustandUser?._id || session?.id;

  // 로컬 state: 작성자 여부, 로딩 여부
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(true);

  // 마운트 시점에 API 호출해서 작성자 검사
  useEffect(() => {
    (async () => {
      try {
        const post = await fetchPostById(postId);
        setIsAuthor(String(post.author.id) === String(currentUserId));
      } catch (err) {
        console.error(err);
        setIsAuthor(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId, currentUserId]);

  const handleEdit = () => {
    if (!isLoggedIn || !token) {
      return alert('로그인이 필요합니다.');
    }
    if (!isAuthor) {
      return alert('다른 사람의 게시물을 수정할 수 없습니다.');
    }
    router.push(`/community/${postId}/edit`);
  };

  return (
    <Button variant='default' size='sm' onClick={handleEdit} disabled={loading || !isLoggedIn || !token || !isAuthor} className='disabled:cursor-not-allowed'>
      <Pencil size={12} className='mr-1' />
      수정
    </Button>
  );
}
