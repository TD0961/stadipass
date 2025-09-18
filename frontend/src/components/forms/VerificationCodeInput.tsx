import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/validation'

interface VerificationCodeInputProps {
  length?: number
  onComplete: (code: string) => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  length = 6,
  onComplete,
  onError,
  disabled = false,
  className,
  autoFocus = true
}) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''))
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  useEffect(() => {
    const completeCode = code.join('')
    if (completeCode.length === length && !completeCode.includes('')) {
      onComplete(completeCode)
    }
  }, [code, length, onComplete])

  const handleChange = (index: number, value: string) => {
    if (disabled) return

    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1)
    }

    // Only allow digits
    if (!/^\d*$/.test(value)) {
      onError?.('Please enter only numbers')
      return
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Move to next input if value is entered
    if (value && index < length - 1) {
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'Backspace') {
      if (code[index]) {
        // Clear current input
        const newCode = [...code]
        newCode[index] = ''
        setCode(newCode)
      } else if (index > 0) {
        // Move to previous input
        setActiveIndex(index - 1)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData.length === 0) {
      onError?.('Please paste only numbers')
      return
    }

    const newCode = [...code]
    for (let i = 0; i < pastedData.length && i < length; i++) {
      newCode[i] = pastedData[i]
    }
    setCode(newCode)

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, length - 1)
    setActiveIndex(nextIndex)
    inputRefs.current[nextIndex]?.focus()
  }

  const clearCode = () => {
    setCode(new Array(length).fill(''))
    setActiveIndex(0)
    inputRefs.current[0]?.focus()
  }

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="flex space-x-2">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            disabled={disabled}
            className={cn(
              "w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "transition-colors duration-200",
              activeIndex === index
                ? "border-blue-500 bg-blue-50"
                : digit
                ? "border-green-500 bg-green-50"
                : "border-gray-300 bg-white",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>
      
      <button
        type="button"
        onClick={clearCode}
        disabled={disabled}
        className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
      >
        Clear code
      </button>
    </div>
  )
}

