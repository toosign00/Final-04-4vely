import DeleteButton from '@/app/community/[id]/_components/DeleteButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { fetchPostById } from '@/lib/functions/community';
import { Post } from '@/types/commnunity.types';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post: Post;
  try {
    post = await fetchPostById(id);
  } catch {
    notFound();
  }

  const { title, coverImage, contents, author, createdAt, stats } = post;

  return (
    <div className='overflow-x-hidden'>
      {/* 대표 이미지 */}
      <div className='relative left-1/2 mb-10 h-64 -translate-x-1/2 overflow-hidden'>{coverImage && <Image src={coverImage} alt='대표 이미지' fill sizes='(max-width: 640px) 100vw, 640px' priority className='object-cover' />}</div>

      <main className='mx-auto w-full max-w-2xl px-4 pb-20'>
        {/* 제목 및 메타 영역 */}
        <section className='mb-10'>
          <h1 className='text-4xl leading-snug font-semibold whitespace-pre-wrap'>{title}</h1>

          <div className='mt-4 flex items-center justify-between'>
            {/* 왼쪽: 작성자 정보 */}
            <div className='flex items-center gap-2 text-sm'>
              <Avatar className='h-8 w-8'>{author.avatar ? <AvatarImage src={author.avatar} alt={author.username} /> : <AvatarFallback>{author.username.charAt(0)}</AvatarFallback>}</Avatar>
              <span>{author.username}</span>
            </div>

            {/* 오른쪽: 날짜 위, 버튼 아래 */}
            <div className='flex flex-col items-end space-y-2 text-sm'>
              {/* 날짜 */}
              <span>{new Date(createdAt).toLocaleDateString('ko-KR')}</span>
              {/* 버튼 그룹 */}
              <div className='flex items-center gap-2'>
                <Link href={`/community/${id}/edit`}>
                  <Button variant='default' size='sm'>
                    수정
                  </Button>
                </Link>
                <DeleteButton postId={id} />
              </div>
            </div>
          </div>
        </section>

        {/* 정보테이블 (하드코딩) */}
        <section className='mb-10 rounded-3xl'>
          <div className='overflow-hidden rounded border bg-white'>
            <table className='w-full border-collapse text-sm'>
              <tbody>
                <tr className='border-b'>
                  <th className='w-24 bg-neutral-50 px-4 py-3 text-left font-medium'>이름</th>
                  <td className='px-4 py-3'>안스리움</td>
                </tr>
                <tr className='border-b'>
                  <th className='w-24 bg-neutral-50 px-4 py-3 text-left font-medium'>애칭</th>
                  <td className='px-4 py-3'>---</td>
                </tr>
                <tr>
                  <th className='w-24 bg-neutral-50 px-4 py-3 text-left font-medium'>종류</th>
                  <td className='px-4 py-3'>붉은 안스리움</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 추가 컨텐츠 블록 (이미지 + 제목 + 내용) */}
        {contents.map((block) => (
          <section key={block.id} className='mb-10'>
            {block.postImage && (
              <div className='relative mx-auto aspect-[3/4] w-2/3 overflow-hidden rounded-lg sm:w-1/2 md:w-[360px]'>
                <Image src={block.postImage} alt={block.title || '첨부 이미지'} fill sizes='(max-width: 640px) 100vw, 640px' priority className='object-cover' />
              </div>
            )}

            {block.content && <p className='mt-2 text-sm leading-relaxed whitespace-pre-wrap'>{block.content}</p>}
          </section>
        ))}

        {/* 메타 및 액션 영역 */}
        <section className='mb-8'>
          <hr className='mb-4 border-gray-300' />
          <div className='flex items-center gap-8 text-sm text-neutral-700'>
            <span className='flex items-center gap-1'>
              <Heart className='text-red-400' size={14} />
              <span>{stats.likes}</span>
            </span>
            <span className='flex items-center gap-1'>
              <MessageCircle size={14} />
              <span>{stats.comments}</span>
            </span>
            <span className='flex items-center gap-1'>
              <Eye size={14} />
              <span>{stats.views}</span>
            </span>
            <Button className='ml-auto'>북마크</Button>
          </div>
        </section>

        {/* 댓글 입력 및 리스트 (하드코딩) */}
        <section className='mb-10'>
          <h3 className='mb-3 text-sm font-semibold'>댓글 입력</h3>
          <div className='flex items-start gap-4'>
            <textarea placeholder='칭찬과 격려의 댓글은 작성자에게 큰 힘이 됩니다 :) 2줄까지' className='h-12 flex-1 rounded border px-3 py-2 text-sm' />
            <Button variant='primary'>작성</Button>
          </div>
        </section>
        <section className='space-y-6'>
          {[1, 2].map((i) => (
            <div key={i} className='flex gap-3'>
              <Avatar className='h-9 w-9 shrink-0 bg-[#EF4444]' />
              <div className='flex-1'>
                <div className='mb-1 flex items-center justify-between gap-2'>
                  <span className='text-sm font-medium'>사용자명</span>
                  <div className='flex items-center gap-2'>
                    <Button variant='ghost'>수정</Button>
                    <Button variant='ghost'>삭제</Button>
                  </div>
                </div>
                <div className='p-4 text-xs leading-relaxed'>
                  [ 댓글 내용 ]<br />
                  --------------------------------------------------------------
                  <br />
                  --------------------------------------------------------------
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
