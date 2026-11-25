'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { fadeUp, reducedDialogVariants, useReducedMotionPreference } from '@/lib/motion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotionPreference()

  return (
    <motion.div
      key={pathname}
      initial="hidden"
      animate="visible"
      variants={prefersReducedMotion ? reducedDialogVariants : fadeUp}
      className="min-w-0"
    >
      {children}
    </motion.div>
  )
}
