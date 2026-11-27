'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Check, Compass, Globe2, Heart, Lightbulb, LockKeyhole, MessageCircle, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { Reveal } from '@/components/public/Reveal'
import { useReducedMotionPreference } from '@/lib/motion'

const classSteps = [
  { title: 'A grown-up sets things up', copy: 'Your parent or caregiver creates the family account and gets your student login details.', icon: Users, tone: 'indigo' },
  { title: 'Keep your PIN private', copy: 'Your grown-up shares your access code and PIN with you. Don’t post or share your PIN.', icon: LockKeyhole, tone: 'yellow' },
  { title: 'Open your class together', copy: 'Use the student login your grown-up set up, then ask them to help you find your lesson.', icon: BookOpen, tone: 'mint' },
  { title: 'Learn, ask, and practice', copy: 'Meet your tutor in your planned lesson and take your next small learning step.', icon: Sparkles, tone: 'mint' },
]

const subjects = [
  { title: 'Reading', copy: 'Stories, words, and ideas.', icon: BookOpen, tone: 'indigo' },
  { title: 'Mathematics', copy: 'Patterns, puzzles, and numbers.', icon: Lightbulb, tone: 'yellow' },
  { title: 'Science', copy: 'Big questions about our world.', icon: Sparkles, tone: 'mint' },
  { title: 'Languages', copy: 'New words and ways to connect.', icon: MessageCircle, tone: 'mint' },
  { title: 'Study skills', copy: 'Helpful habits for your week.', icon: Check, tone: 'indigo' },
  { title: 'Exam prep', copy: 'Practice for a goal you choose.', icon: Compass, tone: 'yellow' },
]

const safetyTips = [
  { title: 'Keep your PIN to yourself', copy: 'Only share your access details with the grown-up who helps you sign in.', icon: LockKeyhole },
  { title: 'Join planned lessons', copy: 'Ask your grown-up to help you open a class that has been arranged for you.', icon: ShieldCheck },
  { title: 'Questions can wait for class', copy: 'This page has no chat or message box. Talk with your tutor in a grown-up-supervised lesson.', icon: MessageCircle },
  { title: 'Tell a trusted grown-up', copy: 'If something feels confusing or uncomfortable, pause and ask someone you trust for help.', icon: Heart },
]

const faqs = [
  { question: 'Who helps me make an account?', answer: 'A parent or caregiver creates the family account and helps you get ready to sign in.' },
  { question: 'Where do my access code and PIN come from?', answer: 'Your grown-up receives the student login details and shares them with you. Keep your PIN private.' },
  { question: 'Can I chat with someone from this page?', answer: 'No. There is no chat or message box here. Questions for your tutor belong in a lesson that your grown-up has arranged.' },
  { question: 'What if I cannot sign in?', answer: 'Ask your parent or caregiver to help. They can check your details and guide you to the student login page.' },
]

export function KidsClassSteps() {
  const reduceMotion = useReducedMotionPreference()

  return (
    <section id="how-classes-work" className="kids-section kids-class-steps" aria-labelledby="kids-steps-title">
      <div className="kids-section-inner">
        <Reveal><div className="kids-section-heading"><p className="kids-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> Four little steps</p><h2 id="kids-steps-title" className="kids-section-title">How a class gets started.</h2><p className="kids-section-intro">Your grown-up helps with the account and the class details, so you can focus on learning.</p></div></Reveal>
        <ol className="kids-step-grid">
          {classSteps.map(({ title, copy, icon: Icon, tone }, index) => <motion.li key={title} className={`kids-step-card kids-tone-${tone}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduceMotion ? 0.15 : 0.45, delay: reduceMotion ? 0 : index * 0.08 }}><span className="kids-step-number">0{index + 1}</span><span className="kids-step-icon"><Icon className="size-5" aria-hidden="true" /></span><h3>{title}</h3><p>{copy}</p><span className="kids-step-arrow" aria-hidden="true">{index < classSteps.length - 1 ? <ArrowRight className="size-4" /> : <Check className="size-4" />}</span></motion.li>)}
        </ol>
        <p className="kids-privacy-callout"><ShieldCheck className="size-4" aria-hidden="true" /> Your grown-up helps with the grown-up parts. You never need to put personal details on this page.</p>
      </div>
    </section>
  )
}

export function KidsSubjects() {
  return (
    <section id="kids-subjects" className="kids-section kids-subjects" aria-labelledby="kids-subjects-title">
      <div className="kids-section-inner">
        <Reveal><div className="kids-section-heading kids-section-heading-center"><p className="kids-eyebrow"><Compass className="size-4" aria-hidden="true" /> Pick a path to explore</p><h2 id="kids-subjects-title" className="kids-section-title">There&apos;s more than one way to be curious.</h2><p className="kids-section-intro">These are examples of topics you can explore with a grown-up and tutor.</p></div></Reveal>
        <div className="kids-subject-grid">
          {subjects.map(({ title, copy, icon: Icon, tone }) => <Reveal key={title}><article className={`kids-subject-card kids-tone-${tone}`}><span className="kids-subject-icon"><Icon className="size-5" aria-hidden="true" /></span><h3>{title}</h3><p>{copy}</p></article></Reveal>)}
        </div>
      </div>
    </section>
  )
}

export function KidsSafety() {
  const reduceMotion = useReducedMotionPreference()
  return (
    <section id="our-promises" className="kids-section kids-safety" aria-labelledby="kids-safety-title">
      <div className="kids-section-inner">
        <Reveal><div className="kids-safety-heading"><span className="kids-safety-seal"><ShieldCheck className="size-7" aria-hidden="true" /></span><div><p className="kids-eyebrow">A few important promises</p><h2 id="kids-safety-title" className="kids-section-title">Your safety comes first.</h2><p className="kids-section-intro">A grown-up helps with your account. These simple rules can help keep learning comfortable.</p></div></div></Reveal>
        <div className="kids-safety-grid">
          {safetyTips.map(({ title, copy, icon: Icon }, index) => <motion.article key={title} className="kids-safety-card" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reduceMotion ? 0.15 : 0.45, delay: reduceMotion ? 0 : index * 0.08 }}><span className="kids-safety-icon"><Icon className="size-5" aria-hidden="true" /></span><div><h3>{title}</h3><p>{copy}</p></div></motion.article>)}
        </div>
      </div>
    </section>
  )
}

export function KidsGrownUpHandoff() {
  return (
    <section id="grown-ups" className="kids-section kids-grown-up" aria-labelledby="kids-grown-up-title">
      <div className="kids-grown-up-inner">
        <div className="kids-grown-up-art" aria-hidden="true"><div className="kids-grown-up-orbit kids-grown-up-orbit-one" /><div className="kids-grown-up-orbit kids-grown-up-orbit-two" /><span className="kids-grown-up-icon"><Globe2 className="size-8" /></span><span className="kids-grown-up-star kids-grown-up-star-one"><Sparkles className="size-5" /></span><span className="kids-grown-up-star kids-grown-up-star-two"><Heart className="size-4 fill-current" /></span></div>
        <Reveal><div className="kids-grown-up-copy"><p className="kids-eyebrow">For your grown-up</p><h2 id="kids-grown-up-title" className="kids-section-title">The grown-up sets up your nest.</h2><p>Your parent or caregiver creates the account and receives your access code and PIN by email. They can share the details with you and help you get to class.</p><p className="kids-grown-up-reminder"><LockKeyhole className="size-4" aria-hidden="true" /> Keep your PIN private. Your grown-up can help if you need it.</p><Link href="/register" className="public-button public-button-primary kids-action-button">Ask a grown-up to sign you up <ArrowRight className="size-4" aria-hidden="true" /></Link></div></Reveal>
      </div>
    </section>
  )
}

export function KidsFaq() {
  return (
    <section id="kids-faq" className="kids-section kids-faq" aria-labelledby="kids-faq-title">
      <div className="kids-section-inner kids-faq-layout">
        <Reveal><div><p className="kids-eyebrow"><MessageCircle className="size-4" aria-hidden="true" /> Questions are welcome</p><h2 id="kids-faq-title" className="kids-section-title">Wondering about something?</h2><p className="kids-section-intro">If you&apos;re not sure what to do, ask a parent or caregiver to help.</p></div></Reveal>
        <div className="kids-faq-list">{faqs.map(({ question, answer }) => <details key={question} className="kids-faq-item"><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </div>
    </section>
  )
}

export function KidsClosing() {
  return (
    <section className="kids-closing" aria-labelledby="kids-closing-title">
      <div className="kids-closing-inner"><span className="kids-closing-spark" aria-hidden="true"><Sparkles className="size-7" /></span><p className="kids-eyebrow">Ready when you are</p><h2 id="kids-closing-title">Let curiosity lead the way.</h2><p>Ask your grown-up to set things up, or sign in with the details they gave you.</p><div className="kids-closing-actions"><Link href="/student-login" className="public-button public-button-primary kids-action-button">Student login <ArrowRight className="size-4" aria-hidden="true" /></Link><Link href="/register" className="public-button public-button-secondary kids-action-button">Ask a grown-up to sign you up <ArrowRight className="size-4" aria-hidden="true" /></Link></div></div>
    </section>
  )
}
