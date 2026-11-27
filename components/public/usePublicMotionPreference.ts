'use client'

import { useEffect, useState } from 'react'
import { useReducedMotionPreference } from '@/lib/motion'

export function usePublicMotionPreference() {
  const reduceMotion = useReducedMotionPreference()
  const [compactViewport, setCompactViewport] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setCompactViewport(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduceMotion || compactViewport
}
