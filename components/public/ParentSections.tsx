import Link from 'next/link'
import { ArrowRight, ChevronDown, LockKeyhole } from 'lucide-react'

const principles = [
  'Qualified tutors',
  'Progress you can see',
  'Clear communication',
]

export function ParentPrinciples() {
  return (
    <section className="adult-principles" aria-label="What families can expect">
      <div className="adult-principles-inner">
        <p className="adult-eyebrow">What you can expect</p>
        <ul>{principles.map((principle, index) => <li key={principle}><span>0{index + 1}</span>{principle}</li>)}</ul>
      </div>
    </section>
  )
}

const journey = [
  { title: 'Create a family account', copy: 'Begin with the parent or caregiver who will guide the learning.' },
  { title: 'Add your learner', copy: 'Share a name and grade to help shape a suitable learning plan.' },
  { title: 'Choose subjects and times', copy: 'Set priorities and find a schedule that works across your time zone.' },
  { title: 'Meet your tutor', copy: 'Start live lessons and follow reviewed progress through your account.' },
]

export function ParentApproach() {
  return (
    <section id="how-it-works" className="adult-section adult-journey" aria-labelledby="parent-journey-title">
      <div className="adult-section-inner adult-journey-layout">
        <div className="adult-journey-intro">
          <p className="adult-eyebrow">A clear first step</p>
          <h2 id="parent-journey-title">From first enquiry to a steady <em className="adult-accent">routine.</em></h2>
          <p className="adult-section-copy">A considered process helps families understand what happens next.</p>
          <p className="adult-small-note">You will need a learner&apos;s grade, a few subject priorities, and times that suit your family.</p>
        </div>
        <ol className="adult-journey-list">
          {journey.map((step, index) => (
            <li key={step.title}>
              <span className="adult-journey-number">0{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.copy}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const trustItems = [
  { title: 'Tutor applications are reviewed', copy: 'An administrator reviews each application before approval and matching.' },
  { title: 'Student details are handled with care', copy: 'A parent-managed account keeps learner information in the family’s hands.' },
  { title: 'Payments have a clear record', copy: 'Secure payments are processed through Paystack, with receipts available in your account.' },
  { title: 'Every grade is reviewed', copy: 'An administrator reviews each grade before it is shared with a family.' },
]

export function ParentSafety() {
  return (
    <section id="trust" className="adult-section adult-trust-section" aria-labelledby="parent-trust-title">
      <div className="adult-section-inner adult-trust-layout">
        <div className="adult-trust-intro">
          <p className="adult-eyebrow">Trust, made visible</p>
          <h2 id="parent-trust-title">Care is part of the <em className="adult-accent">process.</em></h2>
          <p className="adult-section-copy">Clear safeguards support families at every important step.</p>
        </div>
        <ol className="adult-trust-list">
          {trustItems.map((item, index) => (
            <li key={item.title}>
              <span className="adult-list-number">0{index + 1}</span>
              <div><h3>{item.title}</h3><p>{item.copy}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const placeholderStories = [
  { role: 'Parent', label: 'Family experience' },
  { role: 'Tutor', label: 'Teaching experience' },
]

export function ParentStories() {
  return (
    <section className="adult-section adult-stories" aria-labelledby="parent-stories-title">
      <div className="adult-section-inner">
        <div className="adult-section-heading">
          <p className="adult-eyebrow">A place for real voices</p>
          <h2 id="parent-stories-title">Credibility comes from <em className="adult-accent">experience.</em></h2>
          <p className="adult-section-copy">No testimonials are published until someone chooses to share their story.</p>
        </div>
        <div className="adult-quote-list">
          {placeholderStories.map((story) => (
            <figure className="adult-quote" key={story.role}>
              <span className="adult-quote-mark" aria-hidden="true">“</span>
              <blockquote>[Placeholder for a verified {story.role.toLowerCase()} quotation.]</blockquote>
              <figcaption><strong>[Placeholder]</strong><span>{story.role} · {story.label}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

const faqItems = [
  { question: 'How are tutors selected?', answer: 'Tutor applications are reviewed by an administrator before approval and matching.' },
  { question: 'How can I follow my child’s progress?', answer: 'Families can review learning updates and grades after an administrator has reviewed each grade.' },
  { question: 'How do payments work?', answer: 'Secure payments are processed through Paystack. Receipts are available in the family account.' },
  { question: 'Can lessons work across time zones?', answer: 'Class times are shown in local time so families and tutors can coordinate across locations.' },
]

export function ParentFaq() {
  return (
    <section id="faq" className="adult-section adult-faq" aria-labelledby="parent-faq-title">
      <div className="adult-section-inner adult-faq-layout">
        <div className="adult-faq-intro">
          <p className="adult-eyebrow">Questions, answered</p>
          <h2 id="parent-faq-title">The information families <em className="adult-accent">need.</em></h2>
          <p className="adult-section-copy">Straightforward answers before you decide what is right for your learner.</p>
          <Link href="/register" className="adult-text-link">Create a family account <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="adult-faq-list">
          {faqItems.map((item) => (
            <details className="adult-faq-item" key={item.question}>
              <summary>{item.question}<ChevronDown aria-hidden="true" /></summary>
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
    <section className="adult-closing" aria-labelledby="parent-closing-title">
      <div className="adult-closing-inner">
        <p className="adult-eyebrow">A considered next step</p>
        <h2 id="parent-closing-title">Give learning room to <em className="adult-accent">grow.</em></h2>
        <p>Start with your family account. Take the next step when you are ready.</p>
        <div className="adult-actions">
          <Link href="/register" className="public-button public-button-primary">Get started <ArrowRight aria-hidden="true" /></Link>
          <Link href="/student-login" className="public-button public-button-secondary">Student login</Link>
        </div>
        <small><LockKeyhole aria-hidden="true" /> Your family details stay private.</small>
      </div>
    </section>
  )
}
