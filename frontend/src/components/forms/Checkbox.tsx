import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled'
  size?: 'sm' | 'md' | 'lg'
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = 'default',
      size = 'md',
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }

    const iconSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    }

    const baseClasses = 'rounded border-neutral-300 text-primary-600 focus:ring-primary-500 focus:ring-2'
    const variantClasses = {
      default: 'bg-white',
      filled: 'bg-neutral-50',
    }

    const checkboxClasses = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      error && 'border-error-500 focus:ring-error-500',
      className
    )

    return (
      <div className="space-y-1">
        <div className="flex items-start">
          <div className="relative flex items-center">
            <input
              id={checkboxId}
              ref={ref}
              type="checkbox"
              className={checkboxClasses}
              {...props}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Check className={clsx(
                iconSizeClasses[size],
                'text-white opacity-0 transition-opacity',
                'peer-checked:opacity-100'
              )} />
            </div>
          </div>
          
          {label && (
            <label
              htmlFor={checkboxId}
              className="ml-3 text-sm font-medium text-neutral-700 cursor-pointer"
            >
              {label}
            </label>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-error-600 ml-8" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-neutral-500 ml-8">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
