'use client'

import { BookOpen, Home, Sprout } from 'lucide-react'

export function BrandHeader() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo Mark */}
      <div className="relative w-12 h-12 rounded-full bg-black border-2 border-brand-gold flex items-center justify-center">
        <div className="relative">
          {/* House outline */}
          <div className="absolute inset-0 border-2 border-brand-gold rounded-sm" />
          {/* Parent figure (white) */}
          <div className="absolute left-1 top-2 w-2 h-3 bg-white rounded-full" />
          {/* Child figure (gold) */}
          <div className="absolute left-3 top-3 w-1.5 h-2 bg-brand-gold rounded-full" />
          {/* Book */}
          <div className="absolute left-1 bottom-1 w-4 h-1 bg-brand-gold rounded-sm" />
          {/* Plant */}
          <Sprout className="absolute -right-2 top-1 w-3 h-3 text-brand-gold" />
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-serif font-bold tracking-tight">
          <span className="text-foreground">Teachme</span>
          <span className="text-brand-gold">nest</span>
        </h1>
        <div className="flex items-center gap-2 text-xs text-brand-goldLight">
          <span className="text-foreground font-medium">LEARN</span>
          <span className="text-brand-gold">•</span>
          <span className="text-foreground font-medium">GROW</span>
          <span className="text-brand-gold">•</span>
          <span className="text-foreground font-medium">THRIVE</span>
        </div>
      </div>
    </div>
  )
}