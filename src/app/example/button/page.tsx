'use client';

import { Button } from '@/components/ui/Button';
import { Download, Save, Send, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function TestPage() {
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [isLoading4, setIsLoading3] = useState(false);
  const [isLoading5, setIsLoading4] = useState(false);

  const handleLoadingTest = (setLoading: (loading: boolean) => void) => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className='bg-surface min-h-screen space-y-8 p-8'>
      <h1 className='t-h1 mb-10 text-center'>Button 컴포넌트 예시</h1>

      {/* 기본 버튼들 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>기본 스타일</h2>
        <div className='flex flex-wrap gap-4'>
          <Button variant='default'>기본 버튼</Button>
          <Button variant='primary'>주요 버튼</Button>
          <Button variant='secondary'>보조 버튼</Button>
          <Button variant='ghost'>고스트 버튼</Button>
          <Button variant='link'>링크 버튼</Button>
          <Button variant='destructive'>위험 버튼</Button>
        </div>
      </div>

      {/* 크기 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>크기</h2>
        <div className='flex flex-wrap items-center gap-4'>
          <Button size='sm'>작은 버튼</Button>
          <Button size='default'>기본 버튼</Button>
          <Button size='lg'>큰 버튼</Button>
          <Button size='icon'>
            <Send className='size-4' />
          </Button>
        </div>
      </div>

      {/* 로딩 상태 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>로딩 상태</h2>
        <div className='flex flex-wrap gap-4'>
          <Button variant='default' loading={isLoading1} onClick={() => handleLoadingTest(setIsLoading1)}>
            데이터 로드
          </Button>
          <Button variant='destructive' loading={isLoading2} loadingText='삭제 중...' onClick={() => handleLoadingTest(setIsLoading2)}>
            파일 삭제
          </Button>
        </div>
        <p className='t-desc'>💡 각 variant의 색상이 로딩 중에도 유지됩니다</p>
      </div>

      {/* 전체 너비 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>전체 너비</h2>
        <div className='space-y-3'>
          <Button fullWidth variant='default'>
            전체 너비 기본 버튼
          </Button>
          <Button fullWidth variant='primary' loading={isLoading4} loadingText='처리 중...' onClick={() => handleLoadingTest(setIsLoading3)}>
            전체 너비 + 로딩
          </Button>
        </div>
      </div>

      {/* 비활성화 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>비활성화</h2>
        <div className='flex flex-wrap gap-4'>
          <Button disabled>비활성화</Button>

          <Button variant='destructive' disabled>
            비활성화
          </Button>
        </div>
      </div>

      {/* 실제 사용 예시 */}
      <div className='space-y-4'>
        <h2 className='t-h3'>💡 실제 사용 예시</h2>

        {/* 회원가입 폼 */}
        <div className='max-w-[31.25rem] rounded-lg border bg-white p-6'>
          <h3 className='mb-4 font-semibold'>회원가입 폼</h3>
          <div className='space-y-3'>
            <Button fullWidth variant='default' size='default' loading={isLoading5} loadingText='회원가입 중...' onClick={() => handleLoadingTest(setIsLoading4)}>
              <UserPlus className='size-4' />
              회원가입
            </Button>
            <Button fullWidth variant='primary' size='default'>
              <svg className='size-4' viewBox='0 0 24 24'>
                <path fill='currentColor' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                <path fill='currentColor' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                <path fill='currentColor' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                <path fill='currentColor' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
              </svg>
              구글로 가입하기
            </Button>
          </div>
        </div>

        {/* 파일 관리 */}
        <div className='rounded-lg border bg-white p-6'>
          <h3 className='mb-4 font-semibold'>파일 관리</h3>
          <div className='flex gap-2'>
            <Button size='sm' variant='default'>
              <Download className='size-4' />
              다운로드
            </Button>
            <Button size='sm' variant='secondary'>
              <Save className='size-4' />
              저장
            </Button>
            <Button size='sm' variant='destructive'>
              <Trash2 className='size-4' />
              삭제
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
