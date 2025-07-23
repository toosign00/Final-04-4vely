'use client';

import hoyaImg from '@/assets/images/hoya_heart_brown.webp';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  return (
    <div className='bg-surface mx-auto w-full max-w-[1500px] p-4 md:p-6 lg:p-8'>
      {/* 헤더 영역 */}
      <div className='mt-2 mb-6 flex items-center md:mb-8 lg:mt-0 lg:mb-24'>
        <h1 className='font-regular flex flex-col items-start gap-1 text-3xl md:text-4xl'>
          <span className='text-base'>|Shopping Cart</span>
          <span>CART</span>
        </h1>
      </div>

      <div className='mx-1 sm:mx-8 lg:flex lg:gap-6'>
        {/* 왼쪽: 장바구니 아이템 목록 */}
        <div className='flex-1'>
          {/* 선택 영역 */}
          <div className='flex items-center justify-start border-b-2 pb-3 text-base lg:text-2xl'>
            <div className='flex items-center gap-2'>
              <Checkbox id='select-all' className='bg-white' />
              <label htmlFor='select-all' className='cursor-pointer'>
                모두 선택
              </label>
            </div>
            <Button variant='ghost' className='ml-auto lg:text-2xl'>
              선택 삭제
            </Button>
          </div>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx}>
              {/* 카드 */}
              <div className='lg:bg-surface md:border-gray-300-1 mt-5 flex items-stretch justify-between rounded-2xl bg-white px-4 py-5 md:mt-6 md:px-5 md:py-6 lg:mt-7 lg:px-3 lg:py-7'>
                {/* 왼쪽: 이미지 + 텍스트 */}
                <div className='flex h-full items-start gap-3 md:gap-4'>
                  <div className='relative'>
                    <div className='relative h-28 w-20 shrink-0 sm:h-32 sm:w-24 md:h-36 md:w-28 lg:h-40 lg:w-40'>
                      <Image src={hoyaImg} alt='호야 하트' fill className='rounded object-cover' />
                    </div>
                    <Checkbox id={`item-${idx}`} className='absolute -top-2 -left-2 bg-white' />
                  </div>
                  <div className='flex h-28 flex-col justify-between py-1 sm:h-32 md:h-36 lg:h-40'>
                    <div className='space-y-1'>
                      <h2 className='text-base leading-tight font-semibold sm:text-lg md:text-xl lg:text-3xl'>호야 하트</h2>
                      <p className='text-muted-foreground text-xs sm:text-sm md:text-sm lg:text-base'>화분 색상 : 브라운</p>
                    </div>
                    <p className='text-sm font-semibold sm:text-base md:text-lg lg:text-2xl'>₩ 36,000</p>
                  </div>
                </div>

                {/* 버튼들 */}
                <div className='flex h-full flex-col items-end justify-between lg:gap-20'>
                  <div className='flex flex-col gap-2 md:gap-3 lg:flex-row lg:gap-5'>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size='sm' variant='primary' className='-8 order-2 w-20 text-xs md:h-9 md:w-24 md:text-sm lg:order-1 lg:h-10 lg:w-28 lg:text-base'>
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
                        <hr className='my-2 border-gray-300' />
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
                    <Button size='sm' variant='destructive' fullWidth className='order-1 flex h-8 w-20 items-center justify-center text-xs md:h-9 md:w-24 md:text-sm lg:order-2 lg:h-10 lg:w-28 lg:text-base'>
                      <Trash2 className='mr-1' />
                      삭제
                    </Button>
                  </div>

                  {/* 수량 버튼 */}
                  <div className='mt-2 flex h-10 w-20 items-center rounded-4xl border bg-white sm:mt-3 md:mt-4 md:h-10 md:w-24 lg:h-12 lg:w-28'>
                    <Button variant='ghost' size='icon' className='h-6 w-6 text-base md:h-6 md:w-8 md:text-base lg:h-7 lg:w-10 lg:text-lg' aria-label='수량 감소'>
                      -
                    </Button>

                    <span className='mx-2 text-center text-sm md:text-sm lg:text-base'>1</span>

                    <Button variant='ghost' size='icon' className='h-6 w-6 text-base md:h-6 md:w-8 md:text-base lg:h-7 lg:w-10 lg:text-lg' aria-label='수량 증가'>
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {idx !== 4 && <div className='my-6 hidden h-px w-full bg-gray-300 md:my-7 lg:my-8 lg:block' />}
            </div>
          ))}
        </div>

        {/*주문 내역 */}
        <hr className='mt-8 mb-6 border-gray-300 md:mt-10 md:mb-8 lg:hidden' />
        <div className='bg-surface h-auto w-full shrink-0 p-4 md:p-6 lg:mt-0 lg:h-119 lg:w-1/3 lg:bg-white'>
          <h2 className='mb-8 text-xl font-bold md:mb-10 md:text-2xl lg:mb-12'>주문 내역</h2>
          <div className='mb-4 flex justify-between text-sm md:mb-5 md:text-base lg:mb-6 lg:text-[16px]'>
            <span>상품 금액</span>
            <span>₩ 100,000</span>
          </div>
          <div className='mb-4 flex justify-between text-sm md:mb-5 md:text-base lg:mb-10 lg:text-[16px]'>
            <span>배송비</span>
            <span>무료</span>
          </div>
          <hr className='mb-4 border-gray-300 md:mb-5 lg:mb-10' />
          <div className='mb-6 flex justify-between text-base font-semibold md:mb-8 md:text-lg lg:mb-10'>
            <span>총 결제 금액</span>
            <span>₩ 100,000</span>
          </div>
          <Link href='/order'>
            <Button fullWidth variant='primary' className='h-[45px] text-lg md:h-[48px] md:text-xl lg:h-[50px] lg:text-3xl'>
              주문하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
