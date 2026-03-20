'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarouselProps {
  title: string
  icon?: string
  children: React.ReactNode
  className?: string
}

export function Carousel({ title, icon, children, className }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 320
    const newScrollLeft =
      scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
    scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  return (
    <div className={cn('relative carousel-container group', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        <div className="flex gap-2 carousel-arrow">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Left Fade */}
      {canScrollLeft && (
        <div className="absolute left-0 top-10 bottom-0 w-12 bg-gradient-to-r from-primary to-transparent pointer-events-none" />
      )}
      {/* Right Fade */}
      {canScrollRight && (
        <div className="absolute right-0 top-10 bottom-0 w-12 bg-gradient-to-l from-primary to-transparent pointer-events-none" />
      )}
    </div>
  )
}
