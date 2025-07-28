/**
 * @fileoverview 에러 상태를 표시하는 컴포넌트
 * @description 북마크 데이터 로딩 실패 시 사용자에게 친절한 에러 메시지를 표시합니다.
 */

interface ErrorDisplayProps {
  title: string;
  message: string;
}

/**
 * @function ErrorDisplay
 * @description 에러 상태를 표시하는 컴포넌트입니다.
 * @param {ErrorDisplayProps} props - 컴포넌트 props.
 * @returns {JSX.Element} 렌더링된 에러 메시지 컴포넌트를 반환합니다.
 */
export default function ErrorDisplay({ title, message }: ErrorDisplayProps) {
  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center'>
      <div className='rounded-full bg-red-100 p-4'>
        <svg className='h-8 w-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
        </svg>
      </div>
      <div className='space-y-2'>
        <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
        <p className='whitespace-pre-line text-gray-600'>{message}</p>
      </div>
    </div>
  );
}
