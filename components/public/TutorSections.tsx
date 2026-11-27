'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Check, FileText, Globe2, HeartHandshake, MessagesSquare, ShieldCheck, Sparkles, Users, WalletCards } from 'lucide-react'
import { useReducedMotionPreference } from '@/lib/motion'

const benefits = [
  { title: 'A thoughtful match', copy: 'Your subjects and experience help guide the match.', icon: Users },
  { title: 'Pay handled monthly', copy: 'An admin sets pay after approval. No rate is promised here.', icon: WalletCards },
  { title: 'Room for your routine', copy: 'Share when you are available and plan around your week.', icon: Sparkles },
  { title: 'Support when you need it', copy: 'Reach the team through your tutor account.', icon: MessagesSquare },
  { title: 'Tools for teaching', copy: 'Set practice, score work, and prepare grades for review.', icon: FileText },
  { title: 'A considered review', copy: 'The team reviews applications before approval and matching.', icon: ShieldCheck },
]

const applicationSteps = [
  { title: 'Register', copy: 'Create your tutor account.' },
  { title: 'Verify email', copy: 'Confirm the email address on your account.' },
  { title: 'Complete application', copy: 'Share your experience and teaching subjects.' },
  { title: 'Upload documents', copy: 'Add the documents requested in your application.' },
  { title: 'Admin review', copy: 'The team reviews your application.' },
  { title: 'Get matched', copy: 'Approved tutors may be considered for a learner match.' },
]

const vettingSteps = [
  { title: 'You share your experience', copy: 'Tell us what you teach and how you work with learners.' },
  { title: 'Documents are reviewed', copy: 'Submit the items requested in your application.' },
  { title: 'An admin checks your application', copy: 'The team reviews your details before approval.' },
  { title: 'Matching can begin', copy: 'Approved tutors may be considered when a learner is a fit.' },
]

const faqItems = [
  { question: 'How is tutor pay decided?', answer: 'Pay is set by an admin after approval and handled monthly. No hourly rate or amount is promised here.' },
  { question: 'Can I change my pay after approval?', answer: 'Only an admin can change approved tutor pay. Raise questions with the team through your tutor account.' },
  { question: 'How do tutor matches work?', answer: 'The team considers the subjects and experience in your profile alongside learner needs.' },
  { question: 'Which documents will I need?', answer: 'Your application will list the documents currently requested. Check the instructions in your tutor account.' },
  { question: 'Can I change my availability?', answer: 'You can share your availability and coordinate session times with the team.' },
]

function ApplicationNode({ index, title, copy, onActive }: { index: number; title: string; copy: string; onActive: (index: number) => void }) {
  const ref = useRef<HTMLLIElement>(null)
  const active = useInView(ref, { margin: '-30% 0px -45% 0px', amount: 0.2 })

  useEffect(() => { if (active) onActive(index) }, [active, index, onActive])

  return (
    <li ref={ref} className="tutor-application-step" aria-current={active ? 'step' : undefined}>
      <span className="tutor-application-node">0{index + 1}</span>
      <div><h3>{title}</h3><p>{copy}</p></div>
    </li>
  )
}

export function TutorBenefits() {
  return (
    <section className="tutor-section tutor-benefits landing-section" aria-labelledby="tutor-benefits-title">
      <div className="tutor-section-inner">
        <div className="landing-section-heading"><p className="tutor-eyebrow landing-eyebrow">Good teaching deserves support</p><h2 id="tutor-benefits-title" className="landing-section-title">Make space for the work you <em className="landing-accent">love.</em></h2><p className="landing-section-copy">A steady process can help you focus on the learner in front of you.</p></div>
        <ol className="tutor-benefit-list">{benefits.map(({ title, copy, icon: Icon }, index) => <li key={title} className="tutor-benefit-item"><span className="tutor-benefit-number">0{index + 1}</span><span className="tutor-benefit-icon"><Icon aria-hidden="true" /></span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
      </div>
    </section>
  )
}

export function TutorApplicationSteps() {
  const [activeStep, setActiveStep] = useState(0)
  const current = applicationSteps[activeStep]
  const reduceMotion = useReducedMotionPreference()

  return (
    <section id="tutor-application" className="tutor-section tutor-application landing-section" aria-labelledby="tutor-application-title">
      <div className="tutor-section-inner">
        <div className="landing-section-heading"><p className="tutor-eyebrow landing-eyebrow">Your application, step by step</p><h2 id="tutor-application-title" className="landing-section-title">A clear route from hello to <em className="landing-accent">matched.</em></h2><p className="landing-section-copy">Six steps. A real review. No guessing what comes next.</p></div>
        <div className="tutor-journey-layout">
          <aside className="tutor-journey-marker" aria-live="polite"><span className="tutor-journey-marker-label">You are here</span><strong>0{activeStep + 1} · {current.title}</strong><p>You always know what happens next.</p><span className="tutor-journey-marker-track"><motion.span animate={{ scaleY: (activeStep + 1) / applicationSteps.length }} transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }} /></span></aside>
          <ol className="tutor-application-list" aria-label="Tutor application steps">{applicationSteps.map((step, index) => <ApplicationNode key={step.title} {...step} index={index} onActive={setActiveStep} />)}</ol>
        </div>
      </div>
    </section>
  )
}

const requirements = ['Your documents', 'A quiet space', 'A reliable connection']

export function TutorRequirements() {
  const reduceMotion = useReducedMotionPreference()
  return (
    <section id="requirements" className="tutor-section tutor-requirements landing-section" aria-labelledby="tutor-requirements-title">
      <div className="tutor-section-inner tutor-requirements-layout">
        <div><p className="tutor-eyebrow landing-eyebrow">What you’ll need</p><h2 id="tutor-requirements-title" className="landing-section-title">Bring the basics. We’ll explain the <em className="landing-accent">rest.</em></h2><p className="landing-section-copy">Your application will show which documents are needed for review.</p><ul className="tutor-requirements-list">{requirements.map((item, index) => <motion.li key={item} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: reduceMotion ? 0.15 : 0.35, delay: reduceMotion ? 0 : index * 0.15 }}><span className="tutor-requirement-check"><Check aria-hidden="true" /></span><span>{item}</span></motion.li>)}</ul></div>
        <div className="tutor-requirements-art" aria-hidden="true"><span className="tutor-requirements-sun" /><span className="tutor-requirements-paper"><FileText /></span><span className="tutor-requirements-book"><span /><span /><span /></span><span className="tutor-requirements-note">Ready when you are.</span></div>
      </div>
    </section>
  )
}

export function TutorTrust() {
  return (
    <section className="tutor-section tutor-trust landing-section" aria-labelledby="tutor-trust-title">
      <div className="tutor-section-inner">
        <div className="landing-section-heading"><p className="tutor-eyebrow landing-eyebrow">Care on both sides</p><h2 id="tutor-trust-title" className="landing-section-title">Learners deserve care. So do <em className="landing-accent">tutors.</em></h2><p className="landing-section-copy">Review helps set clear expectations before anyone is matched.</p></div>
        <div className="tutor-trust-grid">{vettingSteps.map(({ title, copy }, index) => <article className="tutor-trust-step" key={title}><span className="tutor-trust-number">0{index + 1}</span><span className="tutor-trust-connector" aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </div>
    </section>
  )
}

export function TutorFaq() {
  return (
    <section id="tutor-faq" className="tutor-section tutor-faq landing-section" aria-labelledby="tutor-faq-title">
      <div className="tutor-section-inner tutor-faq-layout">
        <div><p className="tutor-eyebrow landing-eyebrow">Before you apply</p><h2 id="tutor-faq-title" className="landing-section-title">Good questions deserve <em className="landing-accent">straight answers.</em></h2><p className="landing-section-copy">Pay, review, matching, and documents—explained plainly.</p><Link href="/tutor/register" className="public-text-link">Open the application <ArrowRight aria-hidden="true" /></Link></div>
        <div className="tutor-faq-list">{faqItems.map((item) => <details className="tutor-faq-item" key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
      </div>
    </section>
  )
}

export function TutorClosing() {
  return (
    <section className="tutor-closing landing-closing" aria-labelledby="tutor-closing-title">
      <div className="tutor-closing-inner"><p className="tutor-eyebrow landing-eyebrow"><HeartHandshake aria-hidden="true" /> Your next chapter</p><h2 id="tutor-closing-title" className="landing-closing-title">Let your teaching reach <em className="landing-accent">further.</em></h2><p className="landing-closing-copy">Apply when you’re ready. The team will guide you through the review.</p><div className="tutor-hero-actions landing-hero-actions"><Link href="/tutor/register" className="public-button public-button-primary">Apply now <ArrowRight aria-hidden="true" /></Link><Link href="/tutor/login" className="public-button public-button-secondary">Tutor login <ArrowRight aria-hidden="true" /></Link></div><small className="landing-privacy-note"><Globe2 aria-hidden="true" /> Your application details stay private.</small></div>
    </section>
  )
}
