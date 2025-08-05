// src/app/(purchase)/order/_components/OrderClient.tsx
'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { createOrderAction, getUserAddressAction, updateTempOrderAddressAction, updateTempOrderMemoAction } from '@/lib/actions/order/orderServerActions';
import { verifyPaymentAndCompleteOrderAction } from '@/lib/actions/order/paymentServerActions';
import { CreateOrderRequest, OrderPageData } from '@/types/order.types';
import PortOne from '@portone/browser-sdk/v2';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import DaumPostcode from 'react-daum-postcode';
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

// react-daum-postcode의 onComplete 타입 정의
interface PostcodeData {
  zonecode: string;
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  roadAddress: string;
  jibunAddress: string;
  sido: string;
  sigungu: string;
  sigunguCode: string;
  roadnameCode: string;
  bcode: string;
  roadname: string;
  bname1: string;
  bname2: string;
  hname: string;
  query: string;
  userSelectedType: string;
  noSelected: string;
  userLanguageType: string;
  apartment: string;
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

  // 주소 검색 표시 상태 (모달 내부에서 사용)
  const [showPostcode, setShowPostcode] = useState(false);

  // 상태 관리
  const [orderData, setOrderData] = useState<OrderPageData>(initialOrderData);
  const [showItems, setShowItems] = useState(false);
  const [activeTab, setActiveTab] = useState<'select' | 'new'>('select');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

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

  // 접근성을 위한 refs
  const orderAnnouncementRef = useRef<HTMLDivElement>(null);
  const paymentStepRef = useRef<HTMLDivElement>(null);

  const totalProductAmount = orderData.totalAmount;
  const shippingFee = 3000; // 배송비 3000원 고정
  const finalAmount = totalProductAmount + shippingFee;

  // 유효성 검사 함수들
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return '이름을 입력해주세요.';
    if (name.trim().length < 2) return '이름은 2자 이상 입력해주세요.';
    if (name.trim().length > 20) return '이름은 20자 이하로 입력해주세요.';
    if (!/^[가-힣a-zA-Z\s]+$/.test(name)) return '이름은 한글, 영문, 공백만 입력 가능합니다.';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return '전화번호를 입력해주세요.';
    const phoneNumbers = phone.replace(/[^0-9]/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) return '올바른 전화번호를 입력해주세요.';
    if (!phoneNumbers.startsWith('01')) return '올바른 휴대폰 번호를 입력해주세요.';
    return undefined;
  };

  const validateAddress = (address: string): string | undefined => {
    if (!address.trim()) return '주소를 입력해주세요.';
    return undefined;
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    else if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    else if (numbers.length <= 11) return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
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
    setFormErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  // 입력 핸들러
  const handleInputChange = (field: keyof typeof addressForm, value: string) => {
    let formattedValue = value;
    if (field === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }
    setAddressForm((prev) => ({ ...prev, [field]: formattedValue }));
    if (touched[field as keyof typeof touched]) {
      validateField(field, formattedValue);
    }
  };

  // blur 핸들러
  const handleInputBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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
    setTouched({ name: true, phone: true, address: true, detailAddress: true });
    return Object.keys(errors).length === 0;
  };

  // 초기 주소 설정
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

  // 사용자 주소 가져오기
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        if (hasSetInitialAddress.current) return;
        const result = await getUserAddressAction();
        const { address, name, phone, userId } = result;

        if (address && userId) {
          let finalAddress = address;
          let zipCode = '';
          const addressMatch = address.match(/^(.+?)\s+(\d{3,5})$/);
          if (addressMatch) {
            finalAddress = addressMatch[1].trim();
            zipCode = addressMatch[2];
          }

          const formatPhone = (phone: string) => {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 10) return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            else if (cleaned.length === 11) return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
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

          setSavedAddresses([userAddress]);
          setSelectedAddressId('1');
          hasSetInitialAddress.current = true;

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
        }
      } catch (error) {
        console.error('[OrderClient] 에러 발생:', error);
      }
    };
    fetchUserAddress();
  }, []);

  // 주소 완료 핸들러
  const handlePostcodeComplete = (data: PostcodeData) => {
    const fullAddress = data.roadAddress || data.jibunAddress || data.address;
    setAddressForm((prev) => ({
      ...prev,
      zipCode: data.zonecode,
      address: fullAddress,
    }));
    setFormErrors((prev) => ({ ...prev, address: undefined }));
    setShowPostcode(false);

    // 접근성: 주소 선택 알림
    if (orderAnnouncementRef.current) {
      orderAnnouncementRef.current.textContent = `주소가 선택되었습니다: ${fullAddress}`;
    }
  };

  // 주소 찾기 핸들러
  const handleAddressSearch = () => {
    setShowPostcode(true);
  };

  // 나머지 핸들러들
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

        // 배송지 선택 알림
        if (orderAnnouncementRef.current) {
          orderAnnouncementRef.current.textContent = `배송지가 선택되었습니다: ${selected.name}`;
        }

        toast.success('배송지가 선택되었습니다.');
      } else {
        toast.error('배송지 선택에 실패했습니다.');
      }
    }
  };

  const handleSaveAddress = async () => {
    try {
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
        if (activeTab === 'new') {
          const newAddress: SavedAddress = {
            id: Date.now().toString(),
            ...address,
            isDefault: savedAddresses.length === 0,
          };
          setSavedAddresses((prev) => [...prev, newAddress]);
        }

        // 배송지 저장 알림
        if (orderAnnouncementRef.current) {
          orderAnnouncementRef.current.textContent = `배송지 정보가 저장되었습니다: ${address.name}`;
        }

        toast.success('배송지 정보가 저장되었습니다.');
        setDialogOpen(false);
        setAddressForm({ name: '', phone: '', address: '', detailAddress: '', zipCode: '' });
        setFormErrors({});
        setTouched({ name: false, phone: false, address: false, detailAddress: false });
        setShowPostcode(false); // 주소 검색 숨기기
      } else {
        toast.error('배송지 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('[배송지 저장] 오류:', error);
      toast.error('배송지 정보 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteAddress = () => {
    const addressToRemove = savedAddresses.find((addr) => addr.id === addressToDelete);
    setSavedAddresses((prev) => prev.filter((addr) => addr.id !== addressToDelete));
    if (selectedAddressId === addressToDelete) {
      setSelectedAddressId('');
    }

    // 배송지 삭제 알림
    if (orderAnnouncementRef.current && addressToRemove) {
      orderAnnouncementRef.current.textContent = `${addressToRemove.name}의 배송지가 삭제되었습니다.`;
    }

    setDeleteConfirmOpen(false);
    toast.success('배송지가 삭제되었습니다.');
  };

  const handleSaveMemo = async (memo: string) => {
    try {
      setDeliveryMemo(memo);
      const success = await updateTempOrderMemoAction(memo);
      if (success) {
        setOrderData((prev) => ({ ...prev, memo }));

        // 배송 메모 설정 알림
        if (orderAnnouncementRef.current) {
          orderAnnouncementRef.current.textContent = `배송 메모가 설정되었습니다: ${memo}`;
        }
      }
    } catch (error) {
      console.error('[배송 메모 저장] 오류:', error);
    }
  };

  // 키보드 네비게이션을 위한 핸들러
  const handleTabKeyDown = (event: React.KeyboardEvent, tabName: 'select' | 'new') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveTab(tabName);
      setShowPostcode(false);
    }
  };

  // handlePayment 함수
  const handlePayment = async () => {
    try {
      setIsProcessingOrder(true);

      // 결제 처리 시작 알림
      if (paymentStepRef.current) {
        paymentStepRef.current.textContent = '결제 처리를 시작합니다.';
      }

      console.log('[결제 처리] 시작');

      // 결제 진행 상태 쿠키 설정 (OrderPage 리다이렉트 방지)
      document.cookie = 'payment-in-progress=true; path=/; max-age=3600'; // 1시간

      // 배송지 정보 확인
      if (!orderData.address || !orderData.address.name || !orderData.address.phone || !orderData.address.address) {
        toast.error('배송지 정보를 입력해주세요');
        return;
      }

      // 주문 생성 요청 데이터 준비
      const createOrderData: CreateOrderRequest = {
        products: orderData.items.map((item) => ({
          _id: item.productId,
          quantity: item.quantity,
          color: item.selectedColor?.colorName, // color 필드 사용
        })),
        address: {
          name: orderData.address.name,
          value: `${orderData.address.zipCode || ''} ${orderData.address.address} ${orderData.address.detailAddress || ''}`.trim(),
          phone: orderData.address.phone,
        },
        memo: {
          selectedMemo: orderData.memo || '', // 배송 메모
          selectedImage: orderData.items
            .map((item) => {
              // 각 상품의 이미지 경로 추출
              if (!item.productImage) return '';

              return item.productImage;
            })
            .filter((img) => img !== ''), // 빈 문자열 제거
        },
      };

      console.log('[결제 처리] 주문 생성 요청:', createOrderData);

      // 주문 생성 API 호출
      const result = await createOrderAction(createOrderData);

      console.log('[결제 처리] createOrderAction 결과:', result);

      if (!result.success) {
        console.error('[결제 처리] 주문 생성 실패:', result.message);
        toast.error('주문 생성 실패', {
          description: result.message,
          duration: 4000,
        });
        return; // 페이지 이동 없이 현재 페이지 유지
      }

      console.log('[결제 처리] 주문 생성 성공:', result.data);

      // 주문 데이터 임시 저장
      sessionStorage.setItem('lastOrderData', JSON.stringify(orderData));

      // orderId 확인
      const orderId = result.data?.orderId;
      if (!orderId) {
        console.error('[결제 처리] orderId가 없습니다');
        toast.error('주문 ID를 가져올 수 없습니다');
        return; // 페이지 이동 없이 현재 페이지 유지
      }

      console.log('[결제 처리] orderId 확인:', orderId);

      console.log('[결제 처리] PortOne 결제 시작');

      // 결제창 호출 알림
      if (paymentStepRef.current) {
        paymentStepRef.current.textContent = '결제창을 호출합니다.';
      }

      // 환경변수 확인
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

      if (!storeId || !channelKey) {
        console.error('[결제 처리] PortOne 환경변수 없음:', { storeId, channelKey });
        toast.error('결제 설정 오류', {
          description: '환경변수를 확인해주세요. (.env.local 파일)',
          duration: 6000,
        });
        return; // 페이지 이동 없이 현재 페이지 유지
      }

      // 결제 ID 생성
      const paymentId = `payment-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      // 주문명 생성
      const orderName = orderData.items.length === 1 ? orderData.items[0].productName : `${orderData.items[0].productName} 외 ${orderData.items.length - 1}건`;

      // 총 결제 금액 (finalAmount 변수 사용)
      const totalAmount = finalAmount;

      console.log('[결제 처리] PortOne 결제 정보:', {
        paymentId,
        orderName,
        totalAmount,
        orderId,
        storeId,
        channelKey,
      });

      // PortOne 결제창 호출
      const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);

      const paymentOptions = {
        storeId: storeId,
        channelKey: channelKey,
        paymentId: paymentId,
        orderName: orderName,
        totalAmount: totalAmount,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD',
        customer: {
          fullName: orderData.address.name,
          phoneNumber: orderData.address.phone,
        },
        customData: {
          orderId: orderId,
        },
        // 모바일 최적화 옵션 추가
        ...(isMobile && {
          appScheme: window.location.origin, // 모바일 앱 복귀용
          bypass: {
            // 모바일에서 특정 결제 수단 우선
            isMobile: true,
          },
        }),
      };

      console.log('[결제 요청] 옵션:', paymentOptions);
      console.log('[모바일 디버깅]', {
        isMobile,
        userAgent: navigator.userAgent,
        storeId: storeId ? '존재함' : '없음',
        channelKey: channelKey ? '존재함' : '없음',
      });

      const response = await PortOne.requestPayment({
        storeId: storeId,
        channelKey: channelKey,
        paymentId: paymentId,
        orderName: orderName,
        totalAmount: totalAmount,
        currency: 'CURRENCY_KRW' as const,
        payMethod: 'CARD',
        customer: {
          fullName: orderData.address.name,
          phoneNumber: orderData.address.phone,
        },
        customData: {
          orderId: orderId,
        },
        // 모바일에서 필수: 결제 완료 후 바로 결제 완료 페이지로
        redirectUrl: `${window.location.origin}/order/order-complete?orderId=${orderId}&paymentId=${paymentId}`,
      });

      console.log('[결제 처리] PortOne 응답:', response);

      // 결제 실패/취소 처리 - 즉시 쿠키 삭제
      if (response?.code) {
        console.error('[결제 처리] PortOne 결제 실패/취소:', response);

        document.cookie = 'payment-in-progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // 결제 취소/실패 알림
        if (paymentStepRef.current) {
          const isCancel = response.code === 'FAILURE_TYPE_CANCEL' || response.message?.includes('취소');
          paymentStepRef.current.textContent = isCancel ? '결제가 취소되었습니다.' : '결제에 실패했습니다.';
        }

        // 취소인지 실패인지 구분하여 메시지 표시
        if (response.code === 'FAILURE_TYPE_CANCEL' || response.message?.includes('취소')) {
          toast.info('결제가 취소되었습니다', {
            description: '다시 결제하시려면 결제하기 버튼을 클릭해주세요.',
            duration: 3000,
          });
        } else {
          toast.error('결제 실패', {
            description: response.message || '결제 중 오류가 발생했습니다.',
            duration: 4000,
          });
        }

        // 임시 주문 데이터 복원 (다시 결제할 수 있도록)
        try {
          const { saveTempOrderAction } = await import('@/lib/actions/order/orderServerActions');
          await saveTempOrderAction(orderData);
          console.log('[결제 처리] 임시 주문 데이터 복원 완료');
        } catch (error) {
          console.error('[결제 처리] 임시 주문 데이터 복원 실패:', error);
        }

        return; // 페이지 이동 없이 현재 페이지 유지
      }

      // 결제 성공 확인
      if (!response?.paymentId) {
        console.error('[결제 처리] paymentId 없음:', response);

        // 이 경우에도 쿠키 삭제
        document.cookie = 'payment-in-progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        toast.error('결제 정보를 가져올 수 없습니다');
        return; // 페이지 이동 없이 현재 페이지 유지
      }

      console.log('[결제 처리] 결제 성공, paymentId:', response.paymentId);

      // 결제 성공
      console.log('[결제 처리] 결제 성공, 검증 시작');

      // 결제 검증 시작 알림
      if (paymentStepRef.current) {
        paymentStepRef.current.textContent = '결제 검증을 진행하고 있습니다.';
      }

      // 검증 중 토스트
      const verifyingToastId = toast.loading('결제 검증 중...', {
        duration: Infinity,
      });

      const verificationResult = await verifyPaymentAndCompleteOrderAction(response.paymentId!, String(orderId));

      // 검증 토스트 즉시 닫기
      toast.dismiss(verifyingToastId);

      if (!verificationResult.success) {
        console.error('[결제 처리] 결제 검증 실패:', verificationResult.message);

        // 검증 실패 시에도 쿠키 삭제
        document.cookie = 'payment-in-progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // 결제 검증 실패 알림
        if (paymentStepRef.current) {
          paymentStepRef.current.textContent = '결제 검증에 실패했습니다.';
        }

        toast.error('결제 검증 실패', {
          description: verificationResult.message,
          duration: 4000,
        });
        return; // 페이지 이동 없이 현재 페이지 유지
      }

      // 결제 완료 처리
      console.log('[결제 처리] 결제 검증 성공');

      // 결제 완료 시 쿠키 삭제
      document.cookie = 'payment-in-progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // 결제 완료 알림
      if (paymentStepRef.current) {
        paymentStepRef.current.textContent = '결제가 성공적으로 완료되었습니다.';
      }

      // ==================== 성공 시에만 페이지 이동 ====================

      // redirectUrl 확인 로그
      const redirectUrl = verificationResult.data?.redirectUrl || result.data?.redirectUrl;
      console.log('[결제 처리] redirectUrl:', redirectUrl);

      // 결제 검증 성공한 경우에만 페이지 이동
      if (!redirectUrl) {
        console.error('[결제 처리] redirectUrl이 없습니다');
        if (orderId) {
          const manualRedirectUrl = `/order/order-complete?orderId=${orderId}`;
          console.log('[결제 처리] 수동 생성 redirectUrl:', manualRedirectUrl);

          toast.success('결제가 완료되었습니다!', {
            description: '주문 완료 페이지로 이동합니다.',
            duration: 2000,
          });

          setTimeout(() => {
            router.push(manualRedirectUrl);
          }, 1000);
          return;
        }
      }

      // 성공 알림
      toast.success('결제가 완료되었습니다!', {
        description: '주문 완료 페이지로 이동합니다.',
        duration: 2000,
      });

      if (redirectUrl) {
        console.log('[결제 처리] 페이지 이동:', redirectUrl);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      } else {
        // redirectUrl이 없어도 페이지 이동하지 않고 현재 페이지 유지
        console.log('[결제 처리] redirectUrl 없음 - 현재 페이지 유지');
        toast.info('주문이 완료되었습니다', {
          description: '주문 내역은 마이페이지에서 확인할 수 있습니다.',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('[결제 처리] 예상치 못한 오류:', error);

      // catch 블록에서도 쿠키 삭제
      document.cookie = 'payment-in-progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // 결제 오류 알림
      if (paymentStepRef.current) {
        paymentStepRef.current.textContent = '결제 처리 중 오류가 발생했습니다.';
      }

      // catch 블록에서는 페이지 이동하지 않음
      if (error instanceof Error && error.message.includes('NEXT_PUBLIC_PORTONE')) {
        toast.error('결제 설정 오류', {
          description: '환경변수를 확인해주세요. (.env.local 파일)',
          duration: 6000,
        });
      } else {
        toast.error('결제 처리 중 오류가 발생했습니다', {
          description: '잠시 후 다시 시도해주세요.',
          duration: 4000,
        });
      }

      // 오류 발생 시 현재 페이지에 머무르기
      console.log('[결제 처리] 오류 발생 - 현재 페이지 유지');
    } finally {
      // finally에서도 페이지 이동 없이 로딩 상태만 해제
      setIsProcessingOrder(false);

      // finally에서도 결제 진행 쿠키 정리
      document.cookie = 'payment-in-progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      console.log('[결제 처리] finally: 처리 완료, 현재 페이지 유지');
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setAddressForm({ name: '', phone: '', address: '', detailAddress: '', zipCode: '' });
      setFormErrors({});
      setTouched({ name: false, phone: false, address: false, detailAddress: false });
      setShowPostcode(false);
    }
  };

  return (
    <div className='bg-surface min-h-screen w-full p-4 sm:p-6 lg:p-8'>
      {/* 스크린 리더용 실시간 알림 영역 */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        <div ref={orderAnnouncementRef} />
        <div ref={paymentStepRef} />
      </div>

      {/* 전체 컨테이너 */}
      <div className='mx-auto max-w-6xl'>
        {/* 헤더 영역 */}
        <div className='mb-8'>
          <div className='text-secondary t-small font-medium'>| Payment</div>
          <h1 className='text-secondary t-h2 mt-2 font-light' role='heading' aria-level={1}>
            Purchase
          </h1>
        </div>

        {/* 컨텐츠 영역 */}
        <div className='space-y-6'>
          {/* 결제 상품 정보 */}
          <section className='rounded-2xl bg-white p-6 shadow-md' role='region' aria-labelledby='product-info-title'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 id='product-info-title' className='text-xl font-semibold'>
                결제 상품 정보
              </h2>
              {orderData.items.length > 1 && (
                <Button
                  className='font-bold'
                  variant='primary'
                  size='lg'
                  onClick={() => setShowItems(!showItems)}
                  aria-expanded={showItems}
                  aria-controls='additional-items'
                  aria-label={`${orderData.items.length}개 상품 중 ${showItems ? '일부만 보기' : '전체 보기'}`}
                >
                  {showItems ? '접기' : `전체 보기`}
                </Button>
              )}
            </div>

            <div className='space-y-4' role='list' aria-label={`주문 상품 ${orderData.items.length}개`}>
              {/* 첫 번째 상품 */}
              {orderData.items.slice(0, 1).map((item) => (
                <div key={item.productId} className='flex items-stretch justify-between' role='listitem'>
                  <div className='flex h-full items-start gap-3 md:gap-4'>
                    <div className='relative h-28 w-20 shrink-0 sm:h-32 sm:w-24 md:h-36 md:w-28 lg:h-40 lg:w-40'>
                      <Image src={item.productImage} alt={`${item.productName}${item.selectedColor ? ` ${item.selectedColor.colorName} 색상` : ''} 상품 이미지`} fill className='rounded object-cover' />
                    </div>
                    <div className='flex h-28 flex-col justify-between py-1 sm:h-32 md:h-36 lg:h-40'>
                      <div className='space-y-1'>
                        <h3 className='text-sm leading-tight font-semibold sm:text-lg md:text-lg xl:text-xl'>{item.productName}</h3>
                        {item.selectedColor && (
                          <p className='text-muted-foreground text-xs sm:text-sm md:text-sm lg:text-base'>
                            <span aria-label={`화분 색상: ${item.selectedColor.colorName}`}>화분 색상 : {item.selectedColor.colorName}</span>
                          </p>
                        )}
                      </div>
                      <div className='space-y-1'>
                        <p className='text-xs sm:text-sm' aria-label={`수량 ${item.quantity}개`}>
                          수량: {item.quantity}개
                        </p>
                        <p className='text-sm font-semibold sm:text-base md:text-lg xl:text-xl' aria-label={`상품 금액 ${(item.price * item.quantity).toLocaleString()}원`}>
                          ₩ {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 토글 시 나머지 상품들 노출 */}
              <div id='additional-items' aria-hidden={!showItems}>
                {showItems &&
                  orderData.items.slice(1).map((item) => (
                    <div key={item.productId} className='mt-8 flex items-stretch justify-between' role='listitem'>
                      <div className='flex h-full items-start gap-3 md:gap-4'>
                        <div className='relative h-28 w-20 shrink-0 sm:h-32 sm:w-24 md:h-36 md:w-28 lg:h-40 lg:w-40'>
                          <Image src={item.productImage} alt={`${item.productName}${item.selectedColor ? ` ${item.selectedColor.colorName} 색상` : ''} 상품 이미지`} fill className='rounded object-cover' />
                        </div>
                        <div className='flex h-28 flex-col justify-between py-1 sm:h-32 md:h-36 lg:h-40'>
                          <div className='space-y-1'>
                            <h3 className='text-sm leading-tight font-semibold sm:text-lg md:text-lg xl:text-xl'>{item.productName}</h3>
                            {item.selectedColor && (
                              <p className='text-muted-foreground text-xs sm:text-sm md:text-sm lg:text-base'>
                                <span aria-label={`화분 색상: ${item.selectedColor.colorName}`}>화분 색상 : {item.selectedColor.colorName}</span>
                              </p>
                            )}
                          </div>
                          <div className='space-y-1'>
                            <p className='text-xs sm:text-sm' aria-label={`수량 ${item.quantity}개`}>
                              수량: {item.quantity}개
                            </p>
                            <p className='text-sm font-semibold sm:text-base md:text-lg xl:text-xl' aria-label={`상품 금액 ${(item.price * item.quantity).toLocaleString()}원`}>
                              ₩ {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          {/* 배송지 정보 */}
          <section className='mt-7 rounded-2xl bg-white p-6 shadow-md' role='region' aria-labelledby='shipping-info-title'>
            <div className='mb-7 flex items-center justify-between'>
              <h2 id='shipping-info-title' className='text-xl font-semibold'>
                배송지 정보
              </h2>
              <Button
                className='font-bold'
                variant='primary'
                size='lg'
                onClick={() => {
                  setActiveTab('select');
                  setDialogOpen(true);
                }}
                aria-label='배송지 정보 변경'
              >
                변경
              </Button>
            </div>
            <div className='text-sm'>
              {/* 현재 배송지 표시 */}
              <div className='space-y-4' role='group' aria-labelledby='current-address-title'>
                <span id='current-address-title' className='sr-only'>
                  현재 설정된 배송지 정보
                </span>
                {orderData.address ? (
                  <>
                    <div className='flex justify-between lg:justify-start lg:gap-4'>
                      <span className='w-24 shrink-0 lg:w-48'>받는 사람</span>
                      <span className='break-words' aria-label={`받는 사람: ${orderData.address.name}`}>
                        {orderData.address.name}
                      </span>
                    </div>
                    <div className='flex justify-between lg:justify-start lg:gap-4'>
                      <span className='w-24 shrink-0 lg:w-48'>연락처</span>
                      <span className='break-words' aria-label={`연락처: ${orderData.address.phone}`}>
                        {orderData.address.phone}
                      </span>
                    </div>
                    <div className='flex items-start justify-between lg:justify-start lg:gap-4'>
                      <span className='w-24 shrink-0 lg:w-48'>주소</span>
                      <span
                        className='break-words'
                        aria-label={`배송 주소: ${orderData.address.zipCode ? `(${orderData.address.zipCode}) ` : ''}${orderData.address.address}${orderData.address.detailAddress ? ` ${orderData.address.detailAddress}` : ''}`}
                      >
                        {orderData.address.zipCode && `(${orderData.address.zipCode}) `}
                        {orderData.address.address}
                        {orderData.address.detailAddress && ` ${orderData.address.detailAddress}`}
                      </span>
                    </div>
                    {orderData.memo && (
                      <div className='flex items-start justify-between lg:justify-start lg:gap-4'>
                        <span className='w-24 shrink-0 lg:w-48'>배송 메모</span>
                        <span className='text-secondary break-words' aria-label={`배송 메모: ${orderData.memo}`}>
                          {orderData.memo}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className='text-gray-500' role='status'>
                    배송지를 입력해주세요.
                  </p>
                )}
              </div>

              {/* 배송지 설정 모달 */}
              <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto' role='dialog' aria-labelledby='address-dialog-title'>
                  <div className='w-full bg-white'>
                    <DialogHeader>
                      <DialogTitle id='address-dialog-title' className='text-lg font-semibold'>
                        배송지 설정
                      </DialogTitle>
                    </DialogHeader>

                    {/* 탭 네비게이션 */}
                    <div className='mt-4 flex w-full' role='tablist' aria-label='배송지 설정 옵션'>
                      <Button
                        variant='ghost'
                        role='tab'
                        aria-selected={activeTab === 'select'}
                        aria-controls='select-panel'
                        onClick={() => {
                          setActiveTab('select');
                          setShowPostcode(false);
                        }}
                        onKeyDown={(e) => handleTabKeyDown(e, 'select')}
                        className={`flex-1 py-3 transition-colors ${activeTab === 'select' ? 'bg-[#c1d72f] text-black' : 'bg-white'}`}
                      >
                        배송지 선택
                      </Button>
                      <Button
                        variant='ghost'
                        role='tab'
                        aria-selected={activeTab === 'new'}
                        aria-controls='new-panel'
                        onClick={() => {
                          setActiveTab('new');
                          setShowPostcode(false);
                        }}
                        onKeyDown={(e) => handleTabKeyDown(e, 'new')}
                        className={`flex-1 py-3 transition-colors ${activeTab === 'new' ? 'bg-[#c1d72f] text-black' : 'bg-white'}`}
                      >
                        신규 입력
                      </Button>
                    </div>

                    {/* 탭 컨텐츠 */}
                    {activeTab === 'select' ? (
                      <div id='select-panel' role='tabpanel' aria-labelledby='address-dialog-title' className='mt-6 max-h-[350px] overflow-y-auto'>
                        <div className='space-y-4'>
                          {savedAddresses.map((addr, index) => (
                            <div key={addr.id}>
                              <label className='flex items-start gap-3 py-4' role='group' aria-labelledby={`address-${addr.id}-info`}>
                                <input type='radio' name='address' className='mt-1' checked={selectedAddressId === addr.id} onChange={() => handleSelectAddress(addr.id)} aria-describedby={`address-${addr.id}-info`} />
                                <div className='flex-1' id={`address-${addr.id}-info`}>
                                  <p className='font-medium'>{addr.name}</p>
                                  <p className='text-sm'>{addr.phone}</p>
                                  <p className='text-sm'>
                                    {addr.zipCode && `(${addr.zipCode}) `}
                                    {addr.address}
                                    {addr.detailAddress && ` ${addr.detailAddress}`}
                                  </p>
                                </div>
                                <div className='flex flex-col gap-2' role='group' aria-label={`${addr.name} 배송지 관리`}>
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
                                    aria-label={`${addr.name} 배송지 정보 수정`}
                                  >
                                    수정
                                  </Button>
                                  <Button variant='destructive' size='sm' onClick={() => handleDeleteAddress(addr.id)} aria-label={`${addr.name} 배송지 삭제`}>
                                    삭제
                                  </Button>
                                </div>
                              </label>
                              {index < savedAddresses.length - 1 && <hr className='border-gray-200' />}
                            </div>
                          ))}

                          {savedAddresses.length === 0 && (
                            <p className='py-4 text-center text-gray-500' role='status'>
                              저장된 배송지가 없습니다.
                            </p>
                          )}

                          {/* 배송 메모 */}
                          {savedAddresses.length > 0 && (
                            <>
                              <hr className='my-4 border-gray-200' />
                              <div className='space-y-2 py-4'>
                                <Label htmlFor='deliveryNote' className='font-semibold'>
                                  배송 메모
                                </Label>
                                <Select value={deliveryMemo} onValueChange={handleSaveMemo}>
                                  <SelectTrigger id='deliveryNote' className='w-full' aria-describedby='delivery-memo-description'>
                                    <SelectValue placeholder='배송 메모를 선택해 주세요.' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      <SelectLabel>배송 메모 선택</SelectLabel>
                                      <SelectItem value='부재 시 경비실에 맡겨주세요.'>부재 시 경비실에 맡겨주세요.</SelectItem>
                                      <SelectItem value='배송 전 연락 바랍니다.'>배송 전 연락 바랍니다.</SelectItem>
                                      <SelectItem value='문 앞에 보관해주세요.'>문 앞에 보관해주세요.</SelectItem>
                                      <SelectItem value='파손 위험이 있으니 조심히 다뤄주세요.'>파손 위험이 있으니 조심히 다뤄주세요.</SelectItem>
                                      <SelectItem value='부재시 택배함에 넣어주세요.'>부재시 택배함에 넣어주세요.</SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <span id='delivery-memo-description' className='sr-only'>
                                  배송 시 요청사항을 선택하세요
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div id='new-panel' role='tabpanel' aria-labelledby='address-dialog-title' className='mt-4'>
                        {/* 주소 검색이 표시중일 때 */}
                        {showPostcode ? (
                          <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                              <h3 className='text-lg font-semibold'>주소 검색</h3>
                              <Button variant='ghost' size='sm' onClick={() => setShowPostcode(false)} className='text-gray-500 hover:text-gray-700' aria-label='주소 검색 닫기'>
                                뒤로가기
                              </Button>
                            </div>
                            <div className='overflow-hidden rounded-lg border' role='application' aria-label='우편번호 검색'>
                              <DaumPostcode onComplete={handlePostcodeComplete} style={{ width: '100%', height: '400px' }} />
                            </div>
                          </div>
                        ) : (
                          /* 일반 주소 입력 폼 */
                          <form className='grid gap-4' role='form' aria-labelledby='new-address-title'>
                            <span id='new-address-title' className='sr-only'>
                              새 배송지 정보 입력
                            </span>
                            <div>
                              <label htmlFor='recipient-name' className='block text-sm font-medium'>
                                이름{' '}
                                <span className='text-red-500' aria-label='필수 입력'>
                                  *
                                </span>
                              </label>
                              <input
                                id='recipient-name'
                                type='text'
                                className={`mt-1 w-full rounded border p-2 ${formErrors.name && touched.name ? 'border-red-500' : ''}`}
                                placeholder='받는 분 성함'
                                value={addressForm.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                onBlur={() => handleInputBlur('name')}
                                maxLength={20}
                                aria-describedby={formErrors.name && touched.name ? 'name-error' : undefined}
                                aria-invalid={formErrors.name && touched.name ? 'true' : 'false'}
                              />
                              {formErrors.name && touched.name && (
                                <p id='name-error' className='mt-1 text-xs text-red-500' role='alert'>
                                  {formErrors.name}
                                </p>
                              )}
                            </div>
                            <div>
                              <label htmlFor='recipient-phone' className='block text-sm font-medium'>
                                전화번호{' '}
                                <span className='text-red-500' aria-label='필수 입력'>
                                  *
                                </span>
                              </label>
                              <input
                                id='recipient-phone'
                                type='tel'
                                className={`mt-1 w-full rounded border p-2 ${formErrors.phone && touched.phone ? 'border-red-500' : ''}`}
                                placeholder='010-1234-5678'
                                value={addressForm.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                onBlur={() => handleInputBlur('phone')}
                                maxLength={13}
                                aria-describedby={formErrors.phone && touched.phone ? 'phone-error' : undefined}
                                aria-invalid={formErrors.phone && touched.phone ? 'true' : 'false'}
                              />
                              {formErrors.phone && touched.phone && (
                                <p id='phone-error' className='mt-1 text-xs text-red-500' role='alert'>
                                  {formErrors.phone}
                                </p>
                              )}
                            </div>
                            <div>
                              <label htmlFor='zip-code' className='block text-sm font-medium'>
                                우편번호{' '}
                                <span className='text-red-500' aria-label='필수 입력'>
                                  *
                                </span>
                              </label>
                              <input id='zip-code' type='text' className='mt-1 w-full rounded border bg-gray-50 p-2' placeholder='주소를 찾아주세요' value={addressForm.zipCode} readOnly aria-describedby='zip-code-description' />
                              <span id='zip-code-description' className='sr-only'>
                                주소 찾기 버튼을 사용해주세요
                              </span>
                            </div>
                            <div>
                              <label htmlFor='street-address' className='block text-sm font-medium'>
                                도로명 주소{' '}
                                <span className='text-red-500' aria-label='필수 입력'>
                                  *
                                </span>
                              </label>
                              <div className='mt-1 flex gap-2'>
                                <input
                                  id='street-address'
                                  type='text'
                                  className={`flex-1 rounded border bg-gray-50 p-2 ${formErrors.address && touched.address ? 'border-red-500' : ''}`}
                                  placeholder='주소를 찾아주세요'
                                  value={addressForm.address}
                                  readOnly
                                  aria-describedby={formErrors.address && touched.address ? 'address-error' : 'address-search-description'}
                                  aria-invalid={formErrors.address && touched.address ? 'true' : 'false'}
                                />
                                <Button type='button' size='lg' variant='default' onClick={handleAddressSearch} aria-describedby='address-search-description'>
                                  주소 찾기
                                </Button>
                              </div>
                              <span id='address-search-description' className='sr-only'>
                                주소 찾기 버튼을 사용해주세요
                              </span>
                              {formErrors.address && touched.address && (
                                <p id='address-error' className='mt-1 text-xs text-red-500' role='alert'>
                                  {formErrors.address}
                                </p>
                              )}
                            </div>
                            <div>
                              <label htmlFor='detail-address' className='block text-sm font-medium'>
                                상세 주소
                              </label>
                              <input
                                id='detail-address'
                                type='text'
                                className='mt-1 w-full rounded border p-2'
                                placeholder='상세 주소를 입력해주세요'
                                value={addressForm.detailAddress}
                                onChange={(e) => handleInputChange('detailAddress', e.target.value)}
                                maxLength={50}
                                aria-describedby='detail-address-description'
                              />
                              <span id='detail-address-description' className='sr-only'>
                                아파트 동호수, 건물명 등 상세 주소를 입력하세요 (선택사항)
                              </span>
                            </div>
                            <div className='mt-2 text-xs text-gray-500' role='note'>
                              <span className='text-red-500' aria-hidden='true'>
                                *
                              </span>{' '}
                              표시는 필수 입력 항목입니다.
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {/* 적용 버튼 */}
                    {!showPostcode && (
                      <div className='mt-6 flex justify-end'>
                        <Button
                          variant='primary'
                          onClick={() => {
                            if (activeTab === 'select') {
                              if (selectedAddressId) {
                                setDialogOpen(false);
                              }
                            } else {
                              handleSaveAddress();
                            }
                          }}
                          aria-label={activeTab === 'select' ? '선택한 배송지 적용하기' : '입력한 배송지 정보 저장하기'}
                        >
                          적용하기
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          {/* 총 결제 금액 */}
          <section className='mt-7 rounded-2xl bg-white p-6 text-sm shadow-md lg:flex lg:items-end lg:justify-between' role='region' aria-labelledby='payment-summary-title'>
            <div className='w-full lg:w-[500px]'>
              <h2 id='payment-summary-title' className='mb-7 text-xl font-semibold lg:text-2xl'>
                총 결제 금액
              </h2>
              <div className='space-y-4' role='list' aria-label='결제 금액 상세'>
                <div className='flex justify-between' role='listitem'>
                  <span className='text-secondary'>총 상품 금액</span>
                  <span className='font-semibold' aria-label={`총 상품 금액 ${totalProductAmount.toLocaleString()}원`}>
                    ₩ {totalProductAmount.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between' role='listitem'>
                  <span className='text-secondary'>배송비</span>
                  <span className='font-semibold' aria-label='배송비 3천원'>
                    ₩ 3,000
                  </span>
                </div>
                <hr className='my-4' />
                <div className='flex justify-between text-lg' role='listitem'>
                  <span className='font-semibold'>합계</span>
                  <span className='text-secondary text-xl font-bold' aria-label={`총 결제 금액 ${finalAmount.toLocaleString()}원`}>
                    ₩ {finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            {/* 결제 버튼 */}
            <Button
              fullWidth
              variant='primary'
              size='lg'
              className='mt-6 rounded-lg px-6 py-3 font-bold lg:w-auto'
              onClick={handlePayment}
              disabled={isProcessingOrder || !orderData.address}
              aria-label={`총 ${finalAmount.toLocaleString()}원 결제하기${!orderData.address ? ' - 배송지를 먼저 입력해주세요' : ''}`}
              aria-describedby='payment-button-description'
            >
              {isProcessingOrder ? '처리 중...' : '결제하기'}
            </Button>
            <span id='payment-button-description' className='sr-only'>
              {!orderData.address ? '결제하려면 먼저 배송지 정보를 입력해주세요' : `${finalAmount.toLocaleString()}원을 결제하고 주문을 완료합니다`}
            </span>
          </section>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent role='alertdialog' aria-labelledby='delete-dialog-title' aria-describedby='delete-dialog-description'>
          <AlertDialogHeader>
            <AlertDialogTitle id='delete-dialog-title'>배송지 삭제</AlertDialogTitle>
            <AlertDialogDescription id='delete-dialog-description'>선택한 배송지를 삭제하시겠습니까?</AlertDialogDescription>
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
