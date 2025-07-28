'use client';

import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  title: string;
  message: string;
}

export default function ErrorDisplay({ title, message }: ErrorDisplayProps) {
  return (
    <div className='flex items-center justify-center'>
      <div className='flex w-full max-w-md flex-col items-center gap-6 px-8 py-12'>
        <AlertCircle className='text-error mb-2 size-12' />
        <div className='t-h3 text-secondary mb-1'>{title}</div>
        <div className='t-desc text-secondary/70 mb-4 text-center'>
          {message}
          <br />
          잠시 후 다시 시도해 주세요.
        </div>
        <Button variant='secondary' onClick={() => window.location.reload()}>
          새로고침
        </Button>
      </div>
    </div>
  );
}