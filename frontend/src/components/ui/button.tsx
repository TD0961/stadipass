import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  children: ReactNode;
}

export function Button({ variant = 'default', className = '', children, ...props }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] hover:from-[#00d9ff] hover:to-[#00f5a0] text-white',
    outline: 'border border-[#00f5a0] text-[#00f5a0] hover:bg-[#00f5a0]/10 bg-transparent',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

