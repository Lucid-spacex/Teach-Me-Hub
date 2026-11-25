import { GraduationCap, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({
  className,
  size = 'md',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'size-5',
    md: 'size-8',
    lg: 'size-11',
    xl: 'size-16',
  }

  const spinner = (
    <span className={cn('relative inline-grid place-items-center', sizeClasses[size], className)} aria-hidden="true">
      <Loader2 className="absolute inset-0 size-full animate-spin text-primary/35" strokeWidth={1.5} />
      <GraduationCap className="relative size-1/2 text-primary" strokeWidth={2.25} />
    </span>
  )

  const content = (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite" aria-label={text || 'Loading'}>
      {spinner}
      {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
        <div className="rounded-3xl border border-border/70 bg-card px-8 py-7 shadow-[var(--shadow-soft)]">
          {content}
        </div>
      </div>
    )
  }

  return content
}
