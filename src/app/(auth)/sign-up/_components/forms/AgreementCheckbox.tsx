import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';

interface AgreementCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onViewDetails?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function AgreementCheckbox({ id, label, checked, onChange, onViewDetails, error, disabled, required = false, className }: AgreementCheckboxProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* 모바일 우선: 세로 레이아웃, 큰 화면에서는 가로 레이아웃 */}
      <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
        <div className='flex items-start space-x-2'>
          <Checkbox id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} className='mt-0.5 flex-shrink-0' />
          <label htmlFor={id} className={`cursor-pointer text-sm leading-relaxed ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {required && <span className='text-red-500'>* </span>}
            {label}
          </label>
        </div>
        {onViewDetails && (
          <Button type='button' variant='ghost' size='sm' onClick={onViewDetails} disabled={disabled} className='self-start text-xs text-gray-500 hover:text-gray-700 sm:ml-4 sm:flex-shrink-0 sm:self-center'>
            내용보기
          </Button>
        )}
      </div>
      {error && <p className='ml-6 text-sm text-red-600'>{error}</p>}
    </div>
  );
}
