'use client';

import hoyaImg from '@/assets/images/hoya_heart_brown.webp';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/Select';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function OrderPage() {
  const [showItems, setShowItems] = useState(false);
  const [activeTab, setActiveTab] = useState<'select' | 'new'>('select');
  const products = [
    {
      id: 1,
      name: '호야 하트',
      option: '회색 화분',
      quantity: 3,
      image: hoyaImg,
    },
    {
      id: 2,
      name: '호야 하트',
      option: '회색 화분',
      quantity: 3,
      image: hoyaImg,
    },
    {
      id: 3,
      name: '호야 하트',
      option: '회색 화분',
      quantity: 3,
      image: hoyaImg,
    },
    {
      id: 4,
      name: '호야 하트',
      option: '회색 화분',
      quantity: 3,
      image: hoyaImg,
    },
  ];
  return (
    <div className='bg-surface mx-auto w-full max-w-[1500px] gap-5 px-4 py-8 lg:px-6'>
      {/* 헤더 영역 */}
      <div className='flex items-center lg:mb-24'>
        <Button variant='ghost' size='icon' className='mr-2 text-4xl lg:hidden' aria-label='뒤로 가기'>
          ←
        </Button>
        <h1 className='font-regular text-3xl md:text-4xl'>
          <span>Purchase</span>
          <span className='hidden text-base lg:block'>| PAYMENT</span>
        </h1>
      </div>
      <hr className='mt-3 mb-10 border bg-gray-300 lg:hidden' />

      {/* 결제 상품 정보 */}
      <section className='rounded-xl border bg-white p-6'>
        <div className='mb-7 flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>결제 상품 정보</h2>
          <Button variant='primary' size='sm' type='button' onClick={() => setShowItems(!showItems)} aria-label={showItems ? '상품 숨기기' : '추가 상품 보기'}>
            {showItems ? '접기' : '전체보기'}
          </Button>
        </div>
        <div className='space-y-6'>
          {/* 항상 첫 번째 상품만 보여줌 */}
          {products.slice(0, 1).map((item) => (
            <div key={item.id} className='flex items-center gap-4 lg:gap-8'>
              <div className='relative h-30 w-40 shrink-0'>
                <Image src={item.image} alt={item.name} fill className='rounded object-cover' />
              </div>
              <div>
                <p className='mb-8 text-xl font-semibold'>{item.name}</p>
                <p className='text-muted-foreground mb-1'>옵션: {item.option}</p>
                <p>수량: {item.quantity}개</p>
              </div>
            </div>
          ))}
          {/* 토글 시 나머지 상품들 노출 */}
          {showItems &&
            products.slice(1).map((item) => (
              <div key={item.id} className='flex items-center gap-8 opacity-80'>
                <div className='relative h-30 w-40 shrink-0'>
                  <Image src={item.image} alt={item.name} fill className='rounded object-cover' />
                </div>
                <div>
                  <p className='mb-2 text-xl font-semibold'>{item.name}</p>
                  <p className='text-muted-foreground mb-1'>옵션: {item.option}</p>
                  <p>수량: {item.quantity}개</p>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 배송지 정보 */}
      <section className='mt-7 rounded-xl border bg-white p-6'>
        <h2 className='mb-7 text-xl font-semibold'>배송지 정보</h2>
        <div className='text-sm lg:flex lg:items-end lg:justify-between'>
          {/* 현재 배송지 */}
          <div className='space-y-4'>
            <div className='flex justify-between lg:justify-start lg:gap-4'>
              <span className='w-24 shrink-0 lg:w-48'>받는 사람</span>
              <span className='break-words'>홍길동</span>
            </div>
            <div className='flex justify-between lg:justify-start lg:gap-4'>
              <span className='w-24 shrink-0 lg:w-48'>연락처</span>
              <span className='break-words'>010-1234-5678</span>
            </div>
            <div className='flex items-start justify-between lg:justify-start lg:gap-4'>
              <span className='w-24 shrink-0 lg:w-48'>주소</span>
              <span className='break-words'>(02717) 서울특별시 중구 청계천로 100 시그니처 타워</span>
            </div>
          </div>

          {/* 변경 버튼 클릭시 배송정보 모달창 */}
          <div className='mt-4 text-right lg:mt-0'>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='primary' size='lg'>
                  변경
                </Button>
              </DialogTrigger>
              <DialogContent className='flex items-center justify-center p-4'>
                <div className='w-full max-w-lg overflow-auto bg-white p-6'>
                  <DialogHeader className='flex justify-center'>
                    <DialogTitle className='w-full text-center text-lg font-semibold'>배송지 설정</DialogTitle>
                  </DialogHeader>

                  {/* 탭 네비게이션 */}
                  <div className='mt-4 flex w-full'>
                    <Button variant='ghost' onClick={() => setActiveTab('select')} className={`flex-1 py-3 transition-colors ${activeTab === 'select' ? 'bg-[#c1d72f] text-black' : 'bg-white'}`}>
                      배송지 선택
                    </Button>
                    <Button variant='ghost' onClick={() => setActiveTab('new')} className={`flex-1 py-3 transition-colors ${activeTab === 'new' ? 'bg-[#c1d72f] text-black' : 'bg-white'}`}>
                      신규 입력
                    </Button>
                  </div>

                  {/* 탭 컨텐츠 */}
                  {activeTab === 'select' ? (
                    <div className='mt-10 h-[350px] space-y-10'>
                      <label className='flex items-start gap-3'>
                        <input type='radio' name='address' className='mt-1' defaultChecked />
                        <div className='flex-1'>
                          <p className='font-medium'>홍길동</p>
                          <p className='text-sm'>010-1234-5678</p>
                          <p className='text-sm'>(03706) 서울특별시 서대문구 성산로7길 89-8 (연희동)</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                          <Button variant='primary' size='sm'>
                            수정
                          </Button>
                          <Button variant='destructive' size='sm'>
                            삭제
                          </Button>
                        </div>
                      </label>
                      <label className='flex items-start gap-3'>
                        <input type='radio' name='address' className='mt-1' />
                        <div className='flex-1'>
                          <p className='font-medium'>홍길동</p>
                          <p className='text-sm'>010-1234-5678</p>
                          <p className='text-sm'>(03706) 서울특별시 서대문구 성산로7길 89-8 (연희동)</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                          <Button variant='primary' size='sm'>
                            수정
                          </Button>
                          <Button variant='destructive' size='sm'>
                            삭제
                          </Button>
                        </div>
                      </label>
                      {/*여기가 주소 추가 */}
                      {/*배송 메모 select*/}
                      <div className='mt-4 space-y-2'>
                        <Label htmlFor='deliveryNote'>배송 메모</Label>
                        <Select>
                          <SelectTrigger id='deliveryNote' className='w-full'>
                            <SelectValue placeholder='배송 메모를 선택해 주세요.' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>추천 메모</SelectLabel>
                              <SelectItem value='memo1'>부재 시 경비실에 맡겨주세요.</SelectItem>
                              <SelectItem value='memo2'>배송 전 연락 바랍니다.</SelectItem>
                              <SelectItem value='memo3'>문 앞에 보관해주세요.</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className='mt-4 grid gap-4'>
                      <div>
                        <label className='block text-sm font-medium'>이름</label>
                        <input type='text' className='mt-1 w-full rounded border p-2' placeholder='받는 분 이름' />
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>전화번호</label>
                        <input type='text' className='mt-1 w-full rounded border p-2' placeholder='010-1234-5678' />
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>우편번호</label>
                        <input type='text' className='mt-1 w-full rounded border p-2' placeholder='03706' />
                      </div>
                      <div className='mt-4'>
                        <label className='block text-sm font-medium'>도로명 주소</label>
                        <div className='mt-1 flex gap-2'>
                          <input type='text' className='flex-1 rounded border p-2' placeholder='서울특별시 서대문구 성산로7길 89-8(연희동)' />
                          <Button
                            size='lg'
                            variant='default'
                            onClick={() => {
                              // 여기에 리엑트다움 api사용
                            }}
                          >
                            주소 찾기
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>상세 주소</label>
                        <input type='text' className='mt-1 w-full rounded border p-2' placeholder='1층 아임웹' />
                      </div>
                    </div>
                  )}

                  {/* 적용 버튼 */}
                  <div className='mt-6 flex justify-end'>
                    <Button variant='primary'>적용하기</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* 결제 방법 */}
      <section className='mt-7 rounded-xl border bg-white p-6'>
        <h2 className='mb-7 text-xl font-semibold'>결제 방법</h2>
        <div className='grid grid-cols-3 gap-7 text-sm lg:w-[700px]'>
          {['신용카드', '계좌이체', '무통장 입금', '휴대폰', '토스페이', '카카오페이'].map((method, idx) => (
            <Button key={idx} size='lg' className='rounded-full border-black px-4 py-2'>
              {method}
            </Button>
          ))}
        </div>
      </section>

      {/* 총 결제 금액 */}
      <section className='mt-7 rounded-xl border bg-white p-6 text-sm lg:flex lg:items-end lg:justify-between'>
        <div className='w-full lg:w-[500px]'>
          <h2 className='mb-7 text-xl font-semibold'>총 결제 금액</h2>
          <div className='space-y-4'>
            <div className='flex justify-between'>
              <span>총 상품 금액</span>
              <span>₩ 36,000</span>
            </div>
            <div className='flex justify-between'>
              <span>배송비</span>
              <span>₩ 0</span>
            </div>
            <hr className='border-gray-300' />
            <div className='mt-2 flex justify-between text-lg font-semibold'>
              <span>합계</span>
              <span>₩ 36,000</span>
            </div>
          </div>
        </div>
        {/* 결제버튼 */}
        <Link href='/order/order-complete'>
          <Button fullWidth variant='primary' size='lg' className='mt-6 rounded-lg px-6 py-2 lg:w-auto'>
            결제하기
          </Button>
        </Link>
      </section>
    </div>
  );
}
