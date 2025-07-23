import hoyaImg from '@/assets/images/hoya_heart_brown.webp';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Eye, Heart, MessageCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
export default function CommunityDetailPage() {
  return (
    <div className='overflow-x-hidden'>
      <div className='relative left-1/2 mb-6 h-64 -translate-x-1/2 overflow-hidden'>
        <Image src={hoyaImg} alt='대표 이미지' fill className='object-cover' priority />
      </div>
      <main className='mx-auto w-full max-w-2xl px-4 pb-20'>
        {/* 대표(대문) 이미지 */}

        {/* 상단 정보 블록 */}
        <section className='mb-6'>
          <div className='flex items-start justify-between gap-4'>
            <h1 className='text-xl leading-snug font-semibold'>
              [ 제목 ] 나의 식물 키우기 일지 / 1일차! <br className='hidden sm:block' />
              2줄까지 가능
            </h1>
          </div>

          {/* 작성자 + 날짜 + 수정/삭제 */}
          <div className='mt-4 flex items-start gap-4'>
            {/* 왼쪽: 아바타 + 사용자명 */}
            <div className='flex items-center gap-3'>
              <Avatar className='h-8 w-8 bg-[#EF4444]' />
              <span className='text-sm font-medium'>사용자명</span>
            </div>

            {/* 오른쪽: 날짜 + 버튼(수직 스택) */}
            <div className='ml-auto flex flex-col items-end gap-2'>
              <span className='text-xs'>2025-07-12</span>
              <div className='flex items-center gap-2'>
                <Link href='/community/id/edit'>
                  <Button variant='default'>수정하기</Button>
                </Link>
                <Button variant='destructive'>
                  <Trash2 className='mr-1 size-4' />
                  삭제
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 정보테이블 */}
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

        {/* 첨부 이미지 */}
        <section className='mb-10'>
          <div className='relative mx-auto aspect-[3/4] w-2/3 overflow-hidden rounded-lg sm:w-1/2 md:w-[360px]'>
            <Image src={hoyaImg} alt='첨부 이미지' fill className='object-cover' />
          </div>
        </section>

        {/* 본문 내용 */}
        <section className='mb-10'>
          <div className='text-sm leading-relaxed'>
            <p className='mb-6'>
              [ 본문 내용 ] <br />
              -------------------------------------------------------------- <br />
              -------------------------------------------------------------- <br />
              -------------------------------------------------------------- <br />[ 본문 내용 ]
            </p>
          </div>
        </section>

        {/* 좋아요,댓글, 시청수, 북마크 */}
        <section className='mb-8'>
          <hr className='mb-4 border-gray-300' />
          <div className='flex items-center gap-8 text-sm text-neutral-700'>
            <span className='flex items-center gap-1'>
              <Heart className='text-red-400' size={14} aria-hidden='true' />
              <span>70</span>
            </span>
            <span className='flex items-center gap-1'>
              <MessageCircle size={14} aria-hidden='true' />
              <span>200</span>
            </span>
            <span className='flex items-center gap-1'>
              <Eye size={14} aria-hidden='true' />
              <span>14</span>
            </span>
            <Button className='ml-auto'>북마크</Button>
          </div>
        </section>

        {/* 댓글 입력 */}
        <section className='mb-10'>
          <h3 className='mb-3 text-sm font-semibold'>댓글 목록</h3>

          <div className=''>
            <div className='flex items-start gap-4'>
              <textarea placeholder='칭찬과 격려의 댓글은 작성자에게 큰 힘이 됩니다 :) 2줄까지' className='h-12 flex-1 rounded border px-3 py-2 text-sm' />
              <Button variant='primary' className='flex items-center justify-center'>
                작성
              </Button>
            </div>
          </div>
        </section>

        {/* 댓글 리스트 */}
        <section className='space-y-6'>
          {[1, 2].map((i) => (
            <div key={i} className='flex gap-3'>
              <Avatar className='h-9 w-9 shrink-0 bg-[#EF4444]' />
              <div className='flex-1'>
                {/* 헤더: 작성자 왼쪽 / 수정·삭제 오른쪽 */}
                <div className='mb-1 flex items-center justify-between gap-4'>
                  <span className='text-sm font-medium'>사용자명</span>

                  <div className='flex items-center'>
                    <Button variant='ghost' type='button'>
                      수정
                    </Button>
                    <Button variant='ghost' type='button'>
                      삭제
                    </Button>
                  </div>
                </div>

                {/* 본문 */}
                <div className='p-4 text-xs leading-relaxed'>
                  [ 댓글 내용 ] <br />
                  -------------------------------------------------------------- <br />
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
