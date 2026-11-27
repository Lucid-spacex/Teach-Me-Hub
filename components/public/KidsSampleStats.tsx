'use client'

import { motion } from 'motion/react'
import { BadgeCheck, Sparkles, Star } from 'lucide-react'
import { Reveal } from '@/components/public/Reveal'
import { useReducedMotionPreference } from '@/lib/motion'

export function KidsSampleStats() {
  const reduceMotion = useReducedMotionPreference()

  return (
    <section className="kids-section kids-sample-stats" aria-labelledby="kids-sample-title">
      <div className="kids-section-inner kids-sample-layout">
        <Reveal><div className="kids-sample-copy"><p className="kids-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> Just an example</p><h2 id="kids-sample-title" className="kids-section-title">Small steps deserve a high-five.</h2><p className="kids-section-intro">This playful progress card is a sample illustration. It isn&apos;t connected to a real student account.</p><div className="kids-sample-badge-row"><span><BadgeCheck className="size-4" aria-hidden="true" /> Sample badge shelf</span><span><Star className="size-4" aria-hidden="true" /> Sample star count</span></div></div></Reveal>
        <div className="kids-sample-card" role="img" aria-label="Sample only: example progress ring, badge count, and practice steps. Not real student data.">
          <div className="kids-sample-card-top"><span>Learning snapshot</span><span className="kids-sample-tag">Sample only</span></div>
          <div className="kids-sample-card-main"><div className="kids-sample-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle className="kids-sample-ring-track" cx="60" cy="60" r="48" pathLength="1" /><motion.circle className="kids-sample-ring-fill" cx="60" cy="60" r="48" pathLength="1" initial={reduceMotion ? { pathLength: 0.68 } : { pathLength: 0 }} whileInView={{ pathLength: 0.68 }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0.15 : 1.1, ease: [0.22, 1, 0.36, 1] }} /></svg><div><strong>68%</strong><span>sample progress</span></div></div><div className="kids-sample-card-stats"><div><span className="kids-sample-stat-icon kids-sample-stat-yellow"><Star className="size-4 fill-current" aria-hidden="true" /></span><span><strong>03</strong><small>sample stars</small></span></div><div><span className="kids-sample-stat-icon kids-sample-stat-mint"><BadgeCheck className="size-4" aria-hidden="true" /></span><span><strong>02</strong><small>sample badges</small></span></div></div></div>
          <div className="kids-sample-card-footer"><span>Practice steps</span><span>Sample · 3 of 5</span></div><div className="kids-sample-progress-track"><motion.span initial={reduceMotion ? { scaleX: 0.6 } : { scaleX: 0 }} whileInView={{ scaleX: 0.6 }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0.15 : 0.8, delay: reduceMotion ? 0 : 0.15 }} /></div>
        </div>
      </div>
    </section>
  )
}
