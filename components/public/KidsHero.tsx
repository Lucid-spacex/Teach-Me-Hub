'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { KidsLearningScene } from '@/components/public/LandingIllustrations'
import { GeometricMascot } from '@/components/public/GeometricMascot'
import { WordReveal } from '@/components/public/WordReveal'
import { Reveal } from '@/components/public/Reveal'
import { useReducedMotionPreference } from '@/lib/motion'

export function KidsHero() {
  const reduceMotion = useReducedMotionPreference()

  return (
    <section className="kids-hero" aria-labelledby="kids-hero-title">
      <div className="kids-hero-grid" aria-hidden="true" />
      <div className="kids-hero-content">
        <Reveal>
          <div className="kids-hero-copy">
            <p className="kids-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> Made for curious learners</p>
            <h1 id="kids-hero-title" className="kids-hero-title"><WordReveal text="Learning can be your next great adventure!" highlight="great adventure!" /></h1>
            <p className="kids-hero-description">Meet a tutor, ask questions, and try new things—one friendly class at a time.</p>
            <div className="kids-grade-tags" aria-label="Learning options">
              <span><BookOpen className="size-4" aria-hidden="true" /> Grades 1–8</span>
              <span><ShieldCheck className="size-4" aria-hidden="true" /> Exam prep</span>
            </div>
            <div className="kids-hero-actions">
              <Link href="/student-login" className="public-button public-button-primary kids-action-button">Student login <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <Link href="/register" className="public-button public-button-secondary kids-action-button">Ask a grown-up to sign you up <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
            <p className="kids-hero-safety-note"><ShieldCheck className="size-4" aria-hidden="true" /> A grown-up helps set up your account.</p>
          </div>
        </Reveal>
        <div className="kids-hero-art">
          <motion.div className="kids-hero-sticker kids-hero-sticker-top" aria-hidden="true" animate={reduceMotion ? { rotate: 0 } : { rotate: [4, 7, 4] }} transition={reduceMotion ? { duration: 0.15 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}>Curiosity counts</motion.div>
          <div className="kids-hero-scene-wrap"><KidsLearningScene /></div>
          <div className="kids-mascot-stage"><GeometricMascot /></div>
          <div className="kids-lesson-preview" aria-label="Sample lesson preview, not a live class">
            <span className="kids-preview-icon"><BookOpen className="size-4" aria-hidden="true" /></span>
            <span><strong>Today&apos;s idea</strong><small>Try, learn, try again</small></span>
            <span className="kids-preview-sample">Sample</span>
          </div>
        </div>
      </div>
      <div className="kids-hero-bottom-note"><span className="kids-hero-bottom-mark" aria-hidden="true" /><p>Every good question is a great place to start.</p></div>
    </section>
  )
}
