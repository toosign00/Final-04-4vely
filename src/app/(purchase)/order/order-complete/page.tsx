'use client';

import hoyaImg from '@/assets/images/hoya_heart_brown.webp';
import { Button } from '@/components/ui/Button';

import Image from 'next/image';
import Link from 'next/link';

export default function OrderComplete() {
  return (
    <div className='bg-surface flex min-h-screen flex-col items-center px-4 py-20'>
      <h1 className='mb-20 text-4xl font-bold lg:mb-40'>결제가 완료되었습니다!</h1>

      {/* 흰색 배경 카드 */}
      <div className='mb-12 w-full max-w-md rounded-2xl bg-white p-6 shadow-md'>
        <div className='mb-8 flex flex-col items-center gap-8 lg:flex-row-reverse lg:items-center lg:justify-between'>
          {/* 결제된 상품 이미지 */}
          <div className='flex h-40 w-40 items-center justify-center rounded'>
            <Image src={hoyaImg} alt='호야 하트' className='h-40 w-40 rounded' />
          </div>

          {/* 주문 정보 */}
          <div className='space-y-4 text-left text-lg'>
            <div className='flex items-center gap-2'>
              <span>주문 상품:</span>
              <span className='font-semibold'>[주문 상품명]</span>
            </div>
            <p>
              결제 일시: <span className='font-medium'>[결제한 시각]</span>
            </p>
            <p>
              결제 금액: <span className='font-medium'>[결제한 금액]</span>
            </p>
          </div>
        </div>

        {/* 버튼*/}
        <div className='flex justify-center gap-4'>
          <Link href='/shop'>
            <Button variant='primary' size='lg'>
              쇼핑 계속하기
            </Button>
          </Link>
          <Link href='/my-page/order-history'>
            <Button variant='default' size='lg'>
              상세 주문 보기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
