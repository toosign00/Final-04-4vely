// src/app/(purchase)/order/_components/OrderClient.tsx
'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { createOrderAction, updateTempOrderAddressAction, updateTempOrderMemoAction } from '@/lib/actions/order/orderServerActions';
import { CreateOrderRequest, OrderPageData } from '@/types/order.types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface OrderClientSectionProps {
  initialOrderData: OrderPageData;
}

// 저장된 배송지 타입
interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  detailAddress?: string;
  zipCode?: string;
  isDefault?: boolean;
}

// Daum 우편번호 타입
declare global {
  interface Window {
    daum: any;
  }
}

export default function OrderClientSection({ initialOrderData }: OrderClientSectionProps) {
  const router = useRouter();
  const hasSetInitialAddress = useRef(false);

  // 상태 관리
  const [orderData, setOrderData] = useState<OrderPageData>(initialOrderData);
  const [showItems, setShowItems] = useState(false);
  const [activeTab, setActiveTab] = useState<'select' | 'new'>('select');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // 저장된 배송지 목록 (로컬스토리지 대신 상태로 관리)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: '1',
      name: '홍길동',
      phone: '010-1234-5678',
      address: '서울특별시 서대문구 성산로7길 89-8',
      detailAddress: '연희동',
      zipCode: '03706',
      isDefault: true,
    },
    {
      id: '2',
      name: '김철수',
      phone: '010-9876-5432',
      address: '서울특별시 강남구 테헤란로 427',
      detailAddress: '강남파이낸스센터 15층',
      zipCode: '06159',
      isDefault: false,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('1');

  // 배송 정보 폼 상태
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    detailAddress: '',
    zipCode: '',
  });

  const [deliveryMemo, setDeliveryMemo] = useState(orderData.memo || '');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string>('');

  const totalProductAmount = orderData.totalAmount;
  const shippingFee = orderData.shippingFee;
  const finalAmount = totalProductAmount + shippingFee;

  // 초기 주소 설정 - useRef로 한 번만 실행되도록 보장
  useEffect(() => {
    if (!hasSetInitialAddress.current && !orderData.address && savedAddresses.length > 0) {
      hasSetInitialAddress.current = true;

      const defaultAddress = savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];

      if (defaultAddress) {
        const addressData = {
          name: defaultAddress.name,
          phone: defaultAddress.phone,
          address: defaultAddress.address,
          detailAddress: defaultAddress.detailAddress || '',
          zipCode: defaultAddress.zipCode || '',
        };

        setOrderData((prev) => ({ ...prev, address: addressData }));

        updateTempOrderAddressAction(addressData).catch((error) => {
          console.error('[초기 주소 설정] 서버 업데이트 실패:', error);
        });
      }
    }
  }, [orderData.address, savedAddresses]);

  // Daum 우편번호 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 주소 찾기 핸들러
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      toast.error('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        // 도로명 주소 우선, 없으면 지번 주소 사용
        const fullAddress = data.roadAddress || data.jibunAddress;

        setAddressForm((prev) => ({
          ...prev,
          zipCode: data.zonecode,
          address: fullAddress,
        }));
      },
    }).open();
  };

  // 배송지 선택 핸들러
  const handleSelectAddress = async (addressId: string) => {
    const selected = savedAddresses.find((addr) => addr.id === addressId);
    if (selected) {
      setSelectedAddressId(addressId);
      const address = {
        name: selected.name,
        phone: selected.phone,
        address: selected.address,
        detailAddress: selected.detailAddress || '',
        zipCode: selected.zipCode || '',
      };

      const success = await updateTempOrderAddressAction(address);
      if (success) {
        setOrderData((prev) => ({ ...prev, address }));
        toast.success('배송지가 선택되었습니다.');
      } else {
        toast.error('배송지 선택에 실패했습니다.');
      }
    }
  };

  // 배송지 저장 (신규/수정)
  const handleSaveAddress = async () => {
    try {
      // 필수 필드 검증
      if (!addressForm.name || !addressForm.phone || !addressForm.address) {
        toast.error('필수 정보를 모두 입력해주세요.');
        return;
      }

      const address = {
        name: addressForm.name,
        phone: addressForm.phone,
        address: addressForm.address,
        detailAddress: addressForm.detailAddress,
        zipCode: addressForm.zipCode,
      };

      const success = await updateTempOrderAddressAction(address);

      if (success) {
        setOrderData((prev) => ({ ...prev, address }));

        // 신규 입력인 경우 저장된 주소 목록에 추가
        if (activeTab === 'new') {
          const newAddress: SavedAddress = {
            id: Date.now().toString(),
            ...address,
            isDefault: savedAddresses.length === 0,
          };
          setSavedAddresses((prev) => [...prev, newAddress]);
        }

        toast.success('배송지 정보가 저장되었습니다.');
        setDialogOpen(false);
      } else {
        toast.error('배송지 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('[배송지 저장] 오류:', error);
      toast.error('배송지 정보 저장 중 오류가 발생했습니다.');
    }
  };

  // 배송지 삭제
  const handleDeleteAddress = (addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAddress = () => {
    setSavedAddresses((prev) => prev.filter((addr) => addr.id !== addressToDelete));
    if (selectedAddressId === addressToDelete) {
      setSelectedAddressId('');
    }
    setDeleteConfirmOpen(false);
    toast.success('배송지가 삭제되었습니다.');
  };

  // 배송 메모 저장
  const handleSaveMemo = async (memo: string) => {
    try {
      setDeliveryMemo(memo);
      const success = await updateTempOrderMemoAction(memo);

      if (success) {
        setOrderData((prev) => ({ ...prev, memo }));
      }
    } catch (error) {
      console.error('[배송 메모 저장] 오류:', error);
    }
  };

  // 결제 처리 함수
  const handlePayment = async () => {
    try {
      setIsProcessingOrder(true);
      console.log('[결제 처리] 시작');

      // 배송지 정보 확인
      if (!orderData.address || !orderData.address.name || !orderData.address.phone || !orderData.address.address) {
        toast.error('배송지 정보를 입력해주세요');
        setIsProcessingOrder(false);
        return;
      }

      // 결제 방법 확인
      if (!selectedPaymentMethod) {
        toast.error('결제 방법을 선택해주세요');
        setIsProcessingOrder(false);
        return;
      }

      // 주문 생성 요청 데이터 준비 - API 형식에 맞게 변환
      const createOrderData: CreateOrderRequest = {
        products: orderData.items.map((item) => ({
          _id: item.productId,
          quantity: item.quantity,
          size: item.selectedColor?.colorName,
        })),
        address: {
          name: orderData.address.name,
          value: `${orderData.address.zipCode || ''} ${orderData.address.address} ${orderData.address.detailAddress || ''}`.trim(),
          phone: orderData.address.phone,
        },
        memo: orderData.memo,
      };

      console.log('[결제 처리] 주문 생성 요청:', createOrderData);

      // 주문 생성 API 호출
      const result = await createOrderAction(createOrderData);

      if (!result.success) {
        console.error('[결제 처리] 주문 생성 실패:', result.message);
        toast.error('주문 생성 실패', {
          description: result.message,
          duration: 4000,
        });
        return;
      }

      console.log('[결제 처리] 주문 생성 성공');

      // 주문 데이터 임시 저장 (결제 완료 페이지에서 사용)
      sessionStorage.setItem('lastOrderData', JSON.stringify(orderData));

      // 성공 알림
      toast.success('주문이 완료되었습니다!', {
        description: '주문 완료 페이지로 이동합니다.',
        duration: 2000,
      });

      // 주문 완료 페이지로 이동
      if (result.data?.redirectUrl) {
        setTimeout(() => {
          router.push(result.data?.redirectUrl || '/');
        }, 1000);
      }
    } catch (error) {
      console.error('[결제 처리] 예상치 못한 오류:', error);
      toast.error('결제 처리 중 오류가 발생했습니다', {
        description: '잠시 후 다시 시도해주세요.',
        duration: 4000,
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className='bg-surface min-h-screen w-full p-4 sm:p-6 lg:p-8'>
      {/* 전체 컨테이너 */}
      <div className='mx-auto max-w-6xl'>
        {/* 헤더 영역 */}
        <div className='mb-8'>
          <div className='text-secondary t-small font-medium'>| Payment</div>
          <h2 className='text-secondary t-h2 mt-2 font-light'>Purchase</h2>
        </div>

        {/* 컨텐츠 영역 */}
        <div className='space-y-6'>
          {/* 결제 상품 정보 */}
          <section className='rounded-2xl bg-white p-6 shadow-md'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>결제 상품 정보</h2>
              {orderData.items.length > 1 && (
                <Button className='font-bold' variant='primary' size='lg' onClick={() => setShowItems(!showItems)}>
                  {showItems ? '접기' : `전체 보기`}
                </Button>
              )}
            </div>

            <div className='space-y-4'>
              {/* 첫 번째 상품 */}
              {orderData.items.slice(0, 1).map((item) => (
                <div key={item.productId} className='flex items-stretch justify-between'>
                  <div className='flex h-full items-start gap-3 md:gap-4'>
                    <div className='relative h-28 w-20 shrink-0 sm:h-32 sm:w-24 md:h-36 md:w-28 lg:h-40 lg:w-40'>
                      <Image src={item.productImage} alt={item.productName} fill className='rounded object-cover' />
                    </div>
                    <div className='flex h-28 flex-col justify-between py-1 sm:h-32 md:h-36 lg:h-40'>
                      <div className='space-y-1'>
                        <h2 className='text-sm leading-tight font-semibold sm:text-lg md:text-lg xl:text-xl'>{item.productName}</h2>
                        {item.selectedColor && <p className='text-muted-foreground text-xs sm:text-sm md:text-sm lg:text-base'>화분 색상 : {item.selectedColor.colorName}</p>}
                      </div>
                      <div className='space-y-1'>
                        <p className='text-xs sm:text-sm'>수량: {item.quantity}개</p>
                        <p className='text-sm font-semibold sm:text-base md:text-lg xl:text-xl'>₩ {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 토글 시 나머지 상품들 노출 */}
              {showItems &&
                orderData.items.slice(1).map((item) => (
                  <div key={item.productId} className='mt-8 flex items-stretch justify-between'>
                    <div className='flex h-full items-start gap-3 md:gap-4'>
                      <div className='relative h-28 w-20 shrink-0 sm:h-32 sm:w-24 md:h-36 md:w-28 lg:h-40 lg:w-40'>
                        <Image src={item.productImage} alt={item.productName} fill className='rounded object-cover' />
                      </div>
                      <div className='flex h-28 flex-col justify-between py-1 sm:h-32 md:h-36 lg:h-40'>
                        <div className='space-y-1'>
                          <h2 className='text-sm leading-tight font-semibold sm:text-lg md:text-lg xl:text-xl'>{item.productName}</h2>
                          {item.selectedColor && <p className='text-muted-foreground text-xs sm:text-sm md:text-sm lg:text-base'>화분 색상 : {item.selectedColor.colorName}</p>}
                        </div>
                        <div className='space-y-1'>
                          <p className='text-xs sm:text-sm'>수량: {item.quantity}개</p>
                          <p className='text-sm font-semibold sm:text-base md:text-lg xl:text-xl'>₩ {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* 배송지 정보 */}
          <section className='mt-7 rounded-2xl bg-white p-6 shadow-md'>
            <div className='mb-7 flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>배송지 정보</h2>
              <Button
                className='font-bold'
                variant='primary'
                size='lg'
                onClick={() => {
                  setActiveTab('select'); // 다이얼로그 열 때 항상 선택 탭으로
                  setDialogOpen(true);
                }}
              >
                변경
              </Button>
            </div>
            <div className='text-sm'>
              {/* 현재 배송지 */}
              <div className='space-y-4'>
                {orderData.address ? (
                  <>
                    <div className='flex justify-between lg:justify-start lg:gap-4'>
                      <span className='w-24 shrink-0 lg:w-48'>받는 사람</span>
                      <span className='break-words'>{orderData.address.name}</span>
                    </div>
                    <div className='flex justify-between lg:justify-start lg:gap-4'>
                      <span className='w-24 shrink-0 lg:w-48'>연락처</span>
                      <span className='break-words'>{orderData.address.phone}</span>
                    </div>
                    <div className='flex items-start justify-between lg:justify-start lg:gap-4'>
                      <span className='w-24 shrink-0 lg:w-48'>주소</span>
                      <span className='break-words'>
                        {orderData.address.zipCode && `(${orderData.address.zipCode}) `}
                        {orderData.address.address}
                        {orderData.address.detailAddress && ` ${orderData.address.detailAddress}`}
                      </span>
                    </div>
                    {orderData.memo && (
                      <div className='flex items-start justify-between lg:justify-start lg:gap-4'>
                        <span className='w-24 shrink-0 lg:w-48'>배송 메모</span>
                        <span className='break-words text-gray-600'>{orderData.memo}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className='text-gray-500'>배송지를 입력해주세요.</p>
                )}
              </div>

              {/* 변경 버튼 클릭시 배송정보 모달창 */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='max-w-2xl'>
                  <div className='w-full overflow-auto bg-white'>
                    <DialogHeader>
                      <DialogTitle className='text-lg font-semibold'>배송지 설정</DialogTitle>
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
                      <div className='mt-10 h-[350px] overflow-y-auto'>
                        <div className='space-y-4'>
                          {savedAddresses.map((addr, index) => (
                            <div key={addr.id}>
                              <label className='flex items-start gap-3 py-4'>
                                <input type='radio' name='address' className='mt-1' checked={selectedAddressId === addr.id} onChange={() => handleSelectAddress(addr.id)} />
                                <div className='flex-1'>
                                  <p className='font-medium'>{addr.name}</p>
                                  <p className='text-sm'>{addr.phone}</p>
                                  <p className='text-sm'>
                                    {addr.zipCode && `(${addr.zipCode}) `}
                                    {addr.address}
                                    {addr.detailAddress && ` ${addr.detailAddress}`}
                                  </p>
                                </div>
                                <div className='flex flex-col gap-2'>
                                  <Button
                                    variant='default'
                                    size='sm'
                                    onClick={() => {
                                      setAddressForm({
                                        name: addr.name,
                                        phone: addr.phone,
                                        address: addr.address,
                                        detailAddress: addr.detailAddress || '',
                                        zipCode: addr.zipCode || '',
                                      });
                                      setActiveTab('new');
                                    }}
                                  >
                                    수정
                                  </Button>
                                  <Button variant='destructive' size='sm' onClick={() => handleDeleteAddress(addr.id)}>
                                    삭제
                                  </Button>
                                </div>
                              </label>
                              {index < savedAddresses.length - 1 && <hr className='border-gray-200' />}
                            </div>
                          ))}

                          {savedAddresses.length === 0 && <p className='py-4 text-center text-gray-500'>저장된 배송지가 없습니다.</p>}

                          {/* 배송 메모 select */}
                          {savedAddresses.length > 0 && (
                            <>
                              <hr className='my-4 border-gray-200' />
                              <div className='space-y-2 py-4'>
                                <Label htmlFor='deliveryNote' className='font-semibold'>
                                  배송 메모
                                </Label>
                                <Select value={deliveryMemo} onValueChange={handleSaveMemo}>
                                  <SelectTrigger id='deliveryNote' className='w-full'>
                                    <SelectValue placeholder='배송 메모를 선택해 주세요.' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>추천 메모</SelectLabel>
                                      <SelectItem value='부재 시 경비실에 맡겨주세요.'>부재 시 경비실에 맡겨주세요.</SelectItem>
                                      <SelectItem value='배송 전 연락 바랍니다.'>배송 전 연락 바랍니다.</SelectItem>
                                      <SelectItem value='문 앞에 보관해주세요.'>문 앞에 보관해주세요.</SelectItem>
                                      <SelectItem value='파손 위험이 있으니 조심히 다뤄주세요.'>파손 위험이 있으니 조심히 다뤄주세요.</SelectItem>
                                      <SelectItem value='부재시 택배함에 넣어주세요.'>부재시 택배함에 넣어주세요.</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className='mt-4 grid gap-4'>
                        <div>
                          <label className='block text-sm font-medium'>이름</label>
                          <input type='text' className='mt-1 w-full rounded border p-2' placeholder='받는 분 성함' value={addressForm.name} onChange={(e) => setAddressForm((prev) => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div>
                          <label className='block text-sm font-medium'>전화번호</label>
                          <input type='text' className='mt-1 w-full rounded border p-2' placeholder='010-1234-5678' value={addressForm.phone} onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))} />
                        </div>
                        <div>
                          <label className='block text-sm font-medium'>우편번호</label>
                          <input type='text' className='mt-1 w-full rounded border p-2' placeholder='주소를 찾아주세요' value={addressForm.zipCode} onChange={(e) => setAddressForm((prev) => ({ ...prev, zipCode: e.target.value }))} readOnly />
                        </div>
                        <div className='mt-4'>
                          <label className='block text-sm font-medium'>도로명 주소</label>
                          <div className='mt-1 flex gap-2'>
                            <input type='text' className='w-[150px] flex-1 rounded border p-2' placeholder='주소를 찾아주세요' value={addressForm.address} onChange={(e) => setAddressForm((prev) => ({ ...prev, address: e.target.value }))} readOnly />
                            <Button size='lg' variant='default' onClick={handleAddressSearch}>
                              주소 찾기
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className='block text-sm font-medium'>상세 주소</label>
                          <input
                            type='text'
                            className='mt-1 w-full rounded border p-2'
                            placeholder='상세 주소를 입력해주세요'
                            value={addressForm.detailAddress}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, detailAddress: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}

                    {/* 적용 버튼 */}
                    <div className='mt-6 flex justify-end'>
                      <Button
                        variant='primary'
                        onClick={() => {
                          if (activeTab === 'select') {
                            // 이미 선택된 주소가 있으면 다이얼로그 닫기
                            if (selectedAddressId) {
                              setDialogOpen(false);
                            }
                          } else {
                            // 신규 입력인 경우 기존 로직 실행
                            handleSaveAddress();
                          }
                        }}
                      >
                        적용하기
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          {/* 결제 방법 */}
          <section className='mt-7 rounded-2xl bg-white p-6 shadow-md'>
            <h2 className='mb-7 text-xl font-semibold'>결제 방법</h2>
            <div className='grid grid-cols-3 gap-7 text-sm lg:w-[700px]'>
              {['신용카드', '계좌이체', '무통장 입금', '휴대폰', '토스페이', '카카오페이'].map((method) => (
                <Button key={method} size='lg' variant={selectedPaymentMethod === method ? 'primary' : 'outline'} className='rounded-full px-4 py-2' onClick={() => setSelectedPaymentMethod(method)}>
                  {method}
                </Button>
              ))}
            </div>
          </section>

          {/* 총 결제 금액 */}
          <section className='mt-7 rounded-2xl bg-white p-6 text-sm shadow-md lg:flex lg:items-end lg:justify-between'>
            <div className='w-full lg:w-[500px]'>
              <h2 className='mb-7 text-xl font-semibold lg:text-2xl'>총 결제 금액</h2>
              <div className='space-y-4'>
                <div className='flex justify-between'>
                  <span className='text-secondary'>총 상품 금액</span>
                  <span className='font-semibold'>₩ {totalProductAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-secondary'>배송비</span>
                  <span className='font-semibold'>{shippingFee === 0 ? '무료' : `₩ ${shippingFee.toLocaleString()}`}</span>
                </div>
                <hr className='my-4' />
                <div className='flex justify-between text-lg'>
                  <span className='font-semibold'>합계</span>
                  <span className='text-secondary text-xl font-bold'>₩ {finalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* 결제버튼 */}
            <Button fullWidth variant='primary' size='lg' className='mt-6 rounded-lg px-6 py-3 font-bold lg:w-auto' onClick={handlePayment} disabled={isProcessingOrder || !orderData.address || !selectedPaymentMethod}>
              {isProcessingOrder ? '처리 중...' : '결제하기'}
            </Button>
          </section>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배송지 삭제</AlertDialogTitle>
            <AlertDialogDescription>선택한 배송지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAddress}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
