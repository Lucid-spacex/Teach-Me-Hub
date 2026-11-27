'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp, useReducedMotionPreference } from '@/lib/motion'

type RevealProps = {
  children: ReactNode
  className?: string
}

export function Reveal({ children, className }: RevealProps) {
  const reduceMotion = useReducedMotionPreference()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  )
}
