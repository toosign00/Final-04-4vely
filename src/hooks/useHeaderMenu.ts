import { useEffect, useRef, useState } from 'react';

/**
 * Header 메뉴 열림/닫힘, 높이 측정, 포커스 복원 등 UI 상태 관리 커스텀 훅
 */
export function useHeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 윈도우 리사이즈 시 md(768px) 이상이면 메뉴 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 메뉴가 열릴 때 실제 높이 측정 (트랜지션용, 열릴 때만 측정)
  useEffect(() => {
    if (isOpen && menuRef.current) {
      setMenuHeight(menuRef.current.scrollHeight);
    }
  }, [isOpen]);

  // 모바일 메뉴 열릴 때 body 스크롤 방지 및 닫힐 때 포커스 복원
  useEffect(() => {
    if (!isOpen) {
      buttonRef.current?.focus();
      setMenuHeight(0);
    }
  }, [isOpen]);

  return { isOpen, setIsOpen, menuHeight, menuRef, buttonRef };
}
