'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UnauthorizedClient() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // 카운트다운 감소
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // 0이 되었을 때 라우팅
  useEffect(() => {
    if (countdown === 0) {
      router.push('/');
    }
  }, [countdown, router]);

  return (
    <div className='flex w-full max-w-lg flex-col items-center text-center'>
      <h1 className='t-h1 text-error mb-1'>403</h1>
      <h2 className='t-h2 text-error'>접근 권한이 없습니다.</h2>

      {/* 설명 텍스트 */}
      <div className='mb-2'>
        <p className='t-body text-secondary mb-2'>죄송합니다. 이 페이지에 접근할 권한이 없습니다.</p>
        <p className='t-desc text-gray-400'>관리자 권한이 필요하거나, 적절한 권한이 없어서 접근이 제한되었습니다.</p>
      </div>

      {/* 자동 리다이렉트 카운트다운 */}
      <div className={`mb-6 w-full rounded-lg border p-3 ${countdown <= 5 ? 'border-error bg-error/10' : 'border-warning bg-warning/10'}`}>
        <p className={`t-small ${countdown <= 5 ? 'text-error' : 'text-warning'}`}>
          <span className={`font-semibold ${countdown <= 5 ? 'text-error' : 'text-warning'}`}>{countdown}초</span> 후 자동으로 홈페이지로 이동합니다.
        </p>
      </div>

      {/* 액션 버튼들 */}
      <div className='mb-4 flex w-full flex-col gap-2'>
        <Button type='button' variant='primary' size='lg' fullWidth onClick={() => router.push('/')}>
          홈페이지로 이동
        </Button>
        <Button type='button' variant='default' size='lg' fullWidth onClick={() => router.back()}>
          이전 페이지로
        </Button>
      </div>

      {/* 도움말 링크 */}
      <div className='mt-4 w-full border-t border-gray-100 pt-4'>
        <p className='t-small mb-1 text-gray-400'>권한 관련 문의사항이 있으시면</p>
        <a href='mailto:kevinsoo1014@gmail.com' className='t-body text-secondary underline'>
          관리자에게 문의하기
        </a>
      </div>
    </div>
  );
}
