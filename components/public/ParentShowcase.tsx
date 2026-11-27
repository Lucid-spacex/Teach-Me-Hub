'use client'

import { CalendarDays, Check, CreditCard, Sparkles, Video, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Reveal } from '@/components/public/Reveal'
import { usePublicMotionPreference } from '@/components/public/usePublicMotionPreference'

type Feature = {
  title: string
  description: string
  icon: LucideIcon
  number: string
  kind: string
  span: 'wide' | 'small' | 'tall'
}

const features: Feature[] = [
  { title: 'A real tutor, in a live class', description: 'Meet face to face on Google Meet and work through the lesson together.', icon: Video, number: '01', kind: 'lesson', span: 'wide' },
  { title: 'Practice that fits between classes', description: 'Short quizzes and assignments help ideas stick.', icon: Sparkles, number: '02', kind: 'practice', span: 'small' },
  { title: 'Grades reviewed with care', description: 'An admin reviews each grade before it reaches your family.', icon: Check, number: '03', kind: 'review', span: 'small' },
  { title: 'Payments with a clear record', description: 'Pay in NGN or USD through Paystack and keep the receipt.', icon: CreditCard, number: '04', kind: 'payment', span: 'small' },
  { title: 'Times that fit real life', description: 'Plan classes around family routines and time zones.', icon: CalendarDays, number: '05', kind: 'time', span: 'small' },
  { title: 'One family view', description: 'Keep class details, progress, and payment records together.', icon: Sparkles, number: '06', kind: 'family', span: 'tall' },
]

function FeatureArtwork({ feature, index }: { feature: Feature; index: number }) {
  const reduceMotion = usePublicMotionPreference()
  const Icon = feature.icon
  return (
    <div className={`parent-feature-art parent-feature-art-${feature.kind}`} aria-hidden="true">
      <motion.span className="parent-feature-art-orbit" animate={reduceMotion ? { rotate: 0 } : { rotate: index % 2 ? -360 : 360 }} transition={reduceMotion ? { duration: 0.15 } : { duration: 36 + index * 2, repeat: Infinity, ease: 'linear' }} />
      <span className="parent-feature-art-shape parent-feature-art-shape-one" />
      <span className="parent-feature-art-shape parent-feature-art-shape-two" />
      <span className="parent-feature-art-icon"><Icon /></span>
      <span className="parent-feature-art-spark"><Sparkles /></span>
    </div>
  )
}

export function ParentFeatureBento() {
  return (
    <section id="features" className="parent-section parent-bento-section landing-section" aria-labelledby="parent-bento-title">
      <div className="parent-section-inner">
        <Reveal><div className="landing-section-heading parent-bento-heading"><div><p className="landing-eyebrow">Support around the lesson</p><h2 id="parent-bento-title" className="landing-section-title">The small things that help learning <em className="landing-accent">stick.</em></h2><p className="landing-section-copy">Clear support for families, before, during, and after class.</p></div><span className="parent-bento-side-note">Made to work together<br />without getting in the way.</span></div></Reveal>
        <div className="parent-bento-grid">{features.map((feature, index) => <article key={feature.title} className={`parent-bento-card parent-bento-card-${feature.span} parent-bento-card-${feature.kind}`}><span className="parent-bento-number">{feature.number}</span><FeatureArtwork feature={feature} index={index} /><div className="parent-bento-copy"><h3>{feature.title}</h3><p>{feature.description}</p></div></article>)}</div>
      </div>
    </section>
  )
}
