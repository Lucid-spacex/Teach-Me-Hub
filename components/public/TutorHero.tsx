'use client'

import Link from 'next/link'
import { ArrowRight, Check, Clock3, GraduationCap, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Reveal } from '@/components/public/Reveal'
import { WordReveal } from '@/components/public/WordReveal'
import { useReducedMotionPreference } from '@/lib/motion'

const sampleClasses = [
  { time: '9:00 AM', zone: 'Europe/London', subject: 'Mathematics', note: 'Sample lesson' },
  { time: '11:30 AM', zone: 'Africa/Lagos', subject: 'Reading', note: 'Sample lesson' },
  { time: '4:00 PM', zone: 'America/New_York', subject: 'Science', note: 'Sample lesson' },
]

export function TutorHero() {
  const reduceMotion = useReducedMotionPreference()

  return (
    <section className="tutor-hero" aria-labelledby="tutor-hero-title">
      <div className="tutor-hero-grid" aria-hidden="true" />
      <div className="tutor-hero-layout">
        <div className="tutor-hero-copy">
          <Reveal>
            <p className="tutor-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> For tutors and educators</p>
            <h1 id="tutor-hero-title" className="tutor-hero-title"><WordReveal text="Teach the world from wherever you are" highlight="wherever you are" /></h1>
            <p className="tutor-hero-description">Bring your teaching to learners beyond your neighborhood. Shape a thoughtful online practice with flexible scheduling and the tools to guide each next step.</p>
            <div className="tutor-hero-actions">
              <Link href="/tutor/register" className="public-button public-button-primary">Apply now <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <Link href="/tutor/login" className="public-button public-button-secondary">Tutor login <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
            <div className="tutor-hero-note"><Check className="size-4" aria-hidden="true" /> Application, review, then tutor matching</div>
          </Reveal>
        </div>

        <div className="tutor-hero-art" aria-label="Illustrative teaching day, sample schedule">
          <div className="tutor-hero-art-halo" aria-hidden="true" />
          <div className="tutor-day-card">
            <div className="tutor-day-card-header"><span><Clock3 className="size-4" aria-hidden="true" /> A teaching day</span><span className="tutor-sample-badge">Sample</span></div>
            <div className="tutor-day-timeline">
              {sampleClasses.map((item, index) => (
                <div className="tutor-day-row" key={item.subject}>
                  <div className="tutor-day-time"><strong>{item.time}</strong><small>{item.zone}</small></div>
                  <div className="tutor-day-marker-column"><span className={index === 1 ? 'tutor-day-marker is-current' : 'tutor-day-marker'}>{index === 1 && !reduceMotion ? <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} /> : null}</span><span className="tutor-day-line" /></div>
                  <div className="tutor-day-class"><span className="tutor-day-class-subject">{item.subject}</span><span className="tutor-day-class-note">{item.note}</span></div>
                </div>
              ))}
            </div>
            <div className="tutor-day-footer">Example times shown in each listed timezone.</div>
          </div>
          <div className="tutor-homework-card">
            <span className="tutor-homework-icon"><GraduationCap className="size-5" aria-hidden="true" /></span>
            <span className="tutor-homework-label">Homework 3</span><strong>8/10</strong><small>Sample score</small>
          </div>
          <div className="tutor-grade-toast"><span><Check className="size-4" aria-hidden="true" /></span><div><strong>Grade sent to admin</strong><small>Sample review flow</small></div></div>
        </div>
      </div>
      <div className="tutor-hero-rule" aria-hidden="true" />
    </section>
  )
}
