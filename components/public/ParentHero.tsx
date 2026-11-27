'use client'

import Link from 'next/link'
import { ArrowRight, Check, LockKeyhole, ShieldCheck } from 'lucide-react'

const trustPoints = ['Tutor applications reviewed', 'Grades reviewed by an administrator', 'Secure payments']

export function ParentHero() {
  return (
    <section className="adult-hero adult-parent-hero" aria-labelledby="parent-hero-title">
      <div className="adult-hero-grid" aria-hidden="true" />
      <div className="adult-hero-layout">
        <div className="adult-hero-copy">
          <p className="adult-eyebrow">Personal learning, with a clearer path</p>
          <h1 id="parent-hero-title">A clearer path to <em className="adult-accent">learning.</em></h1>
          <p className="adult-lede">Qualified tutors, visible progress, and clear communication—planned around your family.</p>
          <div className="adult-actions">
            <Link href="/register" className="public-button public-button-primary">Get started <ArrowRight aria-hidden="true" /></Link>
            <Link href="/student-login" className="public-button public-button-secondary">Student login</Link>
          </div>
          <p className="adult-privacy"><LockKeyhole aria-hidden="true" /> A parent-managed account keeps student details private.</p>
          <ul className="adult-trust-line" aria-label="What families can expect">
            {trustPoints.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}
          </ul>
        </div>
        <div className="adult-hero-art" aria-hidden="true">
          <div className="adult-world-motif">
            <span className="adult-world-ring adult-world-ring-one" />
            <span className="adult-world-ring adult-world-ring-two" />
            <span className="adult-world-ring adult-world-ring-three" />
            <span className="adult-world-meridian adult-world-meridian-one" />
            <span className="adult-world-meridian adult-world-meridian-two" />
            <span className="adult-world-equator" />
            <span className="adult-world-axis" />
            <span className="adult-world-point adult-world-point-one" />
            <span className="adult-world-point adult-world-point-two" />
          </div>
          <p className="adult-art-caption"><ShieldCheck aria-hidden="true" /> Thoughtful support, wherever you learn.</p>
        </div>
      </div>
      <div className="adult-hero-bottom"><span>Learning support that respects your family&apos;s time.</span><a href="#how-it-works">Explore the process <span aria-hidden="true">↓</span></a></div>
    </section>
  )
}
