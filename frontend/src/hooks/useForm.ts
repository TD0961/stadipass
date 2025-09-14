import { useState, useCallback } from 'react'
import { validateForm } from '@/utils/validation'

export type ValidationSchema = Record<string, Array<(value: any) => string | null>>

export interface UseFormOptions<T> {
  initialValues: T
  validationSchema?: ValidationSchema
  onSubmit: (values: T) => void | Promise<void>
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export interface UseFormReturn<T> {
  values: T
  errors: Record<string, string>
  isValid: boolean
  isSubmitting: boolean
  setValue: (field: keyof T, value: any) => void
  setError: (field: keyof T, error: string) => void
  clearError: (field: keyof T) => void
  setValues: (values: Partial<T>) => void
  reset: () => void
  handleChange: (field: keyof T) => (value: any) => void
  handleBlur: (field: keyof T) => () => void
  handleSubmit: (e?: React.FormEvent) => void | Promise<void>
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = useCallback((valuesToValidate: T) => {
    if (!validationSchema) return { isValid: true, errors: {} }
    return validateForm(valuesToValidate, validationSchema)
  }, [validationSchema])

  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }))
    
    if (validateOnChange) {
      const { errors: newErrors } = validate({ ...values, [field]: value })
      setErrors(prev => ({ ...prev, [field]: newErrors[field as string] || '' }))
    }
  }, [values, validate, validateOnChange])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field as string]
      return newErrors
    })
  }, [])

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }))
  }, [])

  const reset = useCallback(() => {
    setValuesState(initialValues)
    setErrors({})
    setIsSubmitting(false)
  }, [initialValues])

  const handleChange = useCallback((field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setValue(field, value)
  }, [setValue])

  const handleBlur = useCallback((field: keyof T) => () => {
    if (validateOnBlur) {
      const { errors: newErrors } = validate(values)
      setErrors(prev => ({ ...prev, [field]: newErrors[field as string] || '' }))
    }
  }, [values, validate, validateOnBlur])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    const { isValid, errors: validationErrors } = validate(values)
    setErrors(validationErrors)

    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setError,
    clearError,
    setValues,
    reset,
    handleChange,
    handleBlur,
    handleSubmit,
  }
}
