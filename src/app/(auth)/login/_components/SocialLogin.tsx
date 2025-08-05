'use client';

import { loginWithAuthjs } from '@/lib/actions/authActions';

export default function SocialLogin() {
  return (
    <div className='space-y-4'>
      <form action={loginWithAuthjs.bind(null, 'naver')}>
        <button type='submit' className='flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#03C75A] px-7 py-2 text-sm font-medium text-white hover:bg-[#02B351]'>
          <svg width='18' height='18' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <g clipPath='url(#clip0_122_113)'>
              <path d='M10.8491 8.56267L4.91687 0H0V16H5.15088V7.436L11.0831 16H16V0H10.8491V8.56267Z' fill='white' />
            </g>
            <defs>
              <clipPath id='clip0_122_113'>
                <rect width='16' height='16' fill='#ffffff' />
              </clipPath>
            </defs>
          </svg>
          네이버 로그인
        </button>
      </form>

      <form action={loginWithAuthjs.bind(null, 'kakao')}>
        <button type='submit' className='flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#FEE500] px-7 py-2 text-sm font-medium text-black/85 hover:bg-[#F2D300] hover:text-black'>
          <svg width='18' height='18' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <g clipPath='url(#clip0_122_92)'>
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M18 1.19995C8.05835 1.19995 0 7.42587 0 15.1045C0 19.88 3.11681 24.0899 7.86305 26.5939L5.86606 33.8889C5.68962 34.5335 6.42683 35.0473 6.99293 34.6738L15.7467 28.8964C16.4854 28.9676 17.2362 29.0093 18 29.0093C27.9409 29.0093 35.9999 22.7836 35.9999 15.1045C35.9999 7.42587 27.9409 1.19995 18 1.19995Z'
                fill='#000000'
              />
            </g>
            <defs>
              <clipPath id='clip0_122_92'>
                <rect width='35.9999' height='36' fill='white' />
              </clipPath>
            </defs>
          </svg>
          카카오 로그인
        </button>
      </form>
    </div>
  );
}
