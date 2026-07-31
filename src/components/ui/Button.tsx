import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Shared button primitive — every variant/size/state (hover, focus,
 * loading, disabled) lives here once instead of being hand-rolled per
 * call site, so a button looks and behaves the same everywhere it's used.
 * Migrate call sites incrementally; this file is additive and doesn't
 * change any existing raw <button> until it's swapped over. */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white shadow-card hover:bg-primary-700 hover:shadow-card-hover focus-visible:ring-primary-400',
        secondary: 'bg-accent-500 text-white shadow-card hover:bg-accent-600 hover:shadow-card-hover focus-visible:ring-accent-400',
        outline: 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-300',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300',
        danger: 'bg-rose-600 text-white shadow-card hover:bg-rose-700 hover:shadow-card-hover focus-visible:ring-rose-400',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-14 px-7 text-[15px]',
        icon: 'h-11 w-11 shrink-0 rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading, disabled, children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})
