'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] text-white placeholder-text-muted rounded-xl px-4 py-3 text-sm transition-all duration-200',
              'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50',
              'hover:border-[rgba(255,255,255,0.2)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] text-white placeholder-text-muted rounded-xl px-4 py-3 text-sm transition-all duration-200',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50',
            'hover:border-[rgba(255,255,255,0.2)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-none',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
