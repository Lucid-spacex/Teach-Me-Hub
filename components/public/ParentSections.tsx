import Link from 'next/link'
import { ArrowRight, BookOpen, Check, Compass, Heart, Lightbulb, MessageCircle, Sparkles, Users } from 'lucide-react'
import { Reveal } from '@/components/public/Reveal'

const approachSteps = [
  { number: '01', title: 'Start with the learner', copy: 'Name the subject, question, or goal that matters right now.', icon: Lightbulb },
  { number: '02', title: 'Find a good-fit tutor', copy: 'Explore educators and learning support that match your family’s needs.', icon: Compass },
  { number: '03', title: 'Keep the next step close', copy: 'Bring sessions, practice, and communication into a shared learning routine.', icon: BookOpen },
]

const benefits = [
  { title: 'A plan with room to flex', copy: 'Keep the focus on what your learner needs next, not a one-size-fits-all checklist.', icon: Sparkles, tone: 'gold' },
  { title: 'One connected team', copy: 'Give parents, learners, and tutors a shared place to stay in step.', icon: Users, tone: 'coral' },
  { title: 'Progress you can talk about', copy: 'Make space for questions, feedback, and the small moments worth noticing.', icon: MessageCircle, tone: 'sage' },
]

const subjects = [
  { title: 'Mathematics', copy: 'Build understanding one idea at a time.', tone: 'math', icon: Lightbulb },
  { title: 'Reading & writing', copy: 'Make room for stories, words, and clearer expression.', tone: 'reading', icon: BookOpen },
  { title: 'Science', copy: 'Follow the questions that make the world interesting.', tone: 'science', icon: Sparkles },
  { title: 'Languages', copy: 'Practice new ways to listen, speak, and connect.', tone: 'language', icon: MessageCircle },
  { title: 'Coding', copy: 'Explore logic through small creative challenges.', tone: 'coding', icon: Compass },
  { title: 'Study skills', copy: 'Find a routine that works for your learner.', tone: 'study', icon: Check },
]

const faqItems = [
  {
    question: 'What is TeachMeNest?',
    answer: 'TeachMeNest brings learners, parents and caregivers, and tutors together around online lessons and the learning tasks that happen between them.',
  },
  {
    question: 'How does a family get started?',
    answer: 'A parent or caregiver can use Get started to create an account, share what the learner is looking for, and explore the available tutor options.',
  },
  {
    question: 'Can we explore more than one subject?',
    answer: 'Families can browse the subjects and tutor profiles available to them, then choose the learning focus that feels right for the learner.',
  },
  {
    question: 'Are the dashboard and schedule on this page real?',
    answer: 'No. The dashboard and calendar are clearly marked sample views. They do not show a real learner, account, or booking.',
  },
  {
    question: 'How do children sign up?',
    answer: 'A parent or caregiver should create the family account. Children can use the existing Student login once their adult has arranged access.',
  },
]

export function ParentPromiseStrip() {
  return (
    <section className="parent-promise-strip" aria-label="TeachMeNest learning approach">
      <div className="parent-promise-inner">
        <p>Good learning starts with feeling supported.</p>
        <div className="parent-promise-points">
          <span><Heart className="size-4" aria-hidden="true" /> Care for the learner</span>
          <span><Compass className="size-4" aria-hidden="true" /> A clear next step</span>
          <span><Check className="size-4" aria-hidden="true" /> Shared understanding</span>
        </div>
      </div>
    </section>
  )
}

export function ParentApproach() {
  return (
    <section id="how-it-works" className="parent-section parent-approach" aria-labelledby="parent-approach-title">
      <div className="parent-section-inner">
        <Reveal>
          <div className="parent-section-heading parent-section-heading-centered">
            <p className="public-eyebrow">A calmer way to begin</p>
            <h2 id="parent-approach-title" className="parent-section-title">Learning works better when everyone knows the next step.</h2>
            <p className="parent-section-intro">Start with what your learner needs today. Let the plan grow as you learn what works.</p>
          </div>
        </Reveal>
        <div className="parent-approach-grid">
          {approachSteps.map(({ number, title, copy, icon: Icon }, index) => (
            <Reveal key={number}>
              <article className="parent-approach-card">
                <div className="parent-approach-topline"><span className="parent-step-number">{number}</span><span className={`parent-step-icon parent-step-icon-${index + 1}`}><Icon className="size-5" aria-hidden="true" /></span></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ParentBenefits() {
  return (
    <section className="parent-section parent-benefits" aria-labelledby="parent-benefits-title">
      <div className="parent-section-inner parent-benefits-layout">
        <Reveal>
          <div className="parent-benefits-intro">
            <p className="public-eyebrow">Made for real family rhythms</p>
            <h2 id="parent-benefits-title" className="parent-section-title">A little more clarity. A lot more room to learn.</h2>
            <p className="parent-section-intro">The practical details matter. Keep them close without letting them take over the learning.</p>
            <Link href="/register" className="public-text-link">Explore the parent portal <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </Reveal>
        <div className="parent-benefit-list">
          {benefits.map(({ title, copy, icon: Icon, tone }, index) => (
            <Reveal key={title}>
              <article className="parent-benefit-card">
                <span className={`parent-benefit-icon parent-benefit-icon-${tone}`}><Icon className="size-5" aria-hidden="true" /></span>
                <div><span className="parent-benefit-index">0{index + 1}</span><h3>{title}</h3><p>{copy}</p></div>
                <ArrowRight className="parent-benefit-arrow size-4" aria-hidden="true" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ParentSubjectExplorer() {
  return (
    <section id="subjects" className="parent-section parent-subjects" aria-labelledby="parent-subjects-title">
      <div className="parent-section-inner">
        <Reveal>
          <div className="parent-subject-heading">
            <div><p className="public-eyebrow">A wide world to explore</p><h2 id="parent-subjects-title" className="parent-section-title">Start with what makes them curious.</h2></div>
            <p className="parent-section-intro">Browse example learning areas. Availability can vary by tutor and learner goals.</p>
          </div>
        </Reveal>
        <div className="parent-subject-grid">
          {subjects.map(({ title, copy, tone, icon: Icon }, index) => (
            <Reveal key={title}>
              <article className={`parent-subject-card parent-subject-${tone}`}>
                <span className="parent-subject-index">0{index + 1}</span>
                <span className="parent-subject-symbol"><Icon className="size-5" aria-hidden="true" /></span>
                <h3>{title}</h3><p>{copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="parent-subject-note">Subject cards are examples, not a promise of tutor availability.</p>
      </div>
    </section>
  )
}

export function ParentStories() {
  const placeholders = [
    { label: 'Parent perspective', context: 'Family story', tone: 'story-gold' },
    { label: 'Learner perspective', context: 'Learning moment', tone: 'story-sage' },
    { label: 'Tutor perspective', context: 'Teaching moment', tone: 'story-coral' },
  ]

  return (
    <section className="parent-section parent-stories" aria-labelledby="parent-stories-title">
      <div className="parent-section-inner">
        <Reveal>
          <div className="parent-section-heading parent-section-heading-centered">
            <p className="public-eyebrow">Stories belong to real people</p>
            <h2 id="parent-stories-title" className="parent-section-title">Room for the voices that make this personal.</h2>
            <p className="parent-section-intro">We’ll share family and tutor stories here only when they’re approved and ready.</p>
          </div>
        </Reveal>
        <div className="parent-story-grid">
          {placeholders.map((story) => (
            <article key={story.label} className={`parent-story-card ${story.tone}`}>
              <span className="parent-story-label">[Placeholder] · {story.label}</span>
              <p className="parent-story-copy">Add an approved {story.context.toLowerCase()} here.</p>
              <span className="parent-story-attribution">[Placeholder] · Name and context</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ParentFaq() {
  return (
    <section id="faq" className="parent-section parent-faq" aria-labelledby="parent-faq-title">
      <div className="parent-section-inner parent-faq-layout">
        <Reveal>
          <div className="parent-faq-intro">
            <p className="public-eyebrow">Questions, welcome</p>
            <h2 id="parent-faq-title" className="parent-section-title">A few helpful things to know.</h2>
            <p className="parent-section-intro">Still deciding? A parent or caregiver can explore the next step without committing to a particular tutor.</p>
            <Link href="/register" className="public-text-link">Start with the family account <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </Reveal>
        <div className="parent-faq-list">
          {faqItems.map((item) => (
            <details className="parent-faq-item" key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ParentClosingCta() {
  return (
    <section className="parent-closing" aria-labelledby="parent-closing-title">
      <div className="parent-closing-orbit" aria-hidden="true" />
      <div className="parent-closing-content">
        <p className="parent-closing-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> A thoughtful first step</p>
        <h2 id="parent-closing-title">Let curiosity set the pace.</h2>
        <p>Explore the family registration path, or take a look at the tutors who could support your learner.</p>
        <div className="parent-hero-actions parent-closing-actions">
          <Link href="/register" className="public-button public-button-primary">Get started <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link href="/tutors" className="public-button public-button-secondary">Browse tutors <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  )
}
