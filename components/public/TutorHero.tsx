'use client'

import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { TutorLivingRoomScene } from '@/components/public/LandingIllustrations'
import { WordReveal } from '@/components/public/WordReveal'
import { useReducedMotionPreference } from '@/lib/motion'

export function TutorHero() {
  const reduceMotion = useReducedMotionPreference()

  return (
    <section className="tutor-hero tutor-story-hero" aria-labelledby="tutor-hero-title">
      <div className="tutor-hero-grid" aria-hidden="true" />
      <div className="tutor-hero-layout">
        <div className="tutor-hero-copy">
          <p className="landing-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> For tutors and educators</p>
          <h1 id="tutor-hero-title" className="landing-hero-title"><WordReveal text="Bring your way of teaching to a wider world." highlight="wider world." /></h1>
          <p className="landing-hero-description">Teach from home, set the times that suit you, and help learners take their next step.</p>
          <div className="tutor-hero-actions landing-hero-actions">
            <Link href="/tutor/register" className="public-button public-button-primary">Apply now <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/tutor/login" className="public-button public-button-secondary">Tutor login <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <p className="tutor-hero-note"><Check className="size-4" aria-hidden="true" /> A clear review process, one step at a time.</p>
        </div>
        <div className="tutor-hero-art" aria-hidden="true">
          <span className="tutor-hero-art-sun" />
          <span className="tutor-hero-art-note">Good work travels.</span>
          <motion.div className="tutor-hero-scene" animate={reduceMotion ? { y: 0 } : { y: [0, -5, 0] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}><TutorLivingRoomScene /></motion.div>
          <span className="tutor-hero-art-caption">A lesson can begin right where you are.</span>
        </div>
      </div>
    </section>
  )
}
