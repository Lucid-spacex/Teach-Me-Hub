'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { usePublicMotionPreference } from '@/components/public/usePublicMotionPreference'

const benefits = [
  { title: 'Structured onboarding', copy: 'Move through registration, email verification, document upload, and administrator review.' },
  { title: 'Ongoing match opportunities', copy: 'Learner matches are considered when needs align with your subjects and availability.' },
  { title: 'Monthly pay, set by an administrator', copy: 'Payment terms are confirmed by an administrator after your application is approved.' },
  { title: 'Support through the process', copy: 'Reach the team through your tutor account when you need guidance.' },
]

const applicationSteps = [
  { title: 'Register', copy: 'Create your tutor account with your professional details.' },
  { title: 'Verify your email', copy: 'Confirm the email address linked to your account.' },
  { title: 'Complete your application', copy: 'Share your experience, subjects, and availability.' },
  { title: 'Upload requested documents', copy: 'Provide the documents listed in your application.' },
  { title: 'Administrator review', copy: 'The team reviews your application before approval.' },
  { title: 'Consideration for a match', copy: 'Approved tutors may be considered when a learner is a suitable fit.' },
]

function ApplicationNode({ index, title, copy, onActive }: { index: number; title: string; copy: string; onActive: (index: number) => void }) {
  const ref = useRef<HTMLLIElement>(null)
  const active = useInView(ref, { margin: '-30% 0px -45% 0px', amount: 0.2 })

  useEffect(() => { if (active) onActive(index) }, [active, index, onActive])

  return (
    <li ref={ref} className="adult-application-step" aria-current={active ? 'step' : undefined}>
      <span className="adult-application-number">0{index + 1}</span>
      <div><h3>{title}</h3><p>{copy}</p></div>
    </li>
  )
}

export function TutorBenefits() {
  return (
    <section id="tutor-benefits" className="adult-section adult-tutor-benefits" aria-labelledby="tutor-benefits-title">
      <div className="adult-section-inner">
        <div className="adult-section-heading">
          <p className="adult-eyebrow">A professional teaching opportunity</p>
          <h2 id="tutor-benefits-title">Build your practice with <em className="adult-accent">support.</em></h2>
          <p className="adult-section-copy">Clear expectations, thoughtful matching, and practical support for your work.</p>
        </div>
        <ol className="adult-benefit-list">
          {benefits.map((benefit, index) => (
            <li key={benefit.title}>
              <span className="adult-list-number">0{index + 1}</span>
              <div><h3>{benefit.title}</h3><p>{benefit.copy}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function TutorApplicationSteps() {
  const [activeStep, setActiveStep] = useState(0)
  const current = applicationSteps[activeStep]
  const reduceMotion = usePublicMotionPreference()

  return (
    <section id="tutor-application" className="adult-section adult-application" aria-labelledby="tutor-application-title">
      <div className="adult-section-inner">
        <div className="adult-section-heading">
          <p className="adult-eyebrow">The application process</p>
          <h2 id="tutor-application-title">A clear route through your <em className="adult-accent">application.</em></h2>
          <p className="adult-section-copy">Six practical stages, with an administrator reviewing your application before approval.</p>
        </div>
        <div className="adult-application-layout">
          <aside className="adult-application-marker" aria-live="polite" aria-atomic="true">
            <span className="adult-eyebrow">You are here</span>
            <strong>0{activeStep + 1} · {current.title}</strong>
            <p>Each stage is explained before you continue.</p>
            <span className="adult-application-track" aria-hidden="true"><motion.span animate={{ scaleY: (activeStep + 1) / applicationSteps.length }} transition={reduceMotion ? { duration: 0.15 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }} /></span>
          </aside>
          <ol className="adult-application-list" aria-label="Tutor application stages">
            {applicationSteps.map((step, index) => <ApplicationNode key={step.title} {...step} index={index} onActive={setActiveStep} />)}
          </ol>
        </div>
      </div>
    </section>
  )
}

const supportPoints = [
  { title: 'Onboarding', copy: 'Your application and account guide you through each requested stage.' },
  { title: 'Matching', copy: 'Subjects, learner needs, and availability inform match consideration.' },
  { title: 'Monthly pay', copy: 'An administrator sets payment terms after approval.' },
  { title: 'Support', copy: 'Use your tutor account to reach the team with questions.' },
]

export function TutorSupport() {
  return (
    <section id="tutor-support" className="adult-section adult-tutor-support" aria-labelledby="tutor-support-title">
      <div className="adult-section-inner adult-tutor-support-layout">
        <div>
          <p className="adult-eyebrow">A clear working relationship</p>
          <h2 id="tutor-support-title">Know what to expect from the <em className="adult-accent">start.</em></h2>
          <p className="adult-section-copy">The important details are handled directly and explained before you begin.</p>
        </div>
        <ol className="adult-support-list">
          {supportPoints.map((point, index) => <li key={point.title}><span className="adult-list-number">0{index + 1}</span><div><h3>{point.title}</h3><p>{point.copy}</p></div></li>)}
        </ol>
      </div>
    </section>
  )
}

const trustItems = [
  { title: 'Application review', copy: 'An administrator reviews your application before approval.' },
  { title: 'Document review', copy: 'The requested documents are listed in your application and reviewed by the team.' },
  { title: 'Grade review', copy: 'Grades submitted by tutors are reviewed by an administrator before families see them.' },
  { title: 'Payment clarity', copy: 'Monthly pay is set by an administrator after approval.' },
]

export function TutorTrust() {
  return (
    <section className="adult-section adult-tutor-trust" aria-labelledby="tutor-trust-title">
      <div className="adult-section-inner adult-tutor-trust-layout">
        <div>
          <p className="adult-eyebrow">A considered process</p>
          <h2 id="tutor-trust-title">Clear standards, at every <em className="adult-accent">stage.</em></h2>
          <p className="adult-section-copy">Review and communication help tutors and families understand what happens next.</p>
        </div>
        <ol className="adult-tutor-trust-list">
          {trustItems.map((item, index) => <li key={item.title}><span className="adult-list-number">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.copy}</p></div></li>)}
        </ol>
      </div>
    </section>
  )
}

const faqItems = [
  { question: 'How is tutor pay decided?', answer: 'An administrator sets payment terms after approval. Pay is handled monthly; no amount is promised on this page.' },
  { question: 'How are tutor matches considered?', answer: 'The team considers learner needs alongside your subjects and availability. A match is not guaranteed.' },
  { question: 'Which documents should I upload?', answer: 'Your application lists the documents currently requested. Follow the instructions in your tutor account.' },
  { question: 'Where can I get support?', answer: 'Contact the team through your tutor account during the application and teaching process.' },
]

export function TutorFaq() {
  return (
    <section id="tutor-faq" className="adult-section adult-tutor-faq" aria-labelledby="tutor-faq-title">
      <div className="adult-section-inner adult-faq-layout">
        <div className="adult-faq-intro">
          <p className="adult-eyebrow">Before you apply</p>
          <h2 id="tutor-faq-title">Good questions deserve direct <em className="adult-accent">answers.</em></h2>
          <p className="adult-section-copy">Review the process, matching, and monthly pay before you begin.</p>
          <Link href="/tutor/register" className="adult-text-link">Open the application <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="adult-faq-list">
          {faqItems.map((item) => (
            <details className="adult-faq-item" key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TutorClosing() {
  return (
    <section className="adult-closing adult-tutor-closing" aria-labelledby="tutor-closing-title">
      <div className="adult-closing-inner">
        <p className="adult-eyebrow">Your next step</p>
        <h2 id="tutor-closing-title">Bring your teaching to more <em className="adult-accent">learners.</em></h2>
        <p>Apply when you are ready. The team will guide you through the review.</p>
        <div className="adult-actions">
          <Link href="/tutor/register" className="public-button public-button-primary">Start your application <ArrowRight aria-hidden="true" /></Link>
          <Link href="/tutor/login" className="public-button public-button-secondary">Tutor login</Link>
        </div>
        <small>Your application information is used for review and matching.</small>
      </div>
    </section>
  )
}
