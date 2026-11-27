'use client'

import Image from 'next/image'
import { Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandHeader({ variant = 'default' }: { variant?: 'default' | 'sidebar' }) {
  const isSidebar = variant === 'sidebar'

  return (
    <div className="flex items-center gap-3">
      {/* Logo Image */}
      <div className="relative flex size-12 items-center justify-center rounded-full overflow-hidden border-2 border-primary bg-foreground">
        <Image
          src="/teachmenest-logo.jpg"
          alt="Teachmenest Logo"
          width={48}
          height={48}
          className="object-cover"
          priority
        />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          <span className={cn(isSidebar ? 'text-sidebar-foreground' : 'text-foreground')}>Teachme</span>
          <span className={cn(isSidebar ? 'text-sidebar-foreground' : 'text-primary')}>nest</span>
        </h1>
        <div className={cn('flex items-center gap-2 text-xs', isSidebar ? 'text-sidebar-foreground' : 'text-muted-foreground')}>
          <span className={cn(isSidebar ? 'text-sidebar-foreground' : 'text-foreground', 'font-medium')}>LEARN</span>
          <span className={cn(isSidebar ? 'text-sidebar-foreground' : 'text-primary')}>•</span>
          <span className={cn(isSidebar ? 'text-sidebar-foreground' : 'text-foreground', 'font-medium')}>GROW</span>
          <span className={cn(isSidebar ? 'text-sidebar-foreground' : 'text-primary')}>•</span>
          <span className={cn(isSidebar ? 'text-sidebar-foreground' : 'text-foreground', 'font-medium')}>THRIVE</span>
        </div>
      </div>
    </div>
  )
}
