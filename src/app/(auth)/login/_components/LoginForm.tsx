'use client';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/hooks/useLogin';
import { useLoginForm } from '@/hooks/useLoginForm';
import { LoginFormData } from '@/types/auth.types';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const { login, isLoading, error, clearError } = useLogin();
  const { form, showPassword, emailValidation, passwordValidation, togglePasswordVisibility } = useLoginForm();

  // 폼 제출 처리
  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <div className='w-full max-w-xl rounded-lg border-[0.5px] border-[#4c956c] bg-white p-8'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col justify-center'>
          {/* API 에러 메시지 표시 */}
          {error && <div className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600'>{error}</div>}

          {/* 이메일 입력 */}
          <FormField
            control={form.control}
            name='email'
            rules={emailValidation}
            render={({ field }) => (
              <FormItem className='mb-2'>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='이메일을 입력하세요.'
                    className='my-2'
                    autoComplete='username'
                    disabled={isLoading}
                    style={{ margin: '0px' }}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (error) clearError(); // API 에러 클리어
                    }}
                  />
                </FormControl>
                <FormMessage className='min-h-[1.5em] pb-1'>{'\u00A0'}</FormMessage>
              </FormItem>
            )}
          />

          {/* 비밀번호 입력 */}
          <FormField
            control={form.control}
            name='password'
            rules={passwordValidation}
            render={({ field }) => (
              <FormItem className='relative mb-2'>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      placeholder='비밀번호를 입력하세요.'
                      className='my-2 pr-10'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='current-password'
                      disabled={isLoading}
                      style={{ margin: '0px' }}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (error) clearError(); // API 에러 클리어
                      }}
                    />
                    <button
                      type='button'
                      onClick={togglePasswordVisibility}
                      className='text-muted absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center justify-center'
                      aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                      disabled={isLoading}
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className='min-h-[1.5em] pb-1'>{'\u00A0'}</FormMessage>
              </FormItem>
            )}
          />

          {/* 자동 로그인 체크박스 */}
          <FormField
            control={form.control}
            name='rememberLogin'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center gap-3'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                  </FormControl>
                  <FormLabel className='cursor-pointer'>자동 로그인</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* 로그인 버튼 */}
          <Button type='submit' fullWidth variant='default' size='lg' className='mt-8' disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          {/* 링크 섹션 */}
          <div className='mt-4 mb-8 space-x-2 text-center text-xs font-semibold md:text-sm'>
            <span>아이디 찾기</span>
            <span> | </span>
            <span>비밀번호 찾기</span>
            <span> | </span>
            <Link href='/sign-up' className='underline-offset-4 hover:underline'>
              회원가입
            </Link>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <Button asChild className='mb-4 bg-green-500 hover:bg-green-700' fullWidth variant='primary' size='lg'>
            <Link href='/'>네이버 로그인</Link>
          </Button>
          <Button asChild className='mb-4 bg-yellow-300 hover:bg-amber-300' fullWidth variant='default' size='lg'>
            <Link href='/'>카카오 로그인</Link>
          </Button>
        </form>
      </Form>
    </div>
  );
}
