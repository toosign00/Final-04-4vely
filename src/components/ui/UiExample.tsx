'use client';

export default function UiExample() {
  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className='text-status-info text-3xl font-bold'>UI 컴포넌트 예제</h1>

      <div className='mt-6 space-y-3 text-center'>
        <p className='text-neutral-800'>UI 폴더에는 Button, Modal, Input 등 재사용 가능한 UI 컴포넌트들을 제작할 예정입니다.</p>

        <p className='text-neutral-800'>컴포넌트 네이밍 규칙을 준수해주세요! (PascalCase 사용)</p>
      </div>
    </div>
  );
}
