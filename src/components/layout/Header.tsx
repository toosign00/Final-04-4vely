'use client';
import { Button } from '@/components/ui/Button';
import { HEADER_CONTAINER, MOBILE_MENU_LINK, NAV_LINK, headerIcons, menuLinks } from '@/constants/header.constants';
import { useHeaderMenu } from '@/hooks/useHeaderMenu';
import useUserStore from '@/store/authStore';
import { Menu, ShoppingCart, UserRound, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { toast } from 'sonner';

export default function Header() {
  const { isOpen, setIsOpen, menuHeight, menuRef, buttonRef } = useHeaderMenu();
  const { user, logout } = useUserStore();

  // 로그아웃 함수
  const handleLogout = async () => {
    await logout();
    toast.success('로그아웃 되었습니다.', {
      description: '다음에 또 만나요!',
    });
  };

  // 아이콘 문자열을 실제 컴포넌트로 변환
  const iconMap: Record<string, React.ReactNode> = {
    UserRound: <UserRound size={24} />,
    ShoppingCart: <ShoppingCart size={24} />,
  };

  return (
    <header className='bg-surface text-secondary border-secondary/30 relative z-999 w-full border-b transition-all duration-300'>
      <div className={HEADER_CONTAINER}>
        {/* 로고 */}
        <Link href='/' aria-label='홈으로' className='flex items-center'>
          <Image src='/icons/logo.svg' alt='Green Mate' width={201} height={53} className='h-auto w-[7.5rem] max-w-[7.5rem] -translate-y-1.5' priority />
        </Link>

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
          {headerIcons.map((item) => {
            if (item.name === 'Login') {
              return user ? (
                <Button key='logout' type='button' variant='ghost' className='t-small text-secondary flex items-center justify-end' style={{ padding: '0px', minWidth: 50 }} onClick={handleLogout}>
                  Logout
                  <span className='sr-only'>로그아웃</span>
                </Button>
              ) : (
                <Link href={item.href} className='t-small text-secondary flex items-center justify-end' key='login' style={{ minWidth: 50 }} onClick={() => setIsOpen(false)}>
                  {item.text}
                  <span className='sr-only'>{item.name}</span>
                </Link>
              );
            }
            return (
              <Link href={item.href} className='t-small text-secondary flex items-center' key={item.name} onClick={() => setIsOpen(false)}>
                {item.icon ? iconMap[item.icon] : null}
                {item.text}
                <span className='sr-only'>{item.name}</span>
              </Link>
            );
          })}
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
                .map((link) => {
                  if (link.name === '로그인') {
                    return user ? (
                      <Button
                        key='logout-mobile'
                        type='button'
                        variant='link'
                        className={MOBILE_MENU_LINK}
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        로그아웃
                      </Button>
                    ) : (
                      <Link key='login-mobile' href={link.href} className={MOBILE_MENU_LINK} onClick={() => setIsOpen(false)}>
                        {link.name}
                      </Link>
                    );
                  }
                  return (
                    <Link key={link.name} href={link.href} className={MOBILE_MENU_LINK} onClick={() => setIsOpen(false)}>
                      {link.name}
                    </Link>
                  );
                })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
