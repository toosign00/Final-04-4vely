'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

export default function LoginToast() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  useEffect(() => {
    if (reason === 'need-login') {
      setTimeout(() => {
        toast.warning('로그인이 필요한 서비스입니다.', {
          description: '로그인 후 이용해주세요.',
          duration: 2500,
          style: {
            backgroundColor: 'white',
            color: 'var(--color-secondary)',
          },
        });
      }, 500);
    }
  }, [reason]);

  return <Toaster />;
}
