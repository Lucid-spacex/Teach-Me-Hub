'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, FileCheck2, HeartHandshake, MessagesSquare, ShieldCheck, Sparkles, Users, WalletCards } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { Reveal } from '@/components/public/Reveal'
import { useReducedMotionPreference } from '@/lib/motion'

const benefits = [
  { title: 'Learner matching', copy: 'Connect your subject strengths with learners looking for that kind of support.', icon: Users },
  { title: 'Monthly pay', copy: 'Pay is set by an admin after approval and handled on a monthly schedule.', icon: WalletCards },
  { title: 'Flexible availability', copy: 'Share the times that work for your teaching routine.', icon: Sparkles },
  { title: 'Admin support', copy: 'Reach the team through the platform when you need a hand.', icon: MessagesSquare },
  { title: 'Tools for good teaching', copy: 'Plan lessons, give assignments, score work, and prepare grades.', icon: FileCheck2 },
  { title: 'A safety-first process', copy: 'Applications are reviewed before tutors are approved and matched.', icon: ShieldCheck },
]

const applicationSteps = [
  { title: 'Register', copy: 'Create your tutor account and begin the application.' },
  { title: 'Verify email', copy: 'Confirm the email address for your account.' },
  { title: 'Complete application', copy: 'Tell the team about your experience and teaching areas.' },
  { title: 'Upload documents', copy: 'Provide the documents requested for review.' },
  { title: 'Admin review', copy: 'The team reviews the application before approval.' },
  { title: 'Get matched', copy: 'Approved tutors can be considered for suitable learners.' },
]

const requirements = [
  'Strong knowledge in the subject areas you want to teach',
  'Clear communication and a patient, adaptable approach',
  'A reliable internet connection for online sessions',
  'Willingness to complete the application and requested document review',
  'A commitment to professional, learner-first teaching',
]

const vettingSteps = [
  { title: 'Application details', copy: 'Share your teaching background and subject experience.' },
  { title: 'Document review', copy: 'Submit the materials requested in the application process.' },
  { title: 'Admin assessment', copy: 'The admin team reviews your information before approval.' },
  { title: 'Matching', copy: 'Approved tutors may be matched with learners who fit their subjects.' },
]

const faqItems = [
  { question: 'How is tutor pay decided?', answer: 'Pay is set by an admin after approval and is paid monthly. The platform does not promise a particular amount or rate.' },
  { question: 'Can I change my pay after approval?', answer: 'Only an admin can change approved tutor pay. Please discuss compensation with the team during the application process.' },
  { question: 'How does matching work?', answer: 'The team considers the subjects and expertise listed in your profile alongside learner needs and availability.' },
  { question: 'Which documents do I need?', answer: 'The application will show the documents currently requested for review. Requirements can vary, so follow the instructions shown in your tutor account.' },
  { question: 'How flexible is the schedule?', answer: 'You can share your availability and use the schedule tools to plan sessions. Times should always be checked in the timezone shown.' },
  { question: 'What happens after I apply?', answer: 'An admin reviews the application before approval. Approved tutors can then be considered for learner matching.' },
]

function ApplicationNode({ index, title, copy, onActive }: { index: number; title: string; copy: string; onActive: (index: number) => void }) {
  const ref = useRef<HTMLLIElement>(null)
  const active = useInView(ref, { margin: '-30% 0px -45% 0px', amount: 0.2 })

  useEffect(() => {
    if (active) onActive(index)
  }, [active, index, onActive])

  return (
    <li ref={ref} className="tutor-application-step">
      <span className="tutor-application-node" aria-current={active ? 'step' : undefined}>0{index + 1}</span>
      <div><h3>{title}</h3><p>{copy}</p></div>
    </li>
  )
}

export function TutorBenefits() {
  return (
    <section className="tutor-section tutor-benefits" aria-labelledby="tutor-benefits-title">
      <div className="tutor-section-inner">
        <Reveal><div className="tutor-section-heading"><p className="tutor-eyebrow">A good teaching day, supported</p><h2 id="tutor-benefits-title" className="tutor-section-title">Build your practice around the work you love.</h2><p className="tutor-section-intro">Clear tools and a reliable process help you keep your attention on learners.</p></div></Reveal>
        <div className="tutor-benefit-grid">
          {benefits.map(({ title, copy, icon: Icon }, index) => (
            <Reveal key={title}><article className="tutor-benefit-card"><span className="tutor-benefit-number">0{index + 1}</span><span className="tutor-benefit-icon"><Icon className="size-5" aria-hidden="true" /></span><h3>{title}</h3><p>{copy}</p></article></Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TutorApplicationSteps() {
  const [activeStep, setActiveStep] = useState(0)
  const reduceMotion = useReducedMotionPreference()
  const progress = ((activeStep + 1) / applicationSteps.length) * 100

  return (
    <section id="tutor-application" className="tutor-section tutor-application" aria-labelledby="tutor-application-title">
      <div className="tutor-section-inner">
        <Reveal><div className="tutor-section-heading"><p className="tutor-eyebrow">A considered process</p><h2 id="tutor-application-title" className="tutor-section-title">A clear path from application to matching.</h2><p className="tutor-section-intro">Each step helps the team understand how you teach and what support you need.</p></div></Reveal>
        <div className="tutor-application-rail" style={{ '--tutor-progress': `${progress}%` } as CSSProperties}>
          <svg className="tutor-application-svg tutor-application-svg-wide" viewBox="0 0 1000 170" preserveAspectRatio="none" aria-hidden="true"><motion.path d="M38 98 C135 98 115 52 205 52 S282 114 370 114 S455 53 540 53 S625 112 705 112 S800 51 870 51 S930 86 962 86" initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: '-10%' }} transition={reduceMotion ? { duration: 0.15 } : { duration: 1.2, ease: [0.22, 1, 0.36, 1] }} /></svg>
          <svg className="tutor-application-svg tutor-application-svg-tall" viewBox="0 0 80 600" preserveAspectRatio="none" aria-hidden="true"><motion.path d="M38 20 C38 90 44 90 44 160 S32 230 32 300 S47 370 47 440 S38 510 38 580" initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: '-10%' }} transition={reduceMotion ? { duration: 0.15 } : { duration: 1.2, ease: [0.22, 1, 0.36, 1] }} /></svg>
          <ol className="tutor-application-list" aria-label="Tutor application steps">
            {applicationSteps.map((step, index) => <ApplicationNode key={step.title} {...step} index={index} onActive={setActiveStep} />)}
          </ol>
        </div>
        <div className="tutor-application-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      </div>
    </section>
  )
}

export function TutorRequirements() {
  const reduceMotion = useReducedMotionPreference()
  return (
    <section id="requirements" className="tutor-section tutor-requirements" aria-labelledby="tutor-requirements-title">
      <div className="tutor-section-inner tutor-requirements-layout">
        <Reveal><div><p className="tutor-eyebrow">What helps you thrive here</p><h2 id="tutor-requirements-title" className="tutor-section-title">Good teaching begins with care and preparation.</h2><p className="tutor-section-intro">Bring your subject knowledge, a patient approach, and a willingness to work through the review process.</p><ul className="tutor-requirements-list">{requirements.map((item, index) => <motion.li key={item} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: reduceMotion ? 0.15 : 0.35, delay: reduceMotion ? 0 : index * 0.15 }}><span className="tutor-requirement-check"><motion.svg viewBox="0 0 20 20" aria-hidden="true"><motion.path d="m4 10 4 4 8-9" initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: reduceMotion ? 0.15 : 0.32, delay: reduceMotion ? 0 : index * 0.15 }} /></motion.svg></span><span>{item}</span></motion.li>)}</ul></div></Reveal>
        <div className="tutor-document-stack" role="img" aria-label="Illustration of sample tutor application documents">
          <div className="tutor-document tutor-document-back"><span>SUBJECT NOTES</span><i /><i /><i /></div>
          <div className="tutor-document tutor-document-front"><span className="tutor-document-icon"><FileCheck2 className="size-5" aria-hidden="true" /></span><span className="tutor-document-kicker">TUTOR APPLICATION</span><strong>Experience &amp; expertise</strong><small>Sample document stack</small><div className="tutor-document-lines"><i /><i /><i /></div><span className="tutor-document-stamp"><Check className="size-4" aria-hidden="true" /> For review</span></div>
          <div className="tutor-document-star" aria-hidden="true"><HeartHandshake className="size-6" /></div>
        </div>
      </div>
    </section>
  )
}

export function TutorTrust() {
  return (
    <section className="tutor-section tutor-trust" aria-labelledby="tutor-trust-title">
      <div className="tutor-section-inner">
        <Reveal><div className="tutor-section-heading"><p className="tutor-eyebrow">Careful by design</p><h2 id="tutor-trust-title" className="tutor-section-title">Teaching well starts with trust.</h2></div></Reveal>
        <div className="tutor-trust-grid">
          {vettingSteps.map(({ title, copy }, index) => <Reveal key={title}><article className="tutor-trust-step"><span className="tutor-trust-number">0{index + 1}</span><span className="tutor-trust-connector" aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article></Reveal>)}
        </div>
      </div>
    </section>
  )
}

export function TutorFaq() {
  return (
    <section id="tutor-faq" className="tutor-section tutor-faq" aria-labelledby="tutor-faq-title">
      <div className="tutor-section-inner tutor-faq-layout">
        <Reveal><div><p className="tutor-eyebrow">Good questions matter</p><h2 id="tutor-faq-title" className="tutor-section-title">A few details before you apply.</h2><p className="tutor-section-intro">Compensation, review, and matching are handled through the application and tutor account.</p><Link href="/tutor/register" className="public-text-link">Open the tutor application <ArrowRight className="size-4" aria-hidden="true" /></Link></div></Reveal>
        <div className="tutor-faq-list">{faqItems.map((item) => <details className="tutor-faq-item" key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
      </div>
    </section>
  )
}

export function TutorClosing() {
  return (
    <section className="tutor-closing" aria-labelledby="tutor-closing-title">
      <div className="tutor-closing-inner"><p className="tutor-eyebrow">Your next chapter can start here</p><h2 id="tutor-closing-title">Bring your way of teaching to the world.</h2><p>Share your experience, complete the review, and see whether TeachMeNest is the right fit for your practice.</p><div className="tutor-hero-actions tutor-closing-actions"><Link href="/tutor/register" className="public-button public-button-primary">Apply now <ArrowRight className="size-4" aria-hidden="true" /></Link><Link href="/tutor/login" className="public-button public-button-secondary">Tutor login <ArrowRight className="size-4" aria-hidden="true" /></Link></div></div>
    </section>
  )
}
