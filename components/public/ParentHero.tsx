'use client'

import Link from 'next/link'
import { ArrowDown, ArrowRight, BookOpenCheck, Compass, Globe2, Sparkles } from 'lucide-react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import { ParentLearningPreview } from '@/components/public/LandingIllustrations'
import { Reveal } from '@/components/public/Reveal'
import { useReducedMotionPreference } from '@/lib/motion'

const tiltSpring = { stiffness: 120, damping: 20, mass: 0.4 }

export function ParentHero() {
  const heroRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotionPreference()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const x = useSpring(pointerX, tiltSpring)
  const y = useSpring(pointerY, tiltSpring)
  const rotateX = useTransform(y, [-8, 8], [3.5, -3.5])
  const rotateY = useTransform(x, [-8, 8], [-3.5, 3.5])
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 28])

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - bounds.left - bounds.width / 2) / bounds.width) * 16)
    pointerY.set(((event.clientY - bounds.top - bounds.height / 2) / bounds.height) * 16)
  }

  function resetTilt() {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <section ref={heroRef} className="parent-hero" aria-labelledby="parent-hero-title">
      <div className="parent-hero-grid" aria-hidden="true" />
      <div className="parent-hero-grain" aria-hidden="true" />
      <motion.div className="parent-hero-orbit parent-hero-orbit-gold" style={{ y: reduceMotion ? 0 : parallaxY }} aria-hidden="true" />
      <div className="parent-hero-layout">
        <div className="parent-hero-copy">
          <Reveal>
            <p className="parent-hero-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> For parents and caregivers</p>
            <h1 id="parent-hero-title" className="parent-hero-title">
              Give every learner a <span>brighter path.</span>
            </h1>
            <p className="parent-hero-description">
              Thoughtful tutoring, a clear learning plan, and the people who care about progress—all in one place, wherever home is.
            </p>
            <div className="parent-hero-actions">
              <Link href="/register" className="public-button public-button-primary">
                Get started as a parent <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/tutors" className="public-button public-button-secondary">
                Explore tutors <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="parent-hero-signals" aria-label="Learning support highlights">
              <span><BookOpenCheck className="size-4" aria-hidden="true" /> A plan shaped around the learner</span>
              <span><Compass className="size-4" aria-hidden="true" /> Room to learn at their pace</span>
              <span><Globe2 className="size-4" aria-hidden="true" /> Online, wherever life happens</span>
            </div>
            <Link href="#how-it-works" className="parent-hero-scroll">
              See how the pieces fit <ArrowDown className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <motion.div
          className="parent-hero-visual"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          style={{
            x,
            y,
            rotateX: reduceMotion ? 0 : rotateX,
            rotateY: reduceMotion ? 0 : rotateY,
            transformPerspective: 1100,
          }}
        >
          <div className="parent-hero-visual-halo" aria-hidden="true" />
          <div className="parent-hero-deco parent-hero-deco-book" aria-hidden="true"><BookOpenCheck className="size-5" /></div>
          <div className="parent-hero-deco parent-hero-deco-spark" aria-hidden="true"><Sparkles className="size-5" /></div>
          <div className="parent-hero-deco parent-hero-deco-orbit" aria-hidden="true"><Globe2 className="size-5" /></div>
          <div className="parent-hero-preview-wrap">
            <ParentLearningPreview />
            <span className="parent-hero-sample-label">Illustrative dashboard · Sample only</span>
          </div>
          <div className="parent-hero-note" aria-hidden="true">
            <span className="parent-hero-note-icon"><Sparkles className="size-4" /></span>
            <span><strong>Small steps belong here.</strong><small>One learner, one next step at a time.</small></span>
          </div>
        </motion.div>
      </div>
      <div className="parent-hero-bottom-line" aria-hidden="true" />
    </section>
  )
}
