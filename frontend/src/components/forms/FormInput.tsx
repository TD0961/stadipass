/**
 * Form Input Component
 * 
 * IMPORTANCE:
 * - Integrates with react-hook-form
 * - Shows validation errors
 * - Consistent form styling
 * - Type-safe form handling
 * - Used in all forms throughout the app
 */

import { useFormContext } from 'react-hook-form';
import { Input } from '../ui/input';
import type { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  error?: string;
}

export function FormInput({ name, label, error, className = '', ...props }: FormInputProps) {
  const { register, formState } = useFormContext();
  const fieldError = error || formState.errors[name]?.message as string;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <Input
        id={name}
        {...register(name)}
        {...props}
        className={`${fieldError ? 'border-red-500/50 focus:ring-red-500' : ''} ${className}`}
        aria-invalid={fieldError ? 'true' : 'false'}
        aria-describedby={fieldError ? `${name}-error` : undefined}
      />
      {fieldError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-400" role="alert">
          {fieldError}
        </p>
      )}
    </div>
  );
}

