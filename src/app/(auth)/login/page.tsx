'use client';

import loginPlantIcon from '@/assets/images/login_plant_character.webp';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => {
      return !prev;
    });
  };

  return (
    <div className='mb-15 flex w-full flex-col items-center p-4'>
      <h1 className='t-h1 mt-5'>
        <span className='text-accent'>작은 초록,</span> 당신의 하루를 반짝이게.
      </h1>
      <p className='text-muted mb-10 flex items-center gap-2 md:text-lg'>
        당신의 반려 식물을 지금 만나보세요.
        <Image className='h-8 w-4 md:h-10 md:w-5' src={loginPlantIcon} alt='식물 캐릭터' />
      </p>
      <div className='w-full max-w-xl rounded-lg border-[0.5px] border-[#4c956c] bg-white p-8'>
        <form className='flex w-full flex-col justify-center'>
          <div className='mb-2'>
            <Label htmlFor='email'>이메일</Label>
            <Input type='email' id='email' placeholder='이메일을 입력하세요.' className='my-2' autoComplete='username' />
          </div>
          <div className='relative mb-2'>
            <Label htmlFor='password'>비밀번호</Label>
            <Input id='password' placeholder='비밀번호를 입력하세요.' className='my-2 pr-10' type={showPassword ? 'text' : 'password'} autoComplete='current-password' />
            <button type='button' onClick={handleTogglePassword} className='text-muted absolute top-1/2 right-3 cursor-pointer' aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <div className='flex gap-3'>
            <Checkbox id='remember-login' name='remember' />
            <Label htmlFor='remember-login'>자동 로그인</Label>
          </div>
          <Button asChild fullWidth variant='default' size='lg' className='mt-8'>
            <Link href='/'>로그인</Link>
          </Button>
          <div className='mt-4 mb-8 space-x-2 text-center text-xs font-semibold md:text-sm'>
            <span>아이디 찾기</span>
            <span> | </span>
            <span>비밀번호 찾기</span>
            <span> | </span>
            <Link href='/sign-up' className='underline-offset-4 hover:underline'>
              회원가입
            </Link>
          </div>
          <Button asChild className='mb-4 bg-green-500 hover:bg-green-700' fullWidth variant='primary' size='lg'>
            <Link href='/'>네이버 로그인</Link>
          </Button>
          <Button asChild className='mb-4 bg-yellow-300 hover:bg-amber-300' fullWidth variant='default' size='lg'>
            <Link href='/'>카카오 로그인</Link>
          </Button>
        </form>
      </div>
    </div>
  );
}
