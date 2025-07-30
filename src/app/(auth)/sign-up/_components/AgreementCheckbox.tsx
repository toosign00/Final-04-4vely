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
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Checkbox id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
          <label htmlFor={id} className={`cursor-pointer text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {required && <span className='text-red-500'>* </span>}
            {label}
          </label>
        </div>
        {onViewDetails && (
          <Button type='button' variant='ghost' size='sm' onClick={onViewDetails} disabled={disabled} className='text-xs text-gray-500 hover:text-gray-700'>
            내용보기
          </Button>
        )}
      </div>
      {error && <p className='ml-6 text-sm text-red-600'>{error}</p>}
    </div>
  );
}
