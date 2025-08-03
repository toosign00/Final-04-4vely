'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleRetry = () => {
    if (typeof reset === 'function') {
      reset(); // Next.js에서 제공하는 재시도(다시시도 버튼)
    } else {
      router.refresh(); // fallback
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center'>
      <div className='w-full max-w-md rounded-2xl bg-white p-10 shadow-lg'>
        <div className='flex flex-col items-center gap-4'>
          <div className='flex items-center gap-3'>
            <AlertTriangle className='text-destructive h-12 w-12' />
            <h1 className='text-4xl font-bold'>문제가 발생했어요!!</h1>
          </div>
          <p className='text-secondary text-sm'>{error?.message ? `오류 메시지: ${error.message}` : '예상치 못한 오류가 생겼습니다. 아래 버튼으로 다시 시도하거나 홈으로 돌아가세요.'}</p>

          <div className='mt-2 flex flex-col justify-center gap-3 sm:flex-row'>
            <Button onClick={handleRetry} className='flex items-center gap-2'>
              다시 시도
            </Button>
            <Link href='/' passHref>
              <Button asChild className='flex items-center gap-2'>
                <div className='flex items-center gap-2'>
                  <Home className='h-4 w-4' />
                  홈으로
                </div>
              </Button>
            </Link>
          </div>

          <details className='mt-4 overflow-auto rounded-md bg-gray-300 p-3 text-left text-xs'>
            <summary className='cursor-pointer font-medium'>자세한 정보 보기</summary>
            <pre className='mt-2 break-all whitespace-pre-wrap'>{error?.stack || '스택 정보가 없습니다.'}</pre>
          </details>

          <p className='text-muted-foreground mt-4 text-base'>
            문제가 반복되면 개발자에게 이 화면을 캡처해 공유해 주세요. (경로: <code>{pathname}</code>)
          </p>
        </div>
      </div>
    </div>
  );
}
