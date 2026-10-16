'use client'

import { Sprout } from 'lucide-react'

export function BrandHeader() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo Mark */}
      <div className="relative flex size-12 items-center justify-center rounded-full border-2 border-primary bg-foreground">
        <div className="relative">
          {/* House outline */}
          <div className="absolute inset-0 rounded-sm border-2 border-primary" />
          {/* Parent figure (white) */}
          <div className="absolute left-1 top-2 h-3 w-2 rounded-full bg-background" />
          {/* Child figure (gold) */}
          <div className="absolute left-3 top-3 h-2 w-1.5 rounded-full bg-primary" />
          {/* Book */}
          <div className="absolute bottom-1 left-1 h-1 w-4 rounded-sm bg-primary" />
          {/* Plant */}
          <Sprout className="absolute -right-2 top-1 size-3 text-primary" />
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          <span className="text-foreground">Teachme</span>
          <span className="text-primary">nest</span>
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-foreground font-medium">LEARN</span>
          <span className="text-primary">•</span>
          <span className="text-foreground font-medium">GROW</span>
          <span className="text-primary">•</span>
          <span className="text-foreground font-medium">THRIVE</span>
        </div>
      </div>
    </div>
  )
}
