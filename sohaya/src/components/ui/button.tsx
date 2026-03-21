'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold' | 'green'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-accent to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-accent/30 glow-red',
  secondary:
    'bg-[#222] text-white border border-[rgba(255,255,255,0.12)] hover:bg-[#2a2a2a] hover:border-[rgba(255,255,255,0.2)]',
  ghost:
    'bg-transparent text-text-secondary hover:text-white hover:bg-white/5',
  outline:
    'bg-transparent text-white border border-[rgba(255,255,255,0.3)] hover:bg-white/5 hover:border-white/50',
  gold:
    'bg-gradient-to-r from-accent-gold to-yellow-500 text-black font-semibold hover:from-yellow-400 hover:to-yellow-600',
  green:
    'bg-gradient-to-r from-accent-green to-green-600 text-white hover:from-green-500 hover:to-green-700 shadow-lg hover:shadow-accent-green/30',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
  xl: 'h-14 px-8 text-lg rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
