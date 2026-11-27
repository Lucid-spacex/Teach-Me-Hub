'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { KidsLearningScene } from '@/components/public/LandingIllustrations'
import { GeometricMascot } from '@/components/public/GeometricMascot'
import { WordReveal } from '@/components/public/WordReveal'
import { useReducedMotionPreference } from '@/lib/motion'

export function KidsHero() {
  const reduceMotion = useReducedMotionPreference()

  return (
    <section className="kids-hero kids-story-hero" aria-labelledby="kids-hero-title">
      <div className="kids-hero-grid" aria-hidden="true" />
      <div className="kids-hero-content">
        <div className="kids-hero-copy">
          <p className="kids-eyebrow"><Sparkles aria-hidden="true" /> Made for curious learners</p>
          <h1 id="kids-hero-title" className="kids-hero-title"><WordReveal text="Learning can be a big adventure!" highlight="big adventure!" /></h1>
          <p className="kids-hero-description">Meet a tutor. Ask questions. Try new things.</p>
          <div className="kids-hero-actions">
            <Link href="/student-login" className="public-button public-button-primary kids-action-button">Student login <ArrowRight aria-hidden="true" /></Link>
            <Link href="/register" className="public-button public-button-secondary kids-action-button">Ask a grown-up to sign you up <ArrowRight aria-hidden="true" /></Link>
          </div>
          <p className="kids-hero-safety-note"><ShieldCheck aria-hidden="true" /> A grown-up helps with your account.</p>
        </div>
        <div className="kids-hero-art" aria-hidden="true">
          <span className="kids-hero-orbit kids-hero-orbit-one" />
          <span className="kids-hero-orbit kids-hero-orbit-two" />
          <motion.span className="kids-hero-star kids-hero-star-one" animate={reduceMotion ? { rotate: 0 } : { rotate: [0, 14, -8, 0], y: [0, -7, 0] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}><Sparkles /></motion.span>
          <div className="kids-hero-scene"><KidsLearningScene /></div>
          <div className="kids-mascot-stage"><GeometricMascot /></div>
          <span className="kids-hero-doodle">You can do this!</span>
        </div>
      </div>
      <div className="kids-hero-bottom-note"><span className="kids-hero-bottom-mark" aria-hidden="true" /><p>One question can start something great.</p></div>
    </section>
  )
}
