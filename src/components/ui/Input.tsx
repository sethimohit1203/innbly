import { forwardRef, useId } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  hint?: string
  containerClassName?: string
}

/** Shared text input primitive — 56px height, 16px radius, consistent focus
 * ring, inline label/error/success states. Same idea as Button.tsx: additive,
 * migrate call sites incrementally rather than a blind find-replace. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, containerClassName, label, error, success, hint, id, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="text-input-label mb-1.5 block text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-14 w-full rounded-control border border-slate-300 bg-white px-4 text-body text-slate-900 outline-none transition-all duration-200 ease-smooth placeholder:text-slate-400',
            'focus:border-primary-500 focus:ring-4 focus:ring-primary-100',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-100',
            success && 'border-accent-400 focus:border-accent-500 focus:ring-accent-100',
            (error || success) && 'pr-11',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && <AlertCircle className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-500" />}
        {success && !error && <CheckCircle2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-accent-500" />}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-caption mt-1.5 font-medium text-rose-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-caption mt-1.5 text-slate-400">
          {hint}
        </p>
      )}
    </div>
  )
})
