'use client';

export type ErrorDisplayType = 'error' | 'success' | 'warning';

interface ErrorDisplayProps {
  message?: string;
  type?: ErrorDisplayType;
  className?: string;
}

export default function ErrorDisplay({ message, type = 'error', className = '' }: ErrorDisplayProps) {
  if (!message) return null;

  let colorClass = '';
  switch (type) {
    case 'success':
      colorClass = 'text-green-500';
      break;
    case 'warning':
      colorClass = 'text-yellow-500';
      break;
    case 'error':
    default:
      colorClass = 'text-red-500';
      break;
  }

  return (
    <div className={`text-sm ${colorClass} ${className}`} role='alert' aria-live='polite'>
      <span className='flex-1'>{message}</span>
    </div>
  );
}

// 특화된 에러 표시 컴포넌트들
export function ValidationError({ message, className }: { message?: string; className?: string }) {
  return <ErrorDisplay message={message} className={className} />;
}

export function SuccessMessage({ message, className }: { message?: string; className?: string }) {
  return <ErrorDisplay message={message} className={className} />;
}

export function WarningMessage({ message, className }: { message?: string; className?: string }) {
  return <ErrorDisplay message={message} className={className} />;
}

// 입력 필드 전용 에러 표시
interface FieldErrorProps {
  error?: string;
  success?: string;
  warning?: string;
  className?: string;
}

export function FieldError({ error, success, warning, className = '' }: FieldErrorProps) {
  return (
    <div className={`min-h-[1.5 rem] mt-2 flex items-start ${className}`}>
      {error && <ValidationError message={error} />}
      {!error && success && <SuccessMessage message={success} />}
      {!error && !success && warning && <WarningMessage message={warning} />}
    </div>
  );
}
