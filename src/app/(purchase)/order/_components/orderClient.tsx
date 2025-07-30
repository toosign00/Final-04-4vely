// src/app/(purchase)/order/_components/OrderClient.tsx
'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { createOrderAction, getUserAddressAction, updateTempOrderAddressAction, updateTempOrderMemoAction } from '@/lib/actions/order/orderServerActions';
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

// 폼 에러 타입
interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  detailAddress?: string;
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

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // 배송 정보 폼 상태
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    detailAddress: '',
    zipCode: '',
  });

  // 폼 에러 상태
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
    detailAddress: false,
  });

  const [deliveryMemo, setDeliveryMemo] = useState(orderData.memo || '');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string>('');

  const totalProductAmount = orderData.totalAmount;
  const shippingFee = orderData.shippingFee;
  const finalAmount = totalProductAmount + shippingFee;

  // 유효성 검사 함수들
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return '이름을 입력해주세요.';
    }
    if (name.trim().length < 2) {
      return '이름은 2자 이상 입력해주세요.';
    }
    if (name.trim().length > 20) {
      return '이름은 20자 이하로 입력해주세요.';
    }
    if (!/^[가-힣a-zA-Z\s]+$/.test(name)) {
      return '이름은 한글, 영문, 공백만 입력 가능합니다.';
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return '전화번호를 입력해주세요.';
    }
    // 숫자만 추출
    const phoneNumbers = phone.replace(/[^0-9]/g, '');

    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      return '올바른 전화번호를 입력해주세요.';
    }

    // 휴대폰 번호 패턴 체크 (010, 011, 016, 017, 018, 019)
    if (!phoneNumbers.startsWith('01')) {
      return '올바른 휴대폰 번호를 입력해주세요.';
    }

    return undefined;
  };

  const validateAddress = (address: string): string | undefined => {
    if (!address.trim()) {
      return '주소를 입력해주세요.';
    }
    return undefined;
  };

  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '');

    // 11자리 휴대폰 번호 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }

    // 11자리 초과시 11자리까지만 표시
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 실시간 유효성 검사
  const validateField = (field: keyof typeof addressForm, value: string) => {
    let error: string | undefined;

    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'address':
        error = validateAddress(value);
        break;
      default:
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    return !error;
  };

  // 입력 핸들러
  const handleInputChange = (field: keyof typeof addressForm, value: string) => {
    let formattedValue = value;

    // 전화번호 포맷팅
    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }

    setAddressForm((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));

    // touched 상태가 true인 경우에만 실시간 검증
    if (touched[field as keyof typeof touched]) {
      validateField(field, formattedValue);
    }
  };

  // blur 핸들러
  const handleInputBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    validateField(field, addressForm[field]);
  };

  // 전체 폼 유효성 검사
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    const nameError = validateName(addressForm.name);
    if (nameError) errors.name = nameError;

    const phoneError = validatePhone(addressForm.phone);
    if (phoneError) errors.phone = phoneError;

    const addressError = validateAddress(addressForm.address);
    if (addressError) errors.address = addressError;

    setFormErrors(errors);

    // 모든 필드를 touched로 설정
    setTouched({
      name: true,
      phone: true,
      address: true,
      detailAddress: true,
    });

    return Object.keys(errors).length === 0;
  };

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

  // 사용자 주소 가져오기
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        if (hasSetInitialAddress.current) return;

        console.log('[OrderClient] 사용자 주소 조회 시작');
        const result = await getUserAddressAction();
        console.log('[OrderClient] getUserAddressAction 결과:', result);

        const { address, name, phone, userId } = result;

        console.log('[OrderClient] 분해된 결과:', { address, name, phone, userId });

        if (address && userId) {
          // 주소에서 우편번호 분리
          let finalAddress = address;
          let zipCode = '';

          const addressMatch = address.match(/^(.+?)\s+(\d{3,5})$/);
          if (addressMatch) {
            finalAddress = addressMatch[1].trim();
            zipCode = addressMatch[2];
            console.log('[OrderClient] 주소 파싱:', { 원본: address, 주소: finalAddress, 우편번호: zipCode });
          }

          // 전화번호 포맷팅
          const formatPhone = (phone: string) => {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 10) {
              return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            } else if (cleaned.length === 11) {
              return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            }
            return phone;
          };

          const userAddress: SavedAddress = {
            id: '1',
            name: name || '사용자',
            phone: phone ? formatPhone(phone) : '010-0000-0000',
            address: finalAddress,
            detailAddress: '',
            zipCode: zipCode,
            isDefault: true,
          };

          console.log('[OrderClient] 배송지 설정:', userAddress);
          setSavedAddresses([userAddress]);
          setSelectedAddressId('1');
          hasSetInitialAddress.current = true;

          // 초기 주소를 orderData에도 설정
          const addressData = {
            name: userAddress.name,
            phone: userAddress.phone,
            address: userAddress.address,
            detailAddress: userAddress.detailAddress || '',
            zipCode: userAddress.zipCode || '',
          };

          const success = await updateTempOrderAddressAction(addressData);
          if (success) {
            setOrderData((prev) => ({ ...prev, address: addressData }));
          }
        } else {
          console.log('[OrderClient] 사용자 주소 없음');
        }
      } catch (error) {
        console.error('[OrderClient] 에러 발생:', error);
      }
    };

    fetchUserAddress();
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

        // 주소가 입력되면 에러 제거
        setFormErrors((prev) => ({
          ...prev,
          address: undefined,
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
      // 폼 유효성 검사
      if (!validateForm()) {
        toast.error('입력 정보를 확인해주세요.');
        return;
      }

      const address = {
        name: addressForm.name.trim(),
        phone: addressForm.phone,
        address: addressForm.address,
        detailAddress: addressForm.detailAddress.trim(),
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

        // 폼 초기화
        setAddressForm({
          name: '',
          phone: '',
          address: '',
          detailAddress: '',
          zipCode: '',
        });
        setFormErrors({});
        setTouched({
          name: false,
          phone: false,
          address: false,
          detailAddress: false,
        });
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

      // 디버깅 로그
      console.log('[결제 처리] createOrderAction 결과:', result);

      if (!result.success) {
        console.error('[결제 처리] 주문 생성 실패:', result.message);
        toast.error('주문 생성 실패', {
          description: result.message,
          duration: 4000,
        });
        return;
      }

      // 디버깅 로그
      console.log('[결제 처리] 주문 생성 성공:', result.data);

      // 주문 데이터 임시 저장
      sessionStorage.setItem('lastOrderData', JSON.stringify(orderData));

      // redirectUrl 확인 로그
      const redirectUrl = result.data?.redirectUrl;
      console.log('[결제 처리] redirectUrl:', redirectUrl);

      // fallback 처리 개선
      if (!redirectUrl) {
        console.error('[결제 처리] redirectUrl이 없습니다');
        // redirectUrl이 없어도 orderId가 있으면 수동으로 생성
        if (result.data?.orderId) {
          const manualRedirectUrl = `/order/order-complete?orderId=${result.data.orderId}`;
          console.log('[결제 처리] 수동 생성 redirectUrl:', manualRedirectUrl);

          toast.success('주문이 완료되었습니다!', {
            description: '주문 완료 페이지로 이동합니다.',
            duration: 2000,
          });

          await router.push(manualRedirectUrl);
          return;
        }
      }

      // 성공 알림
      toast.success('주문이 완료되었습니다!', {
        description: '주문 완료 페이지로 이동합니다.',
        duration: 2000,
      });

      // 페이지 이동
      if (redirectUrl) {
        console.log('[결제 처리] 페이지 이동:', redirectUrl);
        await router.push(redirectUrl);
      } else {
        console.error('[결제 처리] 페이지 이동 실패: redirectUrl 없음');
        await router.push('/shop');
      }
    } catch (error) {
      console.error('[결제 처리] 예상치 못한 오류:', error);
      toast.error('결제 처리 중 오류가 발생했습니다', {
        description: '잠시 후 다시 시도해주세요.',
        duration: 4000,
      });
    } finally {
      // finally 블록으로 이동
      setIsProcessingOrder(false);
    }
  };

  // 다이얼로그 닫기 핸들러
  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);

    // 다이얼로그가 닫힐 때 폼 초기화
    if (!open) {
      setAddressForm({
        name: '',
        phone: '',
        address: '',
        detailAddress: '',
        zipCode: '',
      });
      setFormErrors({});
      setTouched({
        name: false,
        phone: false,
        address: false,
        detailAddress: false,
      });
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
                        <span className='text-secondary break-words'>{orderData.memo}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className='text-gray-500'>배송지를 입력해주세요.</p>
                )}
              </div>

              {/* 변경 버튼 클릭시 배송정보 모달창 */}
              <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
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
                          <label className='block text-sm font-medium'>
                            이름 <span className='text-red-500'>*</span>
                          </label>
                          <input
                            type='text'
                            className={`mt-1 w-full rounded border p-2 ${formErrors.name && touched.name ? 'border-red-500' : ''}`}
                            placeholder='받는 분 성함'
                            value={addressForm.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            onBlur={() => handleInputBlur('name')}
                            maxLength={20}
                          />
                          {formErrors.name && touched.name && <p className='mt-1 text-xs text-red-500'>{formErrors.name}</p>}
                        </div>
                        <div>
                          <label className='block text-sm font-medium'>
                            전화번호 <span className='text-red-500'>*</span>
                          </label>
                          <input
                            type='tel'
                            className={`mt-1 w-full rounded border p-2 ${formErrors.phone && touched.phone ? 'border-red-500' : ''}`}
                            placeholder='010-1234-5678'
                            value={addressForm.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            onBlur={() => handleInputBlur('phone')}
                            maxLength={13}
                          />
                          {formErrors.phone && touched.phone && <p className='mt-1 text-xs text-red-500'>{formErrors.phone}</p>}
                        </div>
                        <div>
                          <label className='block text-sm font-medium'>
                            우편번호 <span className='text-red-500'>*</span>
                          </label>
                          <input type='text' className='mt-1 w-full rounded border bg-gray-50 p-2' placeholder='주소를 찾아주세요' value={addressForm.zipCode} readOnly />
                        </div>
                        <div className='mt-4'>
                          <label className='block text-sm font-medium'>
                            도로명 주소 <span className='text-red-500'>*</span>
                          </label>
                          <div className='mt-1 flex gap-2'>
                            <input type='text' className={`w-[150px] flex-1 rounded border bg-gray-50 p-2 ${formErrors.address && touched.address ? 'border-red-500' : ''}`} placeholder='주소를 찾아주세요' value={addressForm.address} readOnly />
                            <Button size='lg' variant='default' onClick={handleAddressSearch}>
                              주소 찾기
                            </Button>
                          </div>
                          {formErrors.address && touched.address && <p className='mt-1 text-xs text-red-500'>{formErrors.address}</p>}
                        </div>
                        <div>
                          <label className='block text-sm font-medium'>상세 주소</label>
                          <input type='text' className='mt-1 w-full rounded border p-2' placeholder='상세 주소를 입력해주세요' value={addressForm.detailAddress} onChange={(e) => handleInputChange('detailAddress', e.target.value)} maxLength={50} />
                        </div>
                        <div className='mt-2 text-xs text-gray-500'>
                          <span className='text-red-500'>*</span> 표시는 필수 입력 항목입니다.
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
