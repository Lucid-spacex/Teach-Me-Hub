import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

export function TutorHero() {
  return (
    <section className="adult-hero adult-tutor-hero" aria-labelledby="tutor-hero-title">
      <div className="adult-hero-grid" aria-hidden="true" />
      <div className="adult-hero-layout">
        <div className="adult-hero-copy">
          <p className="adult-eyebrow">For tutors and educators</p>
          <h1 id="tutor-hero-title">Teach with <em className="adult-accent">purpose.</em></h1>
          <p className="adult-lede">A structured path to learner matches, clear monthly pay, and support for your teaching work.</p>
          <div className="adult-actions">
            <Link href="/tutor/register" className="public-button public-button-primary">Start your application <ArrowRight aria-hidden="true" /></Link>
            <Link href="/tutor/login" className="public-button public-button-secondary">Tutor login</Link>
          </div>
          <p className="adult-privacy"><Check aria-hidden="true" /> An administrator reviews applications and sets pay after approval.</p>
        </div>
        <div className="adult-hero-art adult-architecture-art" aria-hidden="true">
          <span className="adult-architecture-frame" />
          <span className="adult-architecture-inner" />
          <span className="adult-architecture-step adult-architecture-step-one" />
          <span className="adult-architecture-step adult-architecture-step-two" />
          <span className="adult-architecture-step adult-architecture-step-three" />
          <span className="adult-architecture-axis" />
          <span className="adult-architecture-point" />
          <p>Experience. Review. Match.</p>
        </div>
      </div>
      <div className="adult-hero-bottom"><span>Professional teaching, with a clear process.</span><a href="#tutor-application">View application steps <span aria-hidden="true">↓</span></a></div>
    </section>
  )
}
