import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'live' | 'verified' | 'founder' | 'featured' | 'default' | 'success' | 'warning'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  live: 'bg-accent-green/20 text-accent-green border border-accent-green/40',
  verified: 'bg-accent-gold/20 text-accent-gold border border-accent-gold/40',
  founder: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
  featured: 'bg-accent/20 text-accent border border-accent/40',
  default: 'bg-white/10 text-text-secondary border border-white/10',
  success: 'bg-green-500/20 text-green-300 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {variant === 'live' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-green" />
        </span>
      )}
      {children}
    </span>
  )
}
