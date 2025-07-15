'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';

export default function AvatarTestPage() {
  return (
    <div className='bg-surface flex min-h-screen flex-col items-center p-8'>
      <h1 className='t-h1 text-center'>Avatar 컴포넌트 예시</h1>
      <div className='mx-auto max-w-4xl'>
        {/* 기본 아바타 예제 */}
        <section className='mb-12'>
          <h3 className='t-h3 mb-6'>기본 아바타</h3>
          <div className='flex flex-wrap items-center gap-6'>
            <div className='text-center'>
              <Avatar className='mb-2 h-16 w-16'>
                <AvatarImage src='https://avatars.githubusercontent.com/u/127032516?v=4' alt='사용자 프로필' />
                <AvatarFallback>toosign00</AvatarFallback>
              </Avatar>
              <p className='t-desc'>이미지 있는 아바타</p>
            </div>

            <div className='text-center'>
              <Avatar className='mb-2 h-16 w-16'>
                <AvatarFallback>노현수</AvatarFallback>
              </Avatar>
              <p className='t-desc'>이미지 없는 아바타</p>
            </div>

            <div className='text-center'>
              <Avatar className='mb-2 h-16 w-16'>
                <AvatarImage src='/invalid-image.jpg' alt='잘못된 이미지' />
                <AvatarFallback>오류</AvatarFallback>
              </Avatar>
              <p className='t-desc'>이미지 로드 실패</p>
            </div>
          </div>
        </section>

        {/* 다양한 크기 예제 */}
        <section className='mb-12'>
          <h3 className='t-h3 mb-6'>다양한 크기</h3>
          <div className='flex flex-wrap items-end gap-6'>
            <div className='text-center'>
              <Avatar className='mb-2 h-8 w-8'>
                <AvatarImage src='https://avatars.githubusercontent.com/u/127032516?v=4' alt='작은 아바타' />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <p className='text-secondary text-xs'>작은 (32px)</p>
            </div>

            <div className='text-center'>
              <Avatar className='mb-2 h-12 w-12'>
                <AvatarImage src='https://avatars.githubusercontent.com/u/127032516?v=4' alt='중간 아바타' />
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <p className='text-secondary text-xs'>중간 (48px)</p>
            </div>

            <div className='text-center'>
              <Avatar className='mb-2 h-16 w-16'>
                <AvatarImage src='https://avatars.githubusercontent.com/u/127032516?v=4' alt='큰 아바타' />
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
              <p className='text-secondary text-xs'>큰 (64px)</p>
            </div>

            <div className='text-center'>
              <Avatar className='mb-2 h-24 w-24'>
                <AvatarImage src='https://avatars.githubusercontent.com/u/127032516?v=4' alt='매우 큰 아바타' />
                <AvatarFallback>XL</AvatarFallback>
              </Avatar>
              <p className='text-secondary text-xs'>매우 큰 (96px)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
