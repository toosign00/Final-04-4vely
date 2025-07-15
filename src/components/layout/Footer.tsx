'use client';

import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import React from 'react';
import { FaFacebook, FaInstagram, FaXTwitter, FaYoutube } from 'react-icons/fa6';

export default function Footer() {
  // 소셜 미디어 아이콘 링크 배열
  const socialIcons = [
    {
      name: 'Instagram',
      href: '#',
      icon: <FaInstagram />,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: <FaXTwitter />,
    },
    {
      name: 'Facebook',
      href: '#',
      icon: <FaFacebook />,
    },
    {
      name: 'YouTube',
      href: '#',
      icon: <FaYoutube />,
    },
  ];

  // 푸터 링크 배열
  const footerLinks = [
    { name: '홈', href: '/' },
    { name: '쇼핑하기', href: '#' },
    { name: '커뮤니티', href: '#' },
    { name: 'FAQ', href: '#' },
    { name: '마이페이지', href: '#' },
    { name: '이용약관', href: '#' },
    { name: '개인정보', href: '#' },
    { name: '고객센터', href: '#' },
  ];

  return (
    <footer className='bg-secondary relative overflow-hidden'>
      <div className='relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6'>
        {/* 메인 콘텐츠 영역 */}
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          {/* 브랜드 섹션 */}
          <div className='flex flex-col gap-3 lg:max-w-xs'>
            <h3 className='t-h3 text-white'>GREEN MATE</h3>
            <p className='t-body text-white'>
              브랜드 슬로건 들어가면 됩니다.
              <br />
              브랜드 슬로건 들어가면 됩니다.
            </p>

            {/* 소셜 미디어 */}
            <div>
              <h4 className='sr-only'>소셜 미디어</h4>
              <div className='flex gap-2'>
                {socialIcons.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className='hover:bg-primary focus-visible bg-secondary flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-white transition-all duration-300 hover:shadow-lg'
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 푸터 메뉴 */}
          <nav aria-label='푸터 메뉴' className='flex flex-col gap-3 lg:items-end'>
            <h4 className='sr-only'>메뉴</h4>
            {/* 데스크톱: 가로 배치 */}
            <div className='hidden items-center justify-center gap-2 md:flex lg:justify-end'>
              {footerLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Button variant='link' size='sm' asChild className='text-white hover:text-white'>
                    <Link href={link.href}>{link.name}</Link>
                  </Button>
                  {index < footerLinks.length - 1 && <span className='t-body flex items-center text-white'>|</span>}
                </React.Fragment>
              ))}
            </div>

            {/* 모바일: 세로 배치 */}
            <div className='md:hidden'>
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4'>
                {footerLinks.map((link) => (
                  <Button key={link.name} variant='link' size='sm' asChild className='justify-start border-0 text-white hover:text-white'>
                    <Link href={link.href}>{link.name}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* 푸터 하단 */}
      <div className='relative z-10 border-t border-gray-300/20'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col items-center justify-between gap-3 sm:flex-row'>
            <p className='text-sm text-gray-500'>© 2025 GREEN MATE. All Rights Reserved.</p>
            <p className='text-sm text-gray-500'>Developed by Team 4vely</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
