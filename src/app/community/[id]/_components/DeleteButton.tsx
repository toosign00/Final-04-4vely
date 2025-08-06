'use client';

import { deletePostById, fetchPostById } from '@/lib/functions/communityFunctions';
import { useAuth } from '@/store/authStore';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';

interface Props {
  postId: string;
}

export default function DeleteButton({ postId }: Props) {
  const router = useRouter();
  const { isLoggedIn, zustandUser, session } = useAuth();
  const token = zustandUser?.token?.accessToken || session?.accessToken;
  const currentUserId = zustandUser?._id || session?.id;

  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  useEffect(() => {
    (async () => {
      try {
        const post = await fetchPostById(postId);
        setIsAuthor(String(post.author.id) === String(currentUserId));
      } catch (err) {
        console.error('작성자 체크 실패', err);
        setIsAuthor(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId, currentUserId]);

  const handleDelete = async () => {
    try {
      if (!isLoggedIn || !token) throw new Error('인증이 필요합니다.');
      await deletePostById(postId, token);
      setResultDialog({
        open: true,
        title: '게시글이 삭제되었습니다.',
        onConfirm: () => {
          setResultDialog((prev) => ({ ...prev, open: false }));
          router.push('/community');
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const isForbidden = [/403/, /forbidden/i, /리소스를 찾을 수 없습니다/].some((rx) => rx.test(message));
      setResultDialog({
        open: true,
        title: isForbidden ? '다른 사람의 게시물을 삭제할 수 없습니다.' : '삭제 중 오류가 발생했습니다.',
        description: isForbidden ? undefined : message,
        onConfirm: () => setResultDialog((prev) => ({ ...prev, open: false })),
      });
    }
  };

  return (
    <>
      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant='destructive' size='sm' disabled={loading || !isLoggedIn || !token || !isAuthor} className='disabled:cursor-not-allowed'>
            <Trash2 size={12} className='mr-1' />
            삭제
          </Button>
        </AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 이 게시글을 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>삭제 후에는 복구할 수 없습니다.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex justify-end space-x-2'>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>

      {/* 결과 다이얼로그 */}
      <AlertDialog open={resultDialog.open} onOpenChange={(open) => setResultDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{resultDialog.title}</AlertDialogTitle>
              {resultDialog.description && <AlertDialogDescription>{resultDialog.description}</AlertDialogDescription>}
            </AlertDialogHeader>
            <AlertDialogFooter className='flex justify-end'>
              <AlertDialogAction onClick={resultDialog.onConfirm}>확인</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
}
