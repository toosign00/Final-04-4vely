'use server';

import { deletePostById, fetchPostById, updatePostById } from '@/lib/functions/communityFunctions';
import { getAuthInfo } from '@/lib/utils/auth.server';
import { redirect } from 'next/navigation';

//게시물 삭제
export async function handleDelete(formData: FormData) {
  const id = formData.get('id');
  if (typeof id !== 'string') throw new Error('유효하지 않은 게시글 ID입니다.');

  // 1) 인증 정보 가져오기
  const authInfo = await getAuthInfo();
  if (!authInfo) throw new Error('로그인이 필요합니다.');

  const { accessToken, userId: currentUserId } = authInfo;

  // 2) 삭제 전, 포스트 불러와 작성자 검증
  const post = await fetchPostById(id);
  if (post.author.id !== String(currentUserId)) {
    throw new Error('다른 사람의 게시물은 삭제할 수 없습니다.');
  }

  // 3) API 호출로 삭제
  await deletePostById(id, accessToken);

  // 4) 삭제 후 리스트로 리다이렉트
  redirect('/community');
}

//게시물수정
export async function handleUpdate(formData: FormData) {
  const id = formData.get('id');
  if (typeof id !== 'string') throw new Error('유효하지 않은 ID');

  // 1) 사용자 인증
  const authInfo = await getAuthInfo();
  if (!authInfo) throw new Error('로그인이 필요합니다.');

  const { accessToken, userId: currentUserId } = authInfo;

  // 2) 기존 게시물 조회 및 작성자 확인
  const existing = await fetchPostById(id);
  if (existing.author.id !== String(currentUserId)) {
    throw new Error('다른 사람의 게시물은 수정할 수 없습니다.');
  }

  // 3) 폼 필드 파싱
  const title = formData.get('title');
  const description = formData.get('description');
  const coverImage = formData.get('coverImage');
  const contentsRaw = formData.get('contents');

  if (typeof title !== 'string') throw new Error('제목이 필요합니다.');
  if (typeof contentsRaw !== 'string') throw new Error('본문 정보가 필요합니다.');

  const contents: {
    id: string;
    content: string;
    postImage: string;
  }[] = JSON.parse(contentsRaw);

  await updatePostById(
    id,
    {
      title,
      content: typeof description === 'string' ? description : undefined,
      coverImage: typeof coverImage === 'string' ? coverImage : undefined,
      extra: {
        contents,
      },
    },
    accessToken,
  );

  // 4) 완료 후 리디렉트
  redirect(`/community/${id}`);
}
