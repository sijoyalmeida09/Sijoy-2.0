import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export function RatingStars({
  rating,
  count,
  size = 'sm',
  showCount = true,
  className,
}: RatingStarsProps) {
  const starSize = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' }[size]
  const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[size]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= Math.round(rating)
                ? 'text-accent-gold fill-accent-gold'
                : 'text-text-muted fill-transparent'
            )}
          />
        ))}
      </div>
      <span className={cn('font-semibold text-accent-gold', textSize)}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={cn('text-text-muted', textSize)}>({count})</span>
      )}
    </div>
  )
}
