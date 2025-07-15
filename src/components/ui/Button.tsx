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
        default: 'bg-white text-secondary shadow-sm hover:bg-secondary hover:text-white border border-[0.5px] border-gray-300',
        secondary: 'bg-secondary text-white shadow-sm hover:bg-secondary/80 active:bg-secondary',
        primary: 'bg-primary text-secondary shadow-sm hover:bg-primary/80 active:bg-primary',
        ghost: 'text-secondary hover:bg-surface hover:text-secondary active:bg-surface',
        link: 'text-secondary underline-offset-4 hover:underline',
        destructive: 'bg-error text-white shadow-sm hover:bg-error/90 active:bg-error/80',
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

type BaseVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'link' | 'destructive';

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
