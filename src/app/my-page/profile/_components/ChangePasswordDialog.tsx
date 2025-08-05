'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { changePassword } from '@/lib/actions/mypage/profile/userActions';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    mode: 'onSubmit',
  });

  const watchNewPassword = watch('newPassword');

  const onSubmit = (values: PasswordFormValues) => {
    startTransition(async () => {
      const res = await changePassword(values.currentPassword, values.newPassword);

      if (res.ok) {
        toast.success('비밀번호가 성공적으로 변경되었습니다!');
        reset();
        onClose();
      } else {
        toast.error(res.message || '비밀번호 변경에 실패했습니다.');
      }
    });
  };

  const handleClose = () => {
    reset();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Lock className='size-5' />
            비밀번호 변경
          </DialogTitle>
          <DialogDescription>보안을 위해 현재 비밀번호를 확인한 후 새 비밀번호를 설정해 주세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* 현재 비밀번호 */}
          <div>
            <Label className='text-secondary/70 mb-2'>현재 비밀번호</Label>
            <div className='relative'>
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                className='pr-12'
                {...register('currentPassword', {
                  required: '현재 비밀번호를 입력해 주세요.',
                  minLength: { value: 4, message: '비밀번호는 최소 4자 이상이어야 합니다.' },
                })}
                disabled={isPending}
                placeholder='현재 비밀번호를 입력하세요'
              />
              <Button type='button' variant='ghost' size='icon' className='absolute top-1/2 right-3 h-auto w-auto -translate-y-1/2 p-0 text-gray-400 hover:text-gray-600' onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
              </Button>
            </div>
            <div className='min-h-[1.5rem]'>{errors.currentPassword && <span className='text-error text-sm'>{errors.currentPassword.message}</span>}</div>
          </div>

          {/* 새 비밀번호 */}
          <div>
            <Label className='text-secondary/70 mb-2'>새 비밀번호</Label>
            <div className='relative'>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                className='pr-12'
                {...register('newPassword', {
                  required: '새 비밀번호를 입력해 주세요.',
                  minLength: { value: 4, message: '비밀번호는 최소 4자 이상이어야 합니다.' },
                  pattern: {
                    value: /^(?=.*[a-zA-Z])(?=.*\d)/,
                    message: '비밀번호는 영문과 숫자를 모두 포함해야 합니다.',
                  },
                })}
                disabled={isPending}
                placeholder='새 비밀번호를 입력하세요'
              />
              <Button type='button' variant='ghost' size='icon' className='absolute top-1/2 right-3 h-auto w-auto -translate-y-1/2 p-0 text-gray-400 hover:text-gray-600' onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
              </Button>
            </div>
            <div className='min-h-[1.5rem]'>{errors.newPassword && <span className='text-error text-sm'>{errors.newPassword.message}</span>}</div>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <Label className='text-secondary/70 mb-2'>비밀번호 확인</Label>
            <div className='relative'>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                className='pr-12'
                {...register('confirmPassword', {
                  required: '비밀번호 확인을 입력해 주세요.',
                  validate: (value) => value === watchNewPassword || '비밀번호가 일치하지 않습니다.',
                })}
                disabled={isPending}
                placeholder='새 비밀번호를 다시 입력하세요'
              />
              <Button type='button' variant='ghost' size='icon' className='absolute top-1/2 right-3 h-auto w-auto -translate-y-1/2 p-0 text-gray-400 hover:text-gray-600' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
              </Button>
            </div>
            <div className='min-h-[1.5rem]'>{errors.confirmPassword && <span className='text-error text-sm'>{errors.confirmPassword.message}</span>}</div>
          </div>

          <DialogFooter className='flex-col'>
            <Button type='button' variant='default' onClick={handleClose} disabled={isPending}>
              취소
            </Button>
            <Button type='submit' variant='primary' disabled={isPending}>
              {isPending ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
