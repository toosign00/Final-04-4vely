'use client';
import { Button } from '@/components/ui/Button';
import { HEADER_CONTAINER, MOBILE_MENU_LINK, NAV_LINK, headerIcons, menuLinks } from '@/constants/header.constants';
import { useHeaderMenu } from '@/hooks/useHeaderMenu';
import { Menu, ShoppingCart, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function Header() {
  const { isOpen, setIsOpen, menuHeight, menuRef, buttonRef } = useHeaderMenu();

  // 아이콘 문자열을 실제 컴포넌트로 변환
  const iconMap: Record<string, React.ReactNode> = {
    UserRound: <UserRound size={24} />,
    ShoppingCart: <ShoppingCart size={24} />,
  };

  return (
    <header className='bg-surface text-secondary border-secondary/30 relative z-1 w-full border-b transition-all duration-300' role='banner'>
      <div className={HEADER_CONTAINER}>
        {/* 로고 */}
        <div className='t-h4'>
          <Link href='/' aria-label='홈으로'>
            GREEN MATE
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className='hidden gap-4 md:flex' aria-label='주요 메뉴'>
          {menuLinks
            .filter((link) => link.showOn.includes('desktop'))
            .map((link) => (
              <Button key={link.name} variant='link' className={NAV_LINK} asChild>
                <Link href={link.href}>{link.name}</Link>
              </Button>
            ))}
        </nav>

        {/* 우측 아이콘 메뉴 (데스크탑) */}
        <div className='hidden items-center gap-3 md:flex'>
          {headerIcons.map((item) => (
            <Link href={item.href} className='t-small text-secondary flex items-center' key={item.name} onClick={() => setIsOpen(false)}>
              {item.icon ? iconMap[item.icon] : null}
              {item.text}
              <span className='sr-only'>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* 햄버거/닫기 버튼 (모바일) */}
        <Button ref={buttonRef} variant='ghost' className='md:hidden' type='button' aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={isOpen} aria-controls='mobile-menu' onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? <X className='size-6' /> : <Menu className='size-6' />}
        </Button>
      </div>

      {/* 모바일 메뉴 */}
      {isOpen && (
        <div
          id='mobile-menu'
          className='border-border-default/30 bg-surface absolute top-full right-0 left-0 z-50 overflow-hidden border-b shadow-sm transition-all duration-300 md:hidden'
          style={{
            height: menuHeight,
            opacity: 1,
          }}
          aria-hidden={!isOpen}
          role='dialog'
          aria-modal='true'
          aria-labelledby='mobile-menu-title'
        >
          {/* 실제 메뉴 내용: ref로 높이 측정 */}
          <div ref={menuRef}>
            <nav className='flex flex-col items-center gap-6 px-8 py-10' aria-label='모바일 메뉴'>
              <span id='mobile-menu-title' className='sr-only'>
                모바일 메뉴
              </span>
              {menuLinks
                .filter((link) => link.showOn.includes('mobile'))
                .map((link) => (
                  <Link key={link.name} href={link.href} className={MOBILE_MENU_LINK} onClick={() => setIsOpen(false)}>
                    {link.name}
                  </Link>
                ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
