'use client'

import { useMotionValue, useSpring, useTransform, motion } from 'motion/react'
import type { PointerEvent } from 'react'
import { useReducedMotionPreference } from '@/lib/motion'

const spring = { stiffness: 120, damping: 20, mass: 0.8 }

export function GeometricMascot() {
  const reduceMotion = useReducedMotionPreference()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, spring)
  const smoothY = useSpring(pointerY, spring)
  const eyeX = useTransform(smoothX, [-1, 1], [-3, 3])
  const eyeY = useTransform(smoothY, [-1, 1], [-2, 2])

  function trackPointer(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2)
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2)
  }

  function resetPointer() {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <motion.div className="kids-mascot" role="img" aria-label="A friendly geometric learning mascot waving hello" onPointerMove={trackPointer} onPointerLeave={resetPointer} animate={reduceMotion ? { y: 0 } : { y: [0, -7, 0] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}>
      <span className="kids-mascot-spark kids-mascot-spark-one" aria-hidden="true" />
      <span className="kids-mascot-spark kids-mascot-spark-two" aria-hidden="true" />
      <motion.span className="kids-mascot-arm" aria-hidden="true" animate={reduceMotion ? { rotate: 0 } : { rotate: [0, 11, -8, 12, 0] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 1.4, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut' }} />
      <div className="kids-mascot-head">
        <div className="kids-mascot-eyes" aria-hidden="true">
          {[0, 1].map((eye) => <motion.span key={eye} className="kids-mascot-eye" style={{ x: eyeX, y: eyeY }} animate={reduceMotion ? { scaleY: 1 } : { scaleY: [1, 1, 0.12, 1, 1] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 3.8, repeat: Infinity, repeatDelay: 1.2, delay: eye * 0.05 }}><span /></motion.span>)}
        </div>
        <span className="kids-mascot-smile" aria-hidden="true" />
        <span className="kids-mascot-cheek kids-mascot-cheek-left" aria-hidden="true" />
        <span className="kids-mascot-cheek kids-mascot-cheek-right" aria-hidden="true" />
      </div>
      <div className="kids-mascot-body" aria-hidden="true"><span className="kids-mascot-body-mark" /></div>
      <span className="kids-mascot-foot kids-mascot-foot-left" aria-hidden="true" />
      <span className="kids-mascot-foot kids-mascot-foot-right" aria-hidden="true" />
    </motion.div>
  )
}
