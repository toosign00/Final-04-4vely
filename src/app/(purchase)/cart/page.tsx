'use client';

import hoyaImg from '@/assets/images/hoya_heart_brown.webp';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function CartPage() {
  return (
    <div className='bg-surface w-full py-8 lg:px-6'>
      {/* 헤더 영역 */}
      <div className='flex items-center lg:mb-24'>
        <Button variant='ghost' size='icon' className='mr-2 text-4xl lg:hidden' aria-label='뒤로 가기'>
          ←
        </Button>
        <h1 className='font-regular text-3xl md:text-4xl'>
          <span>CART</span>
          <span className='mt-1 hidden text-base lg:block'>| SHOPPING CART</span>
        </h1>
      </div>

      <div className='mx-2 sm:mx-8 lg:flex lg:gap-6'>
        {/* 왼쪽: 장바구니 아이템 목록 */}
        <div className='flex-1'>
          <hr className='my-4 block border-gray-300 lg:hidden' />
          {/* 선택 영역 */}
          <div className='flex items-center justify-start border-b-2 text-base lg:text-2xl'>
            <div className='flex items-center gap-2'>
              <Checkbox id='select-all' />
              <label htmlFor='select-all' className='cursor-pointer'>
                모두 선택
              </label>
            </div>
            <Button variant='ghost' className='ml-auto lg:text-2xl'>
              선택 삭제
            </Button>
            <hr className='mt-4 mb-7' />
          </div>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx}>
              {/* 카드 */}
              <div className='lg:bg-surface md:border-gray-300-1 mt-7 flex items-stretch justify-between rounded-2xl bg-white px-3 py-7'>
                {/* 왼쪽: 체크박스 + 이미지 + 텍스트 */}
                <div className='flex h-full items-start gap-3'>
                  <Checkbox id={`item-${idx}`} defaultChecked className='mt-[2px]' />
                  <div className='relative h-35 w-24 shrink-0 sm:h-32 sm:w-32 lg:h-40 lg:w-40'>
                    <Image src={hoyaImg} alt='호야 하트' fill className='rounded object-cover' />
                  </div>
                  <div className='flex h-36 flex-col justify-between py-1 sm:h-32 lg:h-40'>
                    <div>
                      <h2 className='mb-1 text-lg font-semibold sm:text-3xl lg:text-3xl'>호야 하트</h2>
                      <p className='text-muted-foreground text-sm sm:text-base lg:text-base'>화분 색상 : 브라운</p>
                    </div>
                    <p className='text-sm font-semibold sm:text-2xl lg:text-2xl'>₩ 36,000</p>
                  </div>
                </div>

                {/* 버튼들 */}
                <div className='flex h-full flex-col items-end gap-5 lg:items-end lg:gap-20'>
                  <div className='flex flex-col gap-5 lg:flex-row'>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size='sm' variant='primary' fullWidth className='order-2 w-[87px] lg:order-1 lg:h-10 lg:w-[73px]'>
                          옵션 변경
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='h-[580px] w-[500px]'>
                        <DialogHeader>
                          <DialogTitle className='text-2xl font-semibold'>옵션 변경</DialogTitle>
                        </DialogHeader>
                        <div className='flex items-start gap-4'>
                          <div className='relative h-[100px] w-[100px] shrink-0'>
                            <Image src={hoyaImg} alt='호야 하트' fill className='rounded object-cover' />
                          </div>
                          <div>
                            <h2 className='text-2xl font-bold'>호야 하트</h2>
                          </div>
                        </div>
                        <hr className='my-2' />
                        <p className='text-[20px] font-medium'>화분 색상</p>
                        <RadioGroup defaultValue='브라운' className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
                          {['브라운', '블루', '그레이', '화이트', '블랙'].map((color) => (
                            <div key={color} className='mr-4 flex h-[34px] w-[94px] items-center rounded-2xl border-1'>
                              <RadioGroupItem className='mx-1 h-[20px] w-[20px]' value={color} id={color} />
                              <label htmlFor={color} className='mx-2 text-base'>
                                {color}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                        <Button fullWidth variant='primary' className='mx-auto block h-11 font-bold lg:w-25'>
                          변경하기
                        </Button>
                      </DialogContent>
                    </Dialog>
                    <Button size='sm' variant='destructive' fullWidth className='order-1 w-[87px] lg:order-2 lg:h-10 lg:w-[73px]'>
                      <Trash2 className='mr-1 size-4' />
                      삭제
                    </Button>
                  </div>

                  {/* 수량 버튼 */}
                  <div className='flex items-center rounded-4xl border bg-white px-2 py-1'>
                    <Button variant='ghost' size='icon' className='h-6 w-6 text-lg' aria-label='수량 감소'>
                      -
                    </Button>
                    <span className='mx-2 text-sm'>1</span>
                    <Button variant='ghost' size='icon' className='h-6 w-6 text-lg' aria-label='수량 증가'>
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {idx !== 4 && <div className='my-8 hidden h-px w-full bg-gray-300 lg:block' />}
            </div>
          ))}
        </div>
        {/*주문 내역 */}
        <hr className='mt-12 mb-8 border-gray-300 lg:hidden' />
        <div className='bg-surface mt-6 h-119 w-full shrink-0 p-4 md:p-6 lg:mt-0 lg:w-1/3 lg:bg-white'>
          <h2 className='mb-12 text-2xl font-bold'>주문 내역</h2>
          <div className='mb-6 flex justify-between text-[16px]'>
            <span>상품 금액</span>
            <span>₩ 100,000</span>
          </div>
          <div className='mb-5 flex justify-between text-[16px] lg:mb-10'>
            <span>배송비</span>
            <span>무료</span>
          </div>
          <hr className='mb-5 border-gray-300 lg:mb-10' />
          <div className='mb-10 flex justify-between text-lg font-semibold'>
            <span>총 결제 금액</span>
            <span>₩ 100,000</span>
          </div>
          <Button fullWidth variant='primary' className='h-[50px] text-3xl'>
            주문하기
          </Button>
        </div>
      </div>
    </div>
  );
}
