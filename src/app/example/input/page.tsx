'use client';

import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useState } from 'react';

export default function InputExamplePage() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  return (
    <div className='bg-surface min-h-screen space-y-8 p-8'>
      <h1 className='t-h1 mb-10 text-center'>Input 컴포넌트 예시</h1>

      {/* 기본 인풋 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>기본 스타일</h2>
        <div className='flex max-w-md flex-col gap-4'>
          <div>
            <Label htmlFor='basic-input'>기본 인풋</Label>
            <Input id='basic-input' placeholder='기본 인풋' />
          </div>
          <div>
            <Label htmlFor='password-input'>비밀번호 입력</Label>
            <Input id='password-input' placeholder='비밀번호 입력' type='password' />
          </div>
        </div>
      </div>

      {/* 파일 인풋 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>파일 업로드</h2>
        <div className='grid w-full max-w-sm items-center gap-3'>
          <Label htmlFor='picture'>사진 업로드</Label>
          <Input id='picture' type='file' />
        </div>
      </div>

      {/* 컨트롤드 인풋 + 포커스 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>컨트롤드 & 포커스</h2>
        <div className='flex max-w-md flex-col gap-4'>
          <div>
            <Label htmlFor='controlled-input'>컨트롤드 인풋</Label>
            <Input id='controlled-input' placeholder='입력해보세요' value={value} onChange={(e) => setValue(e.target.value)} aria-label='입력 예시' />
            <span className='t-desc text-surface0 block min-h-[1.5em]'>현재 값: {value || '\u00A0'}</span>
          </div>
        </div>
      </div>

      {/* 에러 상태 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>에러 상태</h2>
        <div className='flex max-w-md flex-col gap-4'>
          <div>
            <Label htmlFor='error-input'>이메일</Label>
            <Input
              id='error-input'
              placeholder='이메일을 입력하세요'
              aria-invalid={!!error}
              onBlur={(e) => {
                if (!e.target.value.includes('@')) setError('이메일 형식이 아닙니다');
                else setError('');
              }}
            />
            <span className='t-desc text-error block min-h-[1.5em]'>{error || '\u00A0'}</span>
          </div>
        </div>
      </div>

      {/* 비활성화 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>비활성화</h2>
        <div className='flex max-w-md flex-col gap-4'>
          <div>
            <Label htmlFor='disabled-input'>비활성화 인풋</Label>
            <Input id='disabled-input' placeholder='입력 불가' disabled />
          </div>
        </div>
      </div>

      {/* 전체 너비 */}
      <div className='space-y-4'>
        <h2 className='t-h2'>전체 너비</h2>
        <div>
          <Label htmlFor='fullwidth-input'>전체 너비 인풋</Label>
          <Input id='fullwidth-input' placeholder='전체 너비 인풋' className='w-full max-w-none' />
        </div>
      </div>
    </div>
  );
}
