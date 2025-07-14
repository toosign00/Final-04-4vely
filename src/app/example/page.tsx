'use client';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ExamplePage() {
  const components = [
    {
      title: 'Button',
      description: '버튼 컴포넌트',
      href: '/example/button',
      color: 'bg-primary-500',
    },
    {
      title: 'Avatar',
      description: '사용자 프로필 이미지',
      href: '/example/avatar',
      color: 'bg-secondary-500',
    },
    {
      title: 'Card',
      description: '카드 레이아웃 컴포넌트',
      href: '/example/card',
      color: 'bg-accent-500',
    },
    {
      title: 'Select',
      description: '드롭다운 선택 컴포넌트',
      href: '/example/select',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className='min-h-screen bg-neutral-50 p-8'>
      <div className='mx-auto max-w-4xl'>
        {/* 헤더 */}
        <div className='mb-12 text-center'>
          <h1 className='t-h1 mb-4 text-neutral-900'>shadcn/ui 컴포넌트 네비게이션</h1>
          <p className='t-body text-neutral-600'>프로젝트에서 사용하는 주요 UI 컴포넌트들을 확인할 수 있습니다.</p>
        </div>

        {/* 컴포넌트 그리드 */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {components.map((component) => (
            <div key={component.title} className='group rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'>
              <div className='mb-4'>
                <div className='flex-1'>
                  <h3 className='t-h3 text-neutral-900'>{component.title}</h3>
                  <p className='t-body mt-1 text-neutral-600'>{component.description}</p>
                </div>
              </div>

              <Button asChild fullWidth={true}>
                <Link href={component.href}>
                  <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                  링크 보기
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
