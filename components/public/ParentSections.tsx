'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useAnimationControls, useInView, useMotionValue } from 'motion/react'
import { ArrowRight, BookOpen, Check, ChevronDown, Globe2, Heart, LockKeyhole, Sparkles, Users } from 'lucide-react'
import { WordReveal } from '@/components/public/WordReveal'
import { Reveal } from '@/components/public/Reveal'
import { usePublicMotionPreference } from '@/components/public/usePublicMotionPreference'

const subjects = ['Reading & writing', 'Mathematics', 'Science', 'Languages', 'Coding', 'Exam preparation', 'Study skills', 'Creative projects']

function SubjectMarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const controls = useAnimationControls()
  const reduceMotion = usePublicMotionPreference()
  const [distance, setDistance] = useState(0)
  const [paused, setPaused] = useState(false)
  const x = useMotionValue(0)
  const initialized = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => setDistance(track.scrollWidth / 2)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reduceMotion || distance === 0) {
      controls.stop()
      x.set(0)
      initialized.current = false
      return
    }
    if (!initialized.current) {
      x.set(reverse ? -distance : 0)
      initialized.current = true
    }
    if (paused) {
      controls.stop()
      return
    }
    const end = reverse ? 0 : -distance
    const current = x.get()
    controls.start({ x: [current, end], transition: { duration: Math.max(1, 34 * Math.abs(end - current) / distance), repeat: Infinity, ease: 'linear' } })
  }, [controls, distance, paused, reduceMotion, reverse, x])

  function pause() { setPaused(true) }
  function resume() { setPaused(false) }

  return (
    <div className="parent-subject-marquee-window" tabIndex={0} role="group" aria-label={`Subject examples moving ${reverse ? 'right' : 'left'}; focus to pause`} onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) resume() }}>
      <motion.div ref={trackRef} className="parent-subject-marquee-track" style={{ x }} animate={controls}>
        {[...subjects, ...subjects].map((subject, index) => <span key={`${subject}-${index}`} className="parent-subject-marquee-chip" aria-hidden={index >= subjects.length}><Sparkles className="size-3.5" aria-hidden="true" />{subject}</span>)}
      </motion.div>
    </div>
  )
}

export function ParentSubjectMarquee() {
  return <section className="parent-subject-marquee" aria-label="Learning subjects"><SubjectMarqueeRow /><SubjectMarqueeRow reverse /></section>
}

const storySteps = [
  { title: 'Sign up as a parent', copy: 'Start with the adult who will guide your child’s learning.', icon: Users, art: 'parent' },
  { title: 'Add your child', copy: 'Share their name and grade to shape a learner profile.', icon: Heart, art: 'child' },
  { title: 'Choose subjects and times', copy: 'Pick learning goals and times that suit your family.', icon: Globe2, art: 'world' },
  { title: 'Meet the tutor', copy: 'Join your first live class together and take it from there.', icon: BookOpen, art: 'book' },
]

function StoryPanel({ step, index, onEnter }: { step: typeof storySteps[number]; index: number; onEnter: (index: number) => void }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { amount: 0.18, margin: '-10% 0px -25% 0px' })
  const reduceMotion = usePublicMotionPreference()
  const Icon = step.icon

  useEffect(() => { if (inView) onEnter(index) }, [inView, index, onEnter])

  return (
    <motion.article ref={ref} className={`parent-story-panel parent-story-panel-${step.art}`} aria-current={inView ? 'step' : undefined} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: reduceMotion ? 0.15 : 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <span className="parent-story-panel-number">0{index + 1}</span>
      <div className="parent-story-panel-copy"><p className="landing-eyebrow">{step.title}</p><h3>{step.copy}</h3></div>
      <div className="parent-story-art" aria-hidden="true"><span className="parent-story-art-orbit" /><span className="parent-story-art-icon"><Icon /></span><span className="parent-story-art-dot parent-story-art-dot-one" /><span className="parent-story-art-dot parent-story-art-dot-two" /><span className="parent-story-art-doodle">{index === 0 ? 'hello' : index === 1 ? 'grow' : index === 2 ? 'your time' : 'let’s begin'}</span></div>
    </motion.article>
  )
}

export function ParentApproach() {
  const [activeStep, setActiveStep] = useState(0)
  const active = storySteps[activeStep]

  return (
    <section id="how-it-works" className="parent-section parent-approach landing-section" aria-labelledby="parent-approach-title">
      <div className="parent-section-inner parent-approach-layout">
        <div className="parent-approach-sticky">
          <p className="landing-eyebrow">The first class, made clear</p>
          <h2 id="parent-approach-title" className="landing-section-title">A simple path to a good <em className="landing-accent">start.</em></h2>
          <p className="landing-section-copy">Four steps take your family from sign-up to the first lesson.</p>
          <div className="parent-approach-progress" aria-live="polite"><span className="parent-approach-progress-track" /><motion.span className="parent-approach-progress-fill" animate={{ scaleY: (activeStep + 1) / storySteps.length }} transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }} /><span className="parent-approach-progress-label"><strong>You are here</strong><b>0{activeStep + 1} · {active.title}</b><small>You always know what happens next.</small></span></div>
        </div>
        <div className="parent-approach-panels">{storySteps.map((step, index) => <StoryPanel key={step.title} step={step} index={index} onEnter={setActiveStep} />)}</div>
      </div>
    </section>
  )
}

const safetyItems = [
  { title: 'Tutors are reviewed', copy: 'Every tutor goes through an application review before matching.', icon: Check },
  { title: 'You stay in the loop', copy: 'Parents can see class details and reviewed learning updates.', icon: Users },
  { title: 'Your child’s details stay private', copy: 'A parent manages the account and the student sign-in details.', icon: LockKeyhole },
  { title: 'Payments have a paper trail', copy: 'Paystack supports NGN and USD payments with receipts.', icon: Heart },
]

export function ParentSafety() {
  return (
    <section className="parent-section parent-safety landing-section" aria-labelledby="parent-safety-title">
      <div className="parent-section-inner parent-safety-layout">
        <div className="parent-safety-heading"><p className="landing-eyebrow">Safety is not a footnote</p><h2 id="parent-safety-title" className="landing-section-title">You stay close. Your child learns with <em className="landing-accent">care.</em></h2><p className="landing-section-copy">Adults guide the account. Tutors and grades go through review.</p></div>
        <div className="parent-safety-list">{safetyItems.map(({ title, copy, icon: Icon }, index) => <article className="parent-safety-item" key={title}><span className="parent-safety-index">0{index + 1}</span><span className="parent-safety-icon"><Icon aria-hidden="true" /></span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
      </div>
    </section>
  )
}

const placeholderStories = [
  { label: 'Family story', tone: 'story-gold' },
  { label: 'Learner story', tone: 'story-sage' },
  { label: 'Tutor story', tone: 'story-coral' },
]

function StoryMarquee({ reverse = false }: { reverse?: boolean }) {
  const reduceMotion = usePublicMotionPreference()
  const items = [...placeholderStories, ...placeholderStories]
  return <div className="parent-story-marquee-window" aria-label="Placeholder stories; no testimonials have been published"><motion.div className="parent-story-marquee-track" aria-hidden="true" animate={reduceMotion ? { x: 0 } : { x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }} transition={reduceMotion ? { duration: 0.15 } : { duration: reverse ? 38 : 34, repeat: Infinity, ease: 'linear' }}>{items.map((story, index) => <div key={`${story.label}-${index}`} className={`parent-story-marquee-card ${story.tone}`}><span>[Placeholder] · {story.label}</span><p>A real story can go here when someone is ready to share it.</p></div>)}</motion.div></div>
}

export function ParentStories() {
  return <section className="parent-section parent-stories landing-section" aria-labelledby="parent-stories-title"><div className="parent-section-inner"><div className="parent-section-heading"><p className="landing-eyebrow">Real voices, when ready</p><h2 id="parent-stories-title" className="landing-section-title">No borrowed praise. Just room for <em className="landing-accent">real stories.</em></h2><p className="landing-section-copy">These marked placeholders will stay until families choose to share.</p></div><div className="parent-story-marquees"><StoryMarquee /><StoryMarquee reverse /></div></div></section>
}

const faqItems = [
  { question: 'Is it safe for my child?', answer: 'A parent or caregiver manages the student account. Tutor applications are reviewed, and an admin reviews every grade before parents see it.' },
  { question: 'Will my child enjoy the lessons?', answer: 'Classes are live and tutor-led. Your child can ask questions, try examples, and learn at a steady pace.' },
  { question: 'Will I see progress?', answer: 'Parents can view learning updates and grades after an admin has reviewed them.' },
  { question: 'Can we change class times?', answer: 'Families and tutors can coordinate schedules. Ask through your account if a time needs to change.' },
  { question: 'How do payments work?', answer: 'Paystack supports payments in NGN or USD. Your family account keeps the payment receipt.' },
]

export function ParentFaq() {
  return <section id="faq" className="parent-section parent-faq landing-section" aria-labelledby="parent-faq-title"><div className="parent-section-inner parent-faq-layout"><div className="parent-faq-intro"><p className="landing-eyebrow">A few honest answers</p><h2 id="parent-faq-title" className="landing-section-title">The things you want to <em className="landing-accent">know.</em></h2><p className="landing-section-copy">Clear answers, before you make a choice.</p><Link href="/register" className="public-text-link">Start a family account <ArrowRight className="size-4" aria-hidden="true" /></Link></div><div className="parent-faq-list">{faqItems.map((item) => <details className="parent-faq-item" key={item.question}><summary>{item.question}<span aria-hidden="true"><ChevronDown className="size-4" /></span></summary><div className="parent-faq-answer"><div><p>{item.answer}</p></div></div></details>)}</div></div></section>
}

export function ParentTeasers() {
  return <section className="parent-section parent-teasers landing-section" aria-label="Explore other TeachMeNest pages"><div className="parent-section-inner parent-teaser-grid"><Link href="/kids" className="parent-teaser-card parent-teaser-kids"><span className="parent-teaser-icon"><Sparkles aria-hidden="true" /></span><span><small>For kids</small><strong>See learning through their eyes.</strong></span><ArrowRight className="parent-teaser-arrow" aria-hidden="true" /></Link><Link href="/tutors" className="parent-teaser-card parent-teaser-tutors"><span className="parent-teaser-icon"><BookOpen aria-hidden="true" /></span><span><small>For tutors</small><strong>Bring your teaching to more learners.</strong></span><ArrowRight className="parent-teaser-arrow" aria-hidden="true" /></Link></div></section>
}

export function ParentClosingCta() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = usePublicMotionPreference()

  return <section ref={sectionRef} className="parent-closing landing-closing" aria-labelledby="parent-closing-title"><span className="parent-closing-wordmark" aria-hidden="true">TeachMeNest</span><div className="parent-closing-content"><p className="landing-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> A calmer next step</p><h2 id="parent-closing-title" className="landing-closing-title">Make room for a better learning <em className="landing-accent">rhythm.</em></h2><p className="landing-closing-copy">Start with your family. Take the next step when it feels right.</p><Link href="/register" className="public-button public-button-primary">Get started <ArrowRight className="size-4" aria-hidden="true" /></Link><small className="landing-privacy-note">Your family details stay private.</small></div></section>
}
