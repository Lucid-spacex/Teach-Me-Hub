'use client'

import Link from 'next/link'
import { ArrowRight, Check, Globe2, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { FamilyLearningScene } from '@/components/public/LandingIllustrations'
import { WordReveal } from '@/components/public/WordReveal'
import { usePublicMotionPreference } from '@/components/public/usePublicMotionPreference'

const trustPoints = ['Vetted tutors', 'Secure payments', 'Progress you can see']

export function ParentHero() {
  const reduceMotion = usePublicMotionPreference()

  return (
    <section className="parent-hero story-hero" aria-labelledby="parent-hero-title">
      <div className="story-hero-grain" aria-hidden="true" />
      <div className="story-hero-glow story-hero-glow-one" aria-hidden="true" />
      <div className="story-hero-glow story-hero-glow-two" aria-hidden="true" />
      <div className="story-hero-layout parent-hero-layout">
        <div className="story-hero-copy">
          <p className="landing-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> For families, wherever you call home</p>
          <h1 id="parent-hero-title" className="landing-hero-title"><WordReveal text="A tutor who makes hard things feel possible." highlight="possible." /></h1>
          <p className="landing-hero-description">Live lessons, patient tutors, and a clearer view of how your child is growing.</p>
          <div className="landing-hero-actions">
            <Link href="/register" className="public-button public-button-primary">Get started <ArrowRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/student-login" className="public-button public-button-secondary">Student login <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <ul className="landing-trust-list" aria-label="Family learning support">
            {trustPoints.map((point) => <li key={point}><Check className="size-4" aria-hidden="true" />{point}</li>)}
          </ul>
          <p className="landing-privacy-note"><Globe2 className="size-4" aria-hidden="true" /> A family account keeps your child&apos;s details private.</p>
        </div>
        <div className="parent-hero-art" aria-hidden="true">
          <span className="parent-hero-art-sun" />
          <span className="parent-hero-art-scribble">Aha!</span>
          <motion.span className="parent-hero-art-star" animate={reduceMotion ? { rotate: 0 } : { rotate: [0, 14, -8, 0], y: [0, -8, 0] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}><Sparkles /></motion.span>
          <motion.div className="parent-family-scene" animate={reduceMotion ? { y: 0 } : { y: [0, -5, 0] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <FamilyLearningScene />
          </motion.div>
          <span className="parent-hero-art-caption">A little help changes the whole week.</span>
        </div>
      </div>
      <div className="landing-hero-bottom"><span>Good questions belong here.</span><span aria-hidden="true">↓</span></div>
    </section>
  )
}
