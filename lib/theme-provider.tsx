'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem('theme') as Theme
  return stored || 'system'
}

function getAppliedTheme(): 'dark' | 'light' {
  const stored = getStoredTheme()
  if (stored === 'system') return getSystemTheme()
  return stored
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setThemeState(getStoredTheme())
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const appliedTheme = theme === 'system' ? getSystemTheme() : theme

    root.classList.remove('light', 'dark')
    root.classList.add(appliedTheme)

    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

  return { theme, setTheme, effectiveTheme, mounted }
}
