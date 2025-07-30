'use client';

import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export type ErrorDisplayType = 'error' | 'success' | 'warning';

interface ErrorDisplayProps {
  message?: string;
  type?: ErrorDisplayType;
  className?: string;
  showIcon?: boolean;
}

const typeStyles = {
  error: {
    container: 'text-red-700 bg-red-50 border-red-200',
    icon: 'text-red-600',
    iconComponent: XCircle,
  },
  success: {
    container: 'text-green-700 bg-green-50 border-green-200',
    icon: 'text-green-600',
    iconComponent: CheckCircle2,
  },
  warning: {
    container: 'text-orange-700 bg-orange-50 border-orange-200',
    icon: 'text-orange-600',
    iconComponent: AlertCircle,
  },
};

export default function ErrorDisplay({ message, type = 'error', className = '', showIcon = true }: ErrorDisplayProps) {
  if (!message) return null;

  const styles = typeStyles[type];
  const IconComponent = styles.iconComponent;

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${styles.container} ${className}`} role='alert' aria-live='polite'>
      {showIcon && <IconComponent className={`h-4 w-4 ${styles.icon} flex-shrink-0`} />}
      <span className='flex-1'>{message}</span>
    </div>
  );
}

// 특화된 에러 표시 컴포넌트들
export function ValidationError({ message, className }: { message?: string; className?: string }) {
  return <ErrorDisplay message={message} type='error' className={className} />;
}

export function SuccessMessage({ message, className }: { message?: string; className?: string }) {
  return <ErrorDisplay message={message} type='success' className={className} />;
}

export function WarningMessage({ message, className }: { message?: string; className?: string }) {
  return <ErrorDisplay message={message} type='warning' className={className} />;
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
    <div className={`mt-2 flex min-h-[1.5rem] items-start ${className}`}>
      {error && <ValidationError message={error} />}
      {!error && success && <SuccessMessage message={success} />}
      {!error && !success && warning && <WarningMessage message={warning} />}
    </div>
  );
}
