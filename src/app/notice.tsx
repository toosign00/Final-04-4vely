'use client';

import { Button } from '@/components/ui/Button'; // shadcn/ui 버튼 쓰는 경우
import { useEffect, useState } from 'react';

const NOTICE_KEY = 'GreenmateNotice';

export default function Notice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 로컬스토리지에 동의 여부 체크
    try {
      const agreed = localStorage.getItem(NOTICE_KEY);
      if (agreed !== 'true') {
        setOpen(true);
      }
    } catch {
      setOpen(true); // 저장 실패해도 보여주기
    }
  }, []);

  const handleAgree = () => {
    try {
      localStorage.setItem(NOTICE_KEY, 'true');
    } catch (e) {
      // 로컬스토리지 제한 환경일 수 있음
      console.warn('면책 조항 동의 정보를 저장할 수 없습니다.', e);
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div aria-modal='true' role='dialog' className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
      <div className='relative w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-gray-200'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-3'>
            <div className='text-2xl'>🦁</div>
            <h1 className='text-2xl font-bold'>멋쟁이사자처럼 학습 프로젝트</h1>
          </div>

          <p className='text-sm text-gray-700'>안녕하세요, 방문자님! 본 웹사이트는 멋쟁이사자처럼 프론트엔드 교육과정의 학습 프로젝트이며, 상업적 목적이 없습니다.</p>

          <div className='rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800'>
            <p className='mb-2 font-medium'>[면책 조항]</p>
            <ul className='list-inside list-disc space-y-1'>
              <li>교육 목적으로 제작된 비상업적 프로젝트입니다.</li>
              <li>사이트에 포함된 정보는 정확성이나 완전성을 보장하지 않습니다.</li>
              <li>표시된 상품, 서비스, 가격 등은 실제로 제공되지 않을 수 있습니다.</li>
              <li>제3자 콘텐츠가 포함될 수 있으며, 해당 저작권은 원 소유자에게 있습니다.</li>
            </ul>
          </div>

          <p className='text-sm'>확인 버튼을 클릭하시면 이 내용에 동의하신 것으로 간주됩니다. 즐거운 탐색 되세요!</p>

          <div className='mt-2 flex justify-center'>
            <Button onClick={handleAgree} className='w-full max-w-xs'>
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
