'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useLoginToast() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  useEffect(() => {
    if (reason === 'need-login') {
      setTimeout(() => {
        toast.warning('로그인이 필요한 서비스입니다.', {
          description: '로그인 후 이용해주세요.',
        });
      }, 500);
    }
  }, [reason]);
}
