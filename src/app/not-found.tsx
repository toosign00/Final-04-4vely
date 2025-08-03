'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-6'>
      <div className='relative w-full max-w-lg rounded-2xl p-10'>
        <div className='flex flex-col items-center gap-6'>
          {/* 404 */}
          <div className='flex items-center gap-4 text-red-500'>
            <div className='flex h-24 w-24 items-center justify-center'>
              <div className='text-6xl leading-none font-extrabold'>4</div>
            </div>

            <div className='flex h-24 w-24 items-center justify-center'>
              <div className='text-6xl leading-none font-extrabold'>0</div>
            </div>

            <div className='flex h-24 w-24 items-center justify-center'>
              <div className='text-6xl leading-none font-extrabold'>4</div>
            </div>
          </div>

          <div className='text-center'>
            <h2 className='text-xl font-semibold text-gray-800'>페이지를 찾을 수 없어요.</h2>
            <p className='mt-2 max-w-[380px] text-sm text-gray-600'>입력한 주소가 잘못되었거나, 해당 페이지가 삭제된 것 같아요. 아래 버튼으로 돌아가보세요.</p>
          </div>

          {/* 버튼*/}
          <div className='mt-4 flex w-full flex-col gap-3 sm:flex-row'>
            <Button onClick={() => router.push('/')} className='flex-1'>
              홈으로 돌아가기
            </Button>
            <Button onClick={() => router.back()} className='flex-1'>
              이전으로
            </Button>
          </div>
        </div>
      </div>

      <p className='mt-8 text-xs text-gray-400'>문제가 지속되면 도움말을 확인하거나 문의해주세요.</p>
    </div>
  );
}
