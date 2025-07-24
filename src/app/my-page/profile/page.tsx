'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, Camera, ChevronRight, Mail, Save, User, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// 폼 검증 스키마
const profileFormSchema = z.object({
  nickname: z.string().min(2, '닉네임은 2글자 이상이어야 합니다').max(20, '닉네임은 20글자 이하여야 합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type ProfileData = ProfileFormValues & {
  joinDate: string;
  avatar?: string;
};

export default function ProfilePage() {
  // 원본 데이터 (저장된 데이터)
  const [originalData, setOriginalData] = useState<ProfileData>({
    nickname: '에렌 예거',
    email: 'shinzowosasageyo@gmail.com',
    joinDate: '2025년 7월',
    avatar: 'https://i.namu.wiki/i/fAnwc0Z2sHpEEUIlUq9gVnNhBJykSBqlMnfNlvwirNKkl8ovGLYTcPfT5mPmI5cF9ERUeeil92WUuMUopK6lxoK2RsNaRlk3OK5Lf6d-TV_2u1qWErJLYeZqQmTEPg6GyLWiGQODV2yYlhyyuuP96A.webp',
  });

  // 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // React Hook Form 설정
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nickname: originalData.nickname,
      email: originalData.email,
    },
    mode: 'onChange', // 실시간 검증
  });

  const {
    formState: { isDirty, isValid },
  } = form;

  // 프로필 저장 핸들러
  const handleSave = useCallback(
    async (data: ProfileFormValues) => {
      setIsLoading(true);
      setSaveError(null);

      try {
        // TODO: 실제 API 연동 구현

        // 성공 시 원본 데이터 업데이트
        setOriginalData((prev) => ({
          ...prev,
          ...data,
        }));

        // 폼 상태를 새로운 값으로 리셋 (isDirty를 false로 만듦)
        form.reset(data);

        console.log('프로필 저장 성공:', data);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : '프로필 저장에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [form],
  );

  // 취소 핸들러
  const handleCancel = useCallback(() => {
    form.reset({
      nickname: originalData.nickname,
      email: originalData.email,
      avatar: originalData.avatar || '',
    });
    setSaveError(null);
    setAvatarError(null);
  }, [form, originalData]);

  // 아바타 업로드 핸들러
  const handleAvatarUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        setAvatarError('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setAvatarLoading(true);
      setAvatarError(null);

      try {
        // TODO: 실제 API 연동 구현
        const avatarUrl = ''; // 임시 값

        setOriginalData((prev) => ({
          ...prev,
          avatar: avatarUrl,
        }));

        // form의 avatar 필드도 업데이트하여 저장 버튼 활성화
        form.setValue('avatar', avatarUrl, { shouldDirty: true });

        console.log('아바타 업로드 성공:', avatarUrl);
      } catch (error) {
        setAvatarError(error instanceof Error ? error.message : '아바타 업로드에 실패했습니다.');
      } finally {
        setAvatarLoading(false);
      }

      // 파일 입력 초기화
      event.target.value = '';
    },
    [form],
  );

  return (
    <div className='bg-surface min-h-screen'>
      <div className='mx-auto max-w-2xl p-6'>
        {/* 헤더 */}
        <div className='mb-8'>
          <h2 className='t-h2 text-secondary mb-2'>프로필 정보</h2>
          <p className='t-desc text-secondary/70'>내 정보를 관리하고 설정을 변경할 수 있어요</p>
        </div>

        {/* 프로필 카드 */}
        <div className='mb-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
          <div className='mb-8 flex items-center space-x-6'>
            <div className='relative'>
              <Avatar className='size-20 ring-4 ring-gray-100'>
                <AvatarImage src={originalData.avatar} alt='프로필 이미지' />
                <AvatarFallback className='from-primary to-primary/80 text-secondary t-h3 bg-gradient-to-br font-semibold'>{originalData.nickname.charAt(0)}</AvatarFallback>
              </Avatar>

              {/* 아바타 업로드 */}
              <input type='file' accept='image/*' onChange={handleAvatarUpload} className='hidden' id='avatar-upload' disabled={avatarLoading} />
              <label htmlFor='avatar-upload'>
                <Button variant='primary' size='icon' className='bg-primary hover:bg-primary/90 absolute -right-1 -bottom-1 size-8 rounded-full shadow-lg' asChild disabled={avatarLoading}>
                  <span>
                    <Camera className='size-4' />
                  </span>
                </Button>
              </label>

              {avatarLoading && (
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/20'>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                </div>
              )}
            </div>

            <div className='flex-1'>
              <h3 className='t-h3 text-secondary mb-1'>{originalData.nickname}</h3>
              <p className='t-body text-secondary/70 mb-2'>{originalData.email}</p>
              <div className='t-small text-secondary/50 flex items-center gap-2'>
                <Calendar className='size-4' />
                <span>{originalData.joinDate} 가입</span>
              </div>
            </div>
          </div>

          {/* 아바타 에러 메시지 */}
          {avatarError && (
            <div className='bg-error/10 border-error/20 mb-6 flex items-center gap-2 rounded-lg border p-3'>
              <AlertCircle className='text-error size-4' />
              <span className='text-error text-sm'>{avatarError}</span>
            </div>
          )}

          {/* 개인정보 섹션 */}
          <div className='space-y-6'>
            <h3 className='t-h4 text-secondary mb-4'>개인정보</h3>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className='space-y-3'>
                <FormField
                  control={form.control}
                  name='nickname'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='t-small text-secondary/70 flex items-center gap-2'>
                        <User className='size-4' />
                        닉네임
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='닉네임을 입력하세요' className='t-body text-secondary placeholder:text-secondary/50 focus-visible h-12 rounded-xl border border-gray-200 bg-white px-4 transition-all' disabled={isLoading} />
                      </FormControl>
                      <div className='flex min-h-[1rem] items-start'>
                        <FormMessage className='text-error text-xs' />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='t-small text-secondary/70 flex items-center gap-2'>
                        <Mail className='size-4' />
                        이메일
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='email'
                          placeholder='이메일을 입력하세요'
                          className='t-body text-secondary placeholder:text-secondary/50 focus-visible h-12 rounded-xl border border-gray-200 bg-white px-4 transition-all'
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className='flex min-h-[1rem] items-start'>
                        <FormMessage className='text-error text-xs' />
                      </div>
                    </FormItem>
                  )}
                />

                {/* 저장 에러 메시지 */}
                {saveError && (
                  <div className='bg-error/10 border-error/20 flex items-center gap-2 rounded-lg border p-3'>
                    <AlertCircle className='text-error size-4' />
                    <span className='text-error text-sm'>{saveError}</span>
                  </div>
                )}

                {/* 버튼 영역 */}
                <div className='flex justify-end gap-3'>
                  {isDirty && (
                    <Button type='button' variant='ghost' size='default' onClick={handleCancel} disabled={isLoading}>
                      <X className='size-4' />
                      취소
                    </Button>
                  )}

                  <Button type='submit' variant='primary' size='default' disabled={!isDirty || !isValid} loading={isLoading} loadingText='저장 중...'>
                    <Save className='size-4' />
                    저장하기
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* 계정 설정 카드 */}
        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <div className='border-b border-gray-200 px-8 py-6'>
            <h3 className='t-h4 text-secondary'>계정 설정</h3>
          </div>

          <div className='divide-y divide-gray-200 bg-white'>
            {/* 비밀번호 변경 */}
            <div className='flex h-auto w-full cursor-pointer items-center justify-between rounded-none px-8 py-6 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50' tabIndex={0} role='button'>
              <div className='flex-1'>
                <h4 className='t-body text-secondary mb-1 font-semibold'>비밀번호 변경</h4>
                <p className='t-small text-secondary/70'>보안을 위해 정기적으로 비밀번호를 변경하세요</p>
              </div>
              <ChevronRight className='text-secondary/40 size-5' />
            </div>

            {/* 이메일 알림 */}
            <div className='flex h-auto w-full cursor-pointer items-center justify-between rounded-none border-t border-gray-100 px-8 py-6 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50' tabIndex={0} role='button'>
              <div className='flex-1'>
                <h4 className='t-body text-secondary mb-1 font-semibold'>이메일 알림</h4>
                <p className='t-small text-secondary/70'>중요한 업데이트와 알림을 받으세요</p>
              </div>
              <ChevronRight className='text-secondary/40 size-5' />
            </div>

            {/* 계정 삭제 */}
            <div className='hover:bg-error/5 focus:bg-error/5 flex h-auto w-full cursor-pointer items-center justify-between rounded-none border-t border-gray-100 px-8 py-6 text-left transition-colors' tabIndex={0} role='button'>
              <div className='flex-1'>
                <h4 className='t-body text-error mb-1 font-semibold'>계정 삭제</h4>
                <p className='t-small text-secondary/70'>계정을 영구적으로 삭제합니다</p>
              </div>
              <ChevronRight className='text-error/60 size-5' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
