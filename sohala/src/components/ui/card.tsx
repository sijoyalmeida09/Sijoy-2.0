'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glow?: 'red' | 'green' | 'gold' | 'none'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, glow = 'none', children, ...props }, ref) => {
    const glowClasses = {
      red: 'hover:shadow-accent/20 hover:shadow-lg',
      green: 'hover:shadow-accent-green/20 hover:shadow-lg',
      gold: 'hover:shadow-accent-gold/20 hover:shadow-lg',
      none: '',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-card rounded-2xl border border-[rgba(255,255,255,0.06)] transition-all duration-300',
          hover && 'hover:bg-card-hover hover:border-[rgba(255,255,255,0.12)] cursor-pointer',
          glowClasses[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pb-4', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 pb-6', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-[rgba(255,255,255,0.06)]', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'
