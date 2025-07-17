"use client"

import hoyaImg from "@/assets/images/hoya_heart_brown.webp";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";

import { Trash2 } from "lucide-react";
import Image from "next/image";

export default function CartPage() {
  return (
    <div className="w-full bg-surface lg:px-6 py-8">
      {/* 헤더 영역 */}
      <div className="flex items-center lg:mb-24">
        <Button variant="ghost" size="icon" className="text-4xl mr-2 lg:hidden" aria-label="뒤로 가기">
          ←
        </Button>
        <h1 className="text-3xl md:text-4xl font-regular">
          <span>CART</span>
          <span className="hidden lg:block text-base mt-1">| SHOPPING CART</span>
        </h1>
      </div>
      



      <div className="lg:flex lg:gap-6 sm:mx-8 mx-2">
        {/* 왼쪽: 장바구니 아이템 목록 */}
        <div className="flex-1 ">
          <hr className="block lg:hidden my-4 border-gray-300" />
          {/* 선택 영역 */}
          <div className="flex justify-start items-center lg:text-2xl text-base border-b-2">
            <div className="flex items-center gap-2">
              <Checkbox id="select-all" />
              <label htmlFor="select-all" className="cursor-pointer ">모두 선택</label>
            </div>
            <Button variant="ghost" className="ml-auto lg:text-2xl">선택 삭제</Button>
            <hr className="mt-4 mb-7" />
          </div>
          {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx}>
          {/* 카드 */}
          <div className="bg-white lg:bg-surface py-7 mt-7 px-3 rounded-2xl md:border-gray-300-1 flex justify-between items-stretch">
            {/* 왼쪽: 체크박스 + 이미지 + 텍스트 */}
            <div className="flex items-start gap-3 h-full">
              <Checkbox id={`item-${idx}`} defaultChecked className="mt-[2px]" />
              <div className="relative w-24 h-35 sm:w-32 sm:h-32 lg:w-40 lg:h-40 shrink-0">
                <Image src={hoyaImg} alt="호야 하트" fill className="object-cover rounded" />
              </div>
              <div className="flex flex-col justify-between h-36 sm:h-32 lg:h-40 py-1">
                <div>
                  <h2 className="font-semibold text-lg sm:text-3xl lg:text-3xl mb-1">호야 하트</h2>
                  <p className="text-sm sm:text-base text-muted-foreground lg:text-base">화분 색상 : 브라운</p>
                </div>
                <p className="font-semibold text-sm sm:text-2xl lg:text-2xl">₩ 36,000</p>
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex flex-col items-end gap-5 lg:gap-20 lg:items-end h-full ">
              <div className="flex flex-col gap-5 lg:flex-row">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="primary" fullWidth className=" lg:w-[73px] lg:h-10 w-[87px] order-2 lg:order-1">
                      옵션 변경
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='w-[500px] h-[580px]'>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-semibold">옵션 변경</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-start gap-4">
                      <div className="relative w-[100px] h-[100px] shrink-0">
                        <Image src={hoyaImg} alt="호야 하트" fill className="object-cover rounded" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">호야 하트</h2>
                      </div>
                    </div>
                    <hr className="my-2" />
                    <p className="text-[20px] font-medium">화분 색상</p>
                    <RadioGroup defaultValue="브라운" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6 ">
                      {["브라운", "블루", "그레이", "화이트", "블랙"].map((color) => (
                        <div key={color} className="flex items-center mr-4 rounded-2xl border-1 w-[94px] h-[34px]">
                          <RadioGroupItem className="mx-1 w-[20px] h-[20px]" value={color} id={color} />
                          <label htmlFor={color} className="text-base mx-2">{color}</label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button fullWidth variant="primary" className="font-bold lg:w-25 h-11 mx-auto block">
                      변경하기
                    </Button>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="destructive" fullWidth className="w-[87px] lg:w-[73px] lg:h-10 order-1 lg:order-2">
                  <Trash2 className="size-4 mr-1" />
                  삭제
                </Button>
              </div>

              {/* 수량 버튼 */}
              <div className="flex items-center border rounded-4xl px-2 py-1 bg-white">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-lg" aria-label="수량 감소">
                  -
                </Button>
                <span className="mx-2 text-sm">1</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-lg" aria-label="수량 증가">
                  +
                </Button>
              </div>
            </div>
          </div>

          
          {idx !== 4 && (
            <div className="hidden lg:block w-full h-px bg-gray-300 my-8" />
          )}
        </div>
      ))}

        </div>
        {/*주문 내역 */}
        <hr className="mt-12 mb-8 border-gray-300 lg:hidden" />
        <div className="w-full lg:w-1/3 h-119 shrink-0 mt-6 lg:mt-0 p-4 md:p-6 bg-surface lg:bg-white ">
          <h2 className="font-bold mb-12 text-2xl">주문 내역</h2>
          <div className="flex justify-between text-[16px] mb-6">
            <span>상품 금액</span>
            <span>₩ 100,000</span>
          </div>
          <div className="flex justify-between text-[16px] lg:mb-10 mb-5">
            <span>배송비</span>
            <span>무료</span>
          </div>
          <hr className="lg:mb-10 border-gray-300 mb-5" />
          <div className="flex justify-between font-semibold text-lg mb-10">
            <span>총 결제 금액</span>
            <span>₩ 100,000</span>
          </div>
          <Button fullWidth variant='primary' className="text-3xl h-[50px]">
            주문하기
          </Button>
        </div>
      </div>
    </div>
  )
}
