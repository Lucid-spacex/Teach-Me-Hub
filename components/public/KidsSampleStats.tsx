'use client'

import { motion } from 'motion/react'
import { BookOpen, Heart, Sparkles, Star } from 'lucide-react'
import { useReducedMotionPreference } from '@/lib/motion'

export function KidsLittleWins() {
  const reduceMotion = useReducedMotionPreference()

  return (
    <section className="kids-section kids-little-wins landing-section" aria-labelledby="kids-wins-title">
      <div className="kids-section-inner kids-wins-layout">
        <div className="kids-wins-copy"><p className="kids-eyebrow">No rush. Just try.</p><h2 id="kids-wins-title" className="kids-section-title">Every little try is a <em className="landing-accent">win.</em></h2><p className="kids-section-intro">Ask a question. Try again. Notice what you know now.</p><span className="kids-wins-note"><Heart aria-hidden="true" /> Your own pace is a good pace.</span></div>
        <div className="kids-wins-scene" role="img" aria-label="A playful group of stars, books, and learning doodles">
          <span className="kids-wins-big-word">GROW</span>
          <motion.span className="kids-wins-star kids-wins-star-one" animate={reduceMotion ? { rotate: 0 } : { rotate: [0, 13, -8, 0], y: [0, -6, 0] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}><Star fill="currentColor" /></motion.span>
          <motion.span className="kids-wins-star kids-wins-star-two" animate={reduceMotion ? { y: 0 } : { y: [0, 7, 0] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 5.1, repeat: Infinity, ease: 'easeInOut' }}><Sparkles /></motion.span>
          <span className="kids-wins-book"><BookOpen /></span>
          <span className="kids-wins-doodle">one step at a time</span>
          <span className="kids-wins-dot kids-wins-dot-one" /><span className="kids-wins-dot kids-wins-dot-two" /><span className="kids-wins-dot kids-wins-dot-three" />
        </div>
      </div>
    </section>
  )
}
