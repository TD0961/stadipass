/**
 * Form Textarea Component
 * 
 * IMPORTANCE:
 * - Integrates with react-hook-form
 * - Shows validation errors
 * - Consistent form styling
 * - Used for multi-line inputs
 */

import { useFormContext } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import type { TextareaHTMLAttributes } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  error?: string;
}

export function FormTextarea({ name, label, error, className = '', ...props }: FormTextareaProps) {
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
      <Textarea
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

