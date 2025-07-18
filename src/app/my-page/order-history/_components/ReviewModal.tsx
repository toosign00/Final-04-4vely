import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import React from 'react';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export default function ReviewModal({ open, onOpenChange, children }: ReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className='sr-only'>리뷰 작성</DialogTitle>
      <DialogContent showCloseButton>{children}</DialogContent>
    </Dialog>
  );
}
