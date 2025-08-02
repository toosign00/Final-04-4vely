import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import * as React from 'react';

import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav role='navigation' aria-label='pagination' data-slot='pagination' className={cn('mx-auto flex w-full justify-center', className)} {...props} />;
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot='pagination-content' className={cn('flex flex-row items-center gap-1', className)} {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot='pagination-item' {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'button'>;

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <button
      type='button'
      aria-current={isActive ? 'page' : undefined}
      data-slot='pagination-link'
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? 'primary' : 'default',
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink size='default' className={cn('gap-1 px-2.5 py-2', className)} {...props}>
      <ChevronLeftIcon className='h-4 w-4' />
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink size='default' className={cn('gap-1 px-2.5 py-2', className)} {...props}>
      <ChevronRightIcon className='h-4 w-4' />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span aria-hidden data-slot='pagination-ellipsis' className={cn('flex size-9 items-center justify-center', 'text-muted/60 hover:text-muted transition-colors duration-200', 'cursor-default select-none', className)} {...props}>
      <MoreHorizontalIcon className='size-4 animate-pulse hover:animate-none' />
      <span className='sr-only'>더 많은 페이지</span>
    </span>
  );
}

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };
