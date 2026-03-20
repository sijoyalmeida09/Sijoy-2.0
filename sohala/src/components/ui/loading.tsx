import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-5 w-5 border-2 border-white/20 border-t-accent rounded-full animate-spin',
        className
      )}
    />
  )
}

export function ArtistCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
      <div className="aspect-video skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-3 skeleton rounded-lg w-1/2" />
        <div className="flex justify-between">
          <div className="h-3 skeleton rounded-lg w-1/3" />
          <div className="h-3 skeleton rounded-lg w-1/4" />
        </div>
      </div>
    </div>
  )
}

export function CarouselSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 skeleton rounded-lg w-48" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-64">
            <ArtistCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl font-bold gradient-text-red">Sohala</div>
        <Spinner className="h-8 w-8" />
        <p className="text-text-muted text-sm">Loading your celebration...</p>
      </div>
    </div>
  )
}

export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="think-dot h-2 w-2 rounded-full bg-accent" />
      <span className="think-dot h-2 w-2 rounded-full bg-accent" />
      <span className="think-dot h-2 w-2 rounded-full bg-accent" />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-primary">
      <div className="h-64 skeleton" />
      <div className="max-w-6xl mx-auto px-4 -mt-16 space-y-6">
        <div className="flex gap-4 items-end">
          <div className="h-32 w-32 skeleton rounded-full" />
          <div className="space-y-2 pb-4">
            <div className="h-8 skeleton rounded-lg w-48" />
            <div className="h-4 skeleton rounded-lg w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
