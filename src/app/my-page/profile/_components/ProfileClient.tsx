'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { updateUserProfile } from '@/lib/actions/userActions';
import type { UserDetail } from '@/lib/functions/userFunctions';
import { AlertCircle, Calendar, Camera, ChevronRight, Mail, MapPin, Phone, User } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ChangePasswordDialog from './ChangePasswordDialog';

interface ProfileClientProps {
  user: UserDetail | null;
}

interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  attach?: FileList;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [displayEmail, setDisplayEmail] = useState(user?.email || '');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
    mode: 'onBlur',
  });

  // user가 바뀔 때마다 reset을 호출하여 폼 초기값을 맞춰줌
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
      setDisplayName(user.name || '');
      setDisplayEmail(user.email || '');
    }
  }, [user, reset]);

  // 파일 변경 시 미리보기
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setPreviewUrl(URL.createObjectURL(files[0]));
    }
  };

  if (!user) {
    return (
      <div className='flex items-center justify-center'>
        <div className='flex w-full max-w-md flex-col items-center gap-6 px-8 py-12'>
          <AlertCircle className='text-error mb-2 size-12' />
          <div className='t-h3 text-secondary mb-1'>프로필 정보를 불러오지 못했습니다</div>
          <div className='t-desc text-secondary/70 mb-4 text-center'>
            일시적인 오류가 발생했어요.
            <br />
            잠시 후 다시 시도해 주세요.
          </div>
          <Button variant='secondary' onClick={() => window.location.reload()}>
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  // 저장 핸들러
  const onSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('address', values.address);
      if (values.attach && values.attach[0]) {
        formData.append('attach', values.attach[0]);
      }
      const res = await updateUserProfile(formData);
      if (res.ok) {
        // setCurrentImage(res.item?.image || currentImage); // 저장 후 이미지 갱신하지 않음
        // setPreviewUrl(null); // 저장 후 미리보기 유지
        const updatedData = {
          name: res.item?.name ?? values.name,
          email: res.item?.email ?? values.email,
          phone: res.item?.phone ?? values.phone,
          address: res.item?.address ?? values.address,
        };

        reset(updatedData);

        // 저장 후 표시용 데이터 업데이트
        setDisplayName(updatedData.name);
        setDisplayEmail(updatedData.email);

        toast.success('프로필이 성공적으로 수정되었습니다!');
      } else {
        toast.error(res.message || '프로필 수정에 실패했습니다.');
      }
    });
  };

  return (
    <div className='bg-surface min-h-screen'>
      <div className='mx-auto max-w-2xl p-6'>
        {/* 헤더 */}
        <div className='mb-8'>
          <h2 className='t-h2 text-secondary mb-2'>프로필 정보</h2>
          <p className='t-desc text-secondary/70'>내 정보를 확인할 수 있어요</p>
        </div>

        {/* 프로필 카드 */}
        <form onSubmit={handleSubmit(onSubmit)} className='mb-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
          <div className='mb-8 flex items-center space-x-6'>
            <div className='relative'>
              {/* 프로필 이미지 */}
              <Avatar className='size-20 ring-4 ring-gray-100'>
                <AvatarImage src={previewUrl || user?.image} alt='프로필 이미지' className='object-cover' />
                <AvatarFallback className='from-primary to-primary/80 text-secondary t-h3 bg-gradient-to-br font-semibold'>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <input
                type='file'
                accept='image/*'
                className='hidden'
                id='avatar-upload'
                disabled={isPending}
                {...register('attach')}
                onChange={(e) => {
                  handleFileChange(e);
                  register('attach').onChange(e);
                }}
              />
              <label htmlFor='avatar-upload'>
                <Button variant='primary' size='icon' className='bg-primary hover:bg-primary/90 absolute -right-1 -bottom-1 size-8 rounded-full shadow-lg' asChild disabled={isPending}>
                  <span>
                    <Camera className='size-4' />
                  </span>
                </Button>
              </label>
            </div>
            <div className='flex-1'>
              <h3 className='t-h3 text-secondary mb-1'>{displayName}</h3>
              <p className='t-body text-secondary/70 mb-2'>{displayEmail}</p>
              <div className='t-small text-secondary/50 flex items-center gap-2'>
                <Calendar className='size-4' />
                <span>{user.createdAt} 가입</span>
              </div>
            </div>
          </div>

          {/* 개인정보 섹션 */}
          <div className='space-y-6'>
            <h3 className='t-h4 text-secondary mb-4'>개인정보</h3>
            <div className='space-y-3'>
              <div>
                <div className='t-small text-secondary/70 mb-1 flex items-center gap-2'>
                  <User className='size-4' />
                  이름
                </div>
                <input
                  className='t-body text-secondary focus:ring-primary flex h-12 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 outline-none focus:ring-2'
                  {...register('name', { required: true, maxLength: 20 })}
                  disabled={isPending}
                />
                <div className='min-h-[1.5rem]'>{errors.name ? <span className='text-error text-sm'>이름을 입력해 주세요.</span> : null}</div>
              </div>
              <div>
                <div className='t-small text-secondary/70 mb-1 flex items-center gap-2'>
                  <Mail className='size-4' />
                  이메일
                </div>
                <input
                  className='t-body text-secondary focus:ring-primary flex h-12 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 outline-none focus:ring-2'
                  {...register('email', { required: true, minLength: 10, maxLength: 30 })}
                  disabled={isPending}
                  type='email'
                />
                <div className='min-h-[1.5rem]'>
                  {errors.email?.type === 'required' && <span className='text-error text-sm'>이메일을 입력해 주세요.</span>}
                  {errors.email?.type === 'minLength' && <span className='text-error text-sm'>이메일은 최소 10자 이상이어야 합니다.</span>}
                  {errors.email?.type === 'maxLength' && <span className='text-error text-sm'>이메일은 최대 30자까지 입력할 수 있습니다.</span>}
                  {errors.email?.type === 'pattern' && <span className='text-error text-sm'>올바른 이메일 형식이 아닙니다.</span>}
                </div>
              </div>
              <div>
                <div className='t-small text-secondary/70 mb-1 flex items-center gap-2'>
                  <Phone className='size-4' />
                  전화번호
                </div>
                <input
                  className='t-body text-secondary focus:ring-primary flex h-12 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 outline-none focus:ring-2'
                  {...register('phone', {
                    required: true,
                    minLength: 10,
                    maxLength: 11,
                    pattern: { value: /^[0-9]*$/, message: '숫자만 입력하세요.' },
                  })}
                  disabled={isPending}
                  type='tel'
                  placeholder='전화번호를 입력하세요'
                />
                <div className='min-h-[1.5rem]'>
                  {errors.phone?.type === 'required' && <span className='text-error text-sm'>전화번호를 입력해 주세요.</span>}
                  {errors.phone?.type === 'minLength' && <span className='text-error text-sm'>전화번호는 최소 10자리여야 합니다.</span>}
                  {errors.phone?.type === 'maxLength' && <span className='text-error text-sm'>전화번호는 최대 11자리까지 입력할 수 있습니다.</span>}
                  {errors.phone?.type === 'pattern' && <span className='text-error text-sm'>{errors.phone.message}</span>}
                </div>
              </div>
              <div>
                <div className='t-small text-secondary/70 mb-1 flex items-center gap-2'>
                  <MapPin className='size-4' />
                  주소
                </div>
                <input
                  className='t-body text-secondary focus:ring-primary flex h-12 w-full items-center rounded-xl border border-gray-200 bg-gray-50 px-4 outline-none focus:ring-2'
                  {...register('address', { required: true, minLength: 3, maxLength: 50 })}
                  disabled={isPending}
                />
                <div className='min-h-[1.5rem]'>{errors.address ? <span className='text-error text-sm'>주소를 입력해 주세요.</span> : null}</div>
              </div>
            </div>
            <div className='flex justify-end pt-2'>
              <Button type='submit' disabled={isPending || !isDirty}>
                {isPending ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </form>

        {/* 계정 설정 카드 (비활성화, 안내만) */}
        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <div className='border-b border-gray-200 px-8 py-6'>
            <h3 className='t-h4 text-secondary'>계정 설정</h3>
          </div>

          <div className='divide-y divide-gray-200 bg-white'>
            {/* 비밀번호 변경 */}
            <button type='button' onClick={() => setIsPasswordDialogOpen(true)} className='flex h-auto w-full cursor-pointer items-center justify-between rounded-none px-8 py-6 text-left transition-colors hover:bg-gray-50'>
              <div className='flex-1'>
                <h4 className='t-body text-secondary mb-1 font-semibold'>비밀번호 변경</h4>
                <p className='t-small text-secondary/70'>계정 보안을 위해 주기적으로 비밀번호를 변경하세요</p>
              </div>
              <ChevronRight className='text-secondary/50 size-5' />
            </button>

            {/* 이메일 알림 */}
            <div className='flex h-auto w-full cursor-not-allowed items-center justify-between rounded-none border-t border-gray-100 px-8 py-6 text-left opacity-50'>
              <div className='flex-1'>
                <h4 className='t-body text-secondary mb-1 font-semibold'>이메일 알림</h4>
                <p className='t-small text-secondary/70'>이메일 알림 설정은 현재 지원하지 않습니다</p>
              </div>
            </div>

            {/* 계정 삭제 */}
            <div className='flex h-auto w-full cursor-not-allowed items-center justify-between rounded-none border-t border-gray-100 px-8 py-6 text-left opacity-50'>
              <div className='flex-1'>
                <h4 className='t-body text-error mb-1 font-semibold'>계정 삭제</h4>
                <p className='t-small text-secondary/70'>계정 삭제는 현재 지원하지 않습니다</p>
              </div>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 다이얼로그 */}
        <ChangePasswordDialog isOpen={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)} />
      </div>
    </div>
  );
}
