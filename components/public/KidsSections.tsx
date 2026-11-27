'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Check, Compass, Heart, LockKeyhole, MessageCircle, ShieldCheck, Sparkles, Star, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { Reveal } from '@/components/public/Reveal'
import { useReducedMotionPreference } from '@/lib/motion'

const classSteps = [
  { title: 'A grown-up signs you up', copy: 'They help with the family account.', icon: Users, tone: 'indigo' },
  { title: 'Get your secret code', copy: 'Your grown-up shares your code and PIN.', icon: LockKeyhole, tone: 'yellow' },
  { title: 'Meet your tutor live', copy: 'Join the class your grown-up planned.', icon: BookOpen, tone: 'mint' },
  { title: 'Try, learn, and grow', copy: 'Do your work and celebrate small wins.', icon: Star, tone: 'coral' },
]

const thingsToExplore = [
  { title: 'Reading', copy: 'Stories, words, and ideas.', icon: BookOpen, tone: 'indigo' },
  { title: 'Maths', copy: 'Patterns and puzzles.', icon: Sparkles, tone: 'yellow' },
  { title: 'Science', copy: 'Big questions about our world.', icon: Compass, tone: 'mint' },
  { title: 'Languages', copy: 'New words to explore.', icon: MessageCircle, tone: 'coral' },
  { title: 'Study skills', copy: 'Helpful habits for your week.', icon: Check, tone: 'indigo' },
  { title: 'Exam practice', copy: 'Get ready, one step at a time.', icon: Heart, tone: 'yellow' },
]

const safetyTips = [
  { title: 'Keep your PIN secret', copy: 'Only share it with your grown-up.', icon: LockKeyhole },
  { title: 'Join planned classes', copy: 'Ask your grown-up to help you sign in.', icon: ShieldCheck },
  { title: 'No messages here', copy: 'You can’t message other people here.', icon: MessageCircle },
  { title: 'Speak up', copy: 'Tell a trusted grown-up if something feels wrong.', icon: Heart },
]

const faqs = [
  { question: 'Who makes my account?', answer: 'A parent or caregiver makes the family account and helps you get ready.' },
  { question: 'Where do my code and PIN come from?', answer: 'Your grown-up gets them and shares them with you. Keep your PIN secret.' },
  { question: 'Can I message people here?', answer: 'No. You can’t message other people here. Ask your grown-up if you need help.' },
  { question: 'What if I can’t sign in?', answer: 'Ask your parent or caregiver to help you check your details.' },
]

export function KidsClassSteps() {
  const reduceMotion = useReducedMotionPreference()

  return (
    <section id="how-classes-work" className="kids-section kids-class-steps landing-section" aria-labelledby="kids-steps-title">
      <div className="kids-section-inner">
        <div className="kids-section-heading"><p className="kids-eyebrow">Your first class</p><h2 id="kids-steps-title" className="kids-section-title">Four steps to a new <em className="landing-accent">idea.</em></h2><p className="kids-section-intro">Your grown-up helps with the setup. Then you can get curious.</p></div>
        <ol className="kids-step-grid">{classSteps.map(({ title, copy, icon: Icon, tone }, index) => <motion.li key={title} className={`kids-step-card kids-tone-${tone}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: reduceMotion ? 0.15 : 0.45, delay: reduceMotion ? 0 : index * 0.08 }}><span className="kids-step-number">0{index + 1}</span><span className="kids-step-icon"><Icon aria-hidden="true" /></span><h3>{title}</h3><p>{copy}</p><span className="kids-step-arrow" aria-hidden="true">{index < classSteps.length - 1 ? <ArrowRight /> : <Check />}</span></motion.li>)}</ol>
        <p className="kids-privacy-callout"><ShieldCheck aria-hidden="true" /> Your grown-up keeps your details private.</p>
      </div>
    </section>
  )
}

export function KidsSubjects() {
  return (
    <section id="kids-subjects" className="kids-section kids-subjects landing-section" aria-labelledby="kids-subjects-title">
      <div className="kids-section-inner">
        <Reveal><div className="kids-section-heading kids-section-heading-center"><p className="kids-eyebrow">Pick something to explore</p><h2 id="kids-subjects-title" className="kids-section-title">Your questions can take you <em className="landing-accent">anywhere.</em></h2><p className="kids-section-intro">Here are a few things you might learn with a tutor.</p></div></Reveal>
        <div className="kids-subject-grid">{thingsToExplore.map(({ title, copy, icon: Icon, tone }) => <article key={title} className={`kids-subject-card kids-tone-${tone}`}><span className="kids-subject-icon"><Icon aria-hidden="true" /></span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </div>
    </section>
  )
}

export function KidsSafety() {
  const reduceMotion = useReducedMotionPreference()
  return (
    <section id="our-promises" className="kids-section kids-safety landing-section" aria-labelledby="kids-safety-title">
      <div className="kids-section-inner">
        <div className="kids-safety-heading"><span className="kids-safety-seal"><ShieldCheck aria-hidden="true" /></span><div><p className="kids-eyebrow">A few important things</p><h2 id="kids-safety-title" className="kids-section-title">Stay safe. Keep learning <em className="landing-accent">fun.</em></h2><p className="kids-section-intro">Your grown-up can help if you are not sure.</p></div></div>
        <div className="kids-safety-grid">{safetyTips.map(({ title, copy, icon: Icon }, index) => <motion.article key={title} className="kids-safety-card" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reduceMotion ? 0.15 : 0.45, delay: reduceMotion ? 0 : index * 0.08 }}><span className="kids-safety-icon"><Icon aria-hidden="true" /></span><div><h3>{title}</h3><p>{copy}</p></div></motion.article>)}</div>
      </div>
    </section>
  )
}

export function KidsGrownUpHandoff() {
  return (
    <section id="grown-ups" className="kids-section kids-grown-up landing-section" aria-labelledby="kids-grown-up-title">
      <div className="kids-grown-up-inner">
        <div className="kids-grown-up-art" aria-hidden="true"><span className="kids-handoff-orbit" /><span className="kids-handoff-globe"><Compass /></span><span className="kids-handoff-star kids-handoff-star-one"><Star /></span><span className="kids-handoff-star kids-handoff-star-two"><Sparkles /></span></div>
        <div className="kids-grown-up-copy"><p className="kids-eyebrow">For grown-ups</p><h2 id="kids-grown-up-title" className="kids-section-title">A grown-up helps you <em className="landing-accent">begin.</em></h2><p>Your parent or caregiver makes the account and gets your secret code and PIN.</p><p className="kids-grown-up-reminder"><LockKeyhole aria-hidden="true" /> Keep your PIN private.</p><Link href="/register" className="public-button public-button-primary kids-action-button">Ask a grown-up to sign you up <ArrowRight aria-hidden="true" /></Link><small className="landing-privacy-note">Your details stay with your grown-up.</small></div>
        <div className="kids-grown-up-links"><Link href="/" className="kids-grown-up-link"><span>Parents</span><strong>Parents, start here</strong><ArrowRight aria-hidden="true" /></Link><Link href="/tutors" className="kids-grown-up-link"><span>Tutors</span><strong>Teach with us</strong><ArrowRight aria-hidden="true" /></Link></div>
      </div>
    </section>
  )
}

export function KidsFaq() {
  return (
    <section id="kids-faq" className="kids-section kids-faq landing-section" aria-labelledby="kids-faq-title">
      <div className="kids-section-inner kids-faq-layout"><div><p className="kids-eyebrow">Still wondering?</p><h2 id="kids-faq-title" className="kids-section-title">It’s okay to <em className="landing-accent">ask.</em></h2><p className="kids-section-intro">Your grown-up can help with anything that feels tricky.</p></div><div className="kids-faq-list">{faqs.map(({ question, answer }) => <details key={question} className="kids-faq-item"><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div>
    </section>
  )
}

export function KidsClosing() {
  return (
    <section className="kids-closing landing-closing" aria-labelledby="kids-closing-title">
      <div className="kids-closing-inner"><span className="kids-closing-spark" aria-hidden="true"><Sparkles /></span><p className="kids-eyebrow">Ready when you are</p><h2 id="kids-closing-title" className="landing-closing-title">Let curiosity lead the <em className="landing-accent">way.</em></h2><p className="landing-closing-copy">Ask your grown-up to help, or sign in with your details.</p><div className="kids-closing-actions"><Link href="/student-login" className="public-button public-button-primary kids-action-button">Student login <ArrowRight aria-hidden="true" /></Link><Link href="/register" className="public-button public-button-secondary kids-action-button">Ask a grown-up to sign you up <ArrowRight aria-hidden="true" /></Link></div><small className="landing-privacy-note">Your grown-up helps keep your details safe.</small></div>
    </section>
  )
}
