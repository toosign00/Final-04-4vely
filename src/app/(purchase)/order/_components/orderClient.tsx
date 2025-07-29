// src/app/(purchase)/order/_components/OrderClient.tsx
'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { createOrderAction, updateTempOrderAddressAction, updateTempOrderMemoAction } from '@/lib/actions/order/orderServerActions';
import { CreateOrderRequest, OrderPageData } from '@/types/order.types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('1');

  // 배송 정보 폼 상태
  const [addressForm, setAddressForm] = useState({
    name: orderData.address?.name || '',
    phone: orderData.address?.phone || '',
    address: orderData.address?.address || '',
    detailAddress: orderData.address?.detailAddress || '',
    zipCode: orderData.address?.zipCode || '',
  });

  const [deliveryMemo, setDeliveryMemo] = useState(orderData.memo || '');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string>('');

  const totalProductAmount = orderData.totalAmount;
  const shippingFee = orderData.shippingFee;
  const finalAmount = totalProductAmount + shippingFee;

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
        return;
      }

      // 결제 방법 확인
      if (!selectedPaymentMethod) {
        toast.error('결제 방법을 선택해주세요');
        return;
      }

      // 주문 생성 요청 데이터 준비
      const createOrderData: CreateOrderRequest = {
        products: orderData.items.map((item) => ({
          _id: item.productId,
          quantity: item.quantity,
          size: item.selectedColor?.colorName,
        })),
        address: orderData.address,
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
    <div className='bg-surface mx-auto w-full max-w-[1500px] gap-5 px-4 py-8 lg:px-6'>
      {/* 헤더 영역 */}
      <div className='flex items-center lg:mb-24'>
        <Button variant='ghost' size='icon' className='mr-2 text-4xl lg:hidden' aria-label='뒤로 가기' onClick={() => router.back()}>
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
          {orderData.items.length > 1 && (
            <Button variant='primary' size='sm' type='button' onClick={() => setShowItems(!showItems)} aria-label={showItems ? '상품 숨기기' : '추가 상품 보기'}>
              {showItems ? '접기' : '전체보기'}
            </Button>
          )}
        </div>
        <div className='space-y-6'>
          {/* 항상 첫 번째 상품만 보여줌 */}
          {orderData.items.slice(0, 1).map((item) => (
            <div key={item.productId} className='flex items-center gap-4 lg:gap-8'>
              <div className='relative h-30 w-40 shrink-0'>
                <Image src={item.productImage} alt={item.productName} fill className='rounded object-cover' />
              </div>
              <div>
                <p className='mb-8 text-xl font-semibold'>{item.productName}</p>
                {item.selectedColor && <p className='text-muted-foreground mb-1'>옵션: {item.selectedColor.colorName}</p>}
                <p>수량: {item.quantity}개</p>
              </div>
            </div>
          ))}
          {/* 토글 시 나머지 상품들 노출 */}
          {showItems &&
            orderData.items.slice(1).map((item) => (
              <div key={item.productId} className='flex items-center gap-8 opacity-80'>
                <div className='relative h-30 w-40 shrink-0'>
                  <Image src={item.productImage} alt={item.productName} fill className='rounded object-cover' />
                </div>
                <div>
                  <p className='mb-2 text-xl font-semibold'>{item.productName}</p>
                  {item.selectedColor && <p className='text-muted-foreground mb-1'>옵션: {item.selectedColor.colorName}</p>}
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
              </>
            ) : (
              <p className='text-gray-500'>배송지를 입력해주세요.</p>
            )}
          </div>

          {/* 변경 버튼 클릭시 배송정보 모달창 */}
          <div className='mt-4 text-right lg:mt-0'>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='primary' size='lg'>
                  변경
                </Button>
              </DialogTrigger>
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
                    <div className='mt-10 h-[350px] space-y-10 overflow-y-auto'>
                      {savedAddresses.map((addr) => (
                        <label key={addr.id} className='flex items-start gap-3'>
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
                              variant='primary'
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
                      ))}

                      {savedAddresses.length === 0 && <p className='text-center text-gray-500'>저장된 배송지가 없습니다.</p>}

                      {/* 배송 메모 select */}
                      <div className='mt-4 space-y-2'>
                        <Label htmlFor='deliveryNote'>배송 메모</Label>
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
                    </div>
                  ) : (
                    <div className='mt-4 grid gap-4'>
                      <div>
                        <label className='block text-sm font-medium'>이름</label>
                        <input type='text' className='mt-1 w-full rounded border p-2' placeholder='받는 분 이름' value={addressForm.name} onChange={(e) => setAddressForm((prev) => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>전화번호</label>
                        <input type='text' className='mt-1 w-full rounded border p-2' placeholder='010-1234-5678' value={addressForm.phone} onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))} />
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>우편번호</label>
                        <input type='text' className='mt-1 w-full rounded border p-2' placeholder='03706' value={addressForm.zipCode} onChange={(e) => setAddressForm((prev) => ({ ...prev, zipCode: e.target.value }))} readOnly />
                      </div>
                      <div className='mt-4'>
                        <label className='block text-sm font-medium'>도로명 주소</label>
                        <div className='mt-1 flex gap-2'>
                          <input
                            type='text'
                            className='flex-1 rounded border p-2'
                            placeholder='서울특별시 서대문구 성산로7길 89-8(연희동)'
                            value={addressForm.address}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, address: e.target.value }))}
                            readOnly
                          />
                          <Button size='lg' variant='default' onClick={handleAddressSearch}>
                            주소 찾기
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>상세 주소</label>
                        <input type='text' className='mt-1 w-full rounded border p-2' placeholder='1층 아임웹' value={addressForm.detailAddress} onChange={(e) => setAddressForm((prev) => ({ ...prev, detailAddress: e.target.value }))} />
                      </div>
                    </div>
                  )}

                  {/* 적용 버튼 */}
                  <div className='mt-6 flex justify-end'>
                    <Button variant='primary' onClick={handleSaveAddress}>
                      적용하기
                    </Button>
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
          {['신용카드', '계좌이체', '무통장 입금', '휴대폰', '토스페이', '카카오페이'].map((method) => (
            <Button key={method} size='lg' variant={selectedPaymentMethod === method ? 'primary' : 'outline'} className='rounded-full px-4 py-2' onClick={() => setSelectedPaymentMethod(method)}>
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
              <span>₩ {totalProductAmount.toLocaleString()}</span>
            </div>
            <div className='flex justify-between'>
              <span>배송비</span>
              <span>{shippingFee === 0 ? '₩ 0' : `₩ ${shippingFee.toLocaleString()}`}</span>
            </div>
            <hr className='border-gray-300' />
            <div className='mt-2 flex justify-between text-lg font-semibold'>
              <span>합계</span>
              <span>₩ {finalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        {/* 결제버튼 */}
        <Button fullWidth variant='primary' size='lg' className='mt-6 rounded-lg px-6 py-2 lg:w-auto' onClick={handlePayment} disabled={isProcessingOrder || !orderData.address || !selectedPaymentMethod}>
          {isProcessingOrder ? '처리 중...' : '결제하기'}
        </Button>
      </section>

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
