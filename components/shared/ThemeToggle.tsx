'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        aria-label="Switch color theme"
      >
        <Sun className="size-5" aria-hidden="true" />
      </Button>
    )
  }

  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="group text-muted-foreground hover:text-primary"
      title={label}
      aria-label={label}
    >
      {theme === 'dark' ? (
        <Sun className="size-5 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
      ) : (
        <Moon className="size-5 transition-transform duration-300 group-hover:-rotate-12" aria-hidden="true" />
      )}
    </Button>
  )
}
