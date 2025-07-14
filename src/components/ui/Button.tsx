import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-neutral-900 shadow-sm hover:bg-primary-500/90 active:bg-primary-600',
        secondary: 'bg-secondary-500 text-neutral-inverse shadow-sm hover:bg-secondary-500/90 active:bg-secondary-600',
        accent: 'bg-accent-500 text-neutral-900 shadow-sm hover:bg-accent-500/90 active:bg-accent-600',
        ghost: 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 active:bg-neutral-300',
        link: 'text-neutral-900 underline-offset-4 hover:underline hover:text-neutral-900/90',
        outline: 'border border-border-default bg-neutral-50 text-neutral-900 shadow-sm hover:bg-neutral-200 hover:border-border-strong active:bg-neutral-300',
        destructive: 'bg-error text-neutral-inverse shadow-sm hover:bg-error/90 active:bg-error/80 focus-visible:ring-error/20',
        warning: 'bg-warning text-neutral-900 shadow-sm hover:bg-warning/90 active:bg-warning/80',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'cursor-not-allowed pointer-events-none opacity-75',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      loading: false,
    },
  },
);

type BaseVariant = 'default' | 'secondary' | 'accent' | 'ghost' | 'link' | 'outline' | 'destructive' | 'warning';

interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  variant?: BaseVariant;
  loadingText?: string;
  asChild?: boolean;
}

function Button({ className, variant = 'default', size, fullWidth, loading = false, loadingText, asChild = false, children, disabled, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  const content = loading ? (
    <>
      <LoaderCircle className='animate-spin' />
      {loadingText || '로딩 중...'}
    </>
  ) : (
    children
  );

  return (
    <Comp data-slot='button' className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))} disabled={loading || disabled} aria-busy={loading || undefined} data-loading={loading || undefined} {...props}>
      {content}
    </Comp>
  );
}

export { Button, buttonVariants };
