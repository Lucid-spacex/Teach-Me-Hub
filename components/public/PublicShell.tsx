'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { ArrowRight, ChevronUp, GraduationCap, Menu, Sparkles, X } from 'lucide-react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useReducedMotionPreference } from '@/lib/motion'

type PublicAudience = 'parents' | 'tutors' | 'kids'

type PublicShellProps = {
  audience: PublicAudience
  children: React.ReactNode
}

const navigation: Record<PublicAudience, { label: string; href: string }[]> = {
  parents: [
    { label: 'Parents', href: '/' },
    { label: 'For tutors', href: '/tutors' },
    { label: 'For kids', href: '/kids' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Subjects', href: '#subjects' },
    { label: 'FAQ', href: '#faq' },
  ],
  tutors: [
    { label: 'Parents', href: '/' },
    { label: 'For tutors', href: '/tutors' },
    { label: 'For kids', href: '/kids' },
  ],
  kids: [
    { label: 'Parents', href: '/' },
    { label: 'For tutors', href: '/tutors' },
    { label: 'For kids', href: '/kids' },
  ],
}

const actionCopy: Record<PublicAudience, { login: string; loginHref: string; start: string; startHref: string }> = {
  parents: { login: 'Parent login', loginHref: '/login', start: 'Get started', startHref: '/register' },
  tutors: { login: 'Tutor login', loginHref: '/tutor/login', start: 'Apply now', startHref: '/tutor/register' },
  kids: { login: 'Student login', loginHref: '/student-login', start: 'Ask a grown-up to sign you up', startHref: '/register' },
}

function Brand() {
  return (
    <Link href="/" aria-label="TeachMeNest home" className="public-brand inline-flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-none">
      <span className="public-brand-mark grid size-9 place-items-center rounded-full" aria-hidden="true">
        <GraduationCap className="size-[18px]" />
      </span>
      <span className="text-[15px] font-extrabold tracking-[-0.045em]">TeachMeNest</span>
    </Link>
  )
}

function Header({ audience }: { audience: PublicAudience }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotionPreference()
  const items = navigation[audience]
  const actions = actionCopy[audience]
  const isTutor = audience === 'tutors'

  useEffect(() => {
    const updateHeaderSize = () => headerRef.current?.classList.toggle('is-scrolled', window.scrollY > 32)
    updateHeaderSize()
    window.addEventListener('scroll', updateHeaderSize, { passive: true })
    return () => window.removeEventListener('scroll', updateHeaderSize)
  }, [])

  return (
    <header ref={headerRef} className={isTutor ? 'public-header public-header-tutors' : 'public-header public-header-floating'}>
      <div className={isTutor ? 'public-header-inner public-header-inner-tutors' : 'public-header-inner public-header-inner-floating'}>
        <Brand />

        <nav aria-label="Main navigation" className="public-desktop-nav">
          {items.map((item) => (
            <Link key={item.label} href={item.href} className="public-nav-link">{item.label}</Link>
          ))}
        </nav>

        <div className="public-header-actions">
          <ThemeToggle />
          <Link href={actions.loginHref} className="public-login-link">{actions.login}</Link>
          <Link href={actions.startHref} className="public-button public-button-primary public-header-cta">
            {actions.start}<ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="public-menu-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="public-mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && menuOpen) {
              setMenuOpen(false)
              menuButtonRef.current?.focus()
            }
          }}
        >
          {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="public-mobile-navigation"
            key="public-mobile-navigation"
            className="public-mobile-panel"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setMenuOpen(false)
                menuButtonRef.current?.focus()
              }
            }}
          >
            <nav aria-label="Mobile navigation" className="public-mobile-links">
              {items.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: reduceMotion ? 0 : index * 0.06 }}
                >
                  <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="public-mobile-link">{item.label}</Link>
                </motion.div>
              ))}
            </nav>
            <div className="public-mobile-actions">
              <ThemeToggle />
              <Link href={actions.loginHref} onClick={() => setMenuOpen(false)} className="public-mobile-link">{actions.login}</Link>
              <Link href={actions.startHref} onClick={() => setMenuOpen(false)} className="public-button public-button-primary justify-center">
                {actions.start}<ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer({ audience }: { audience: PublicAudience }) {
  const cta = actionCopy[audience]
  const productLinks = [
    { label: 'How it works', href: audience === 'parents' ? '#how-it-works' : '/#how-it-works' },
    { label: 'Features', href: audience === 'parents' ? '#features' : '/#features' },
    { label: 'Subjects', href: audience === 'parents' ? '#subjects' : '/#subjects' },
    { label: 'Questions', href: audience === 'parents' ? '#faq' : '/#faq' },
  ]

  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div className="public-footer-main">
          <div className="public-footer-brand-block">
            <Brand />
            <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--public-muted)]">
              Thoughtful learning support, built around the people who help every learner grow.
            </p>
          </div>
          <FooterGroup title="Product" links={productLinks} />
          <FooterGroup title="For tutors" links={[
            { label: 'Teach with us', href: '/tutors' },
            { label: 'Apply now', href: '/tutor/register' },
            { label: 'Tutor login', href: '/tutor/login' },
          ]} />
          <FooterGroup title="For kids" links={[
            { label: 'Kids home', href: '/kids' },
            { label: 'Student login', href: '/student-login' },
            { label: 'Parents', href: '/' },
          ]} />
          <div className="public-footer-support">
            <h2 className="public-footer-heading">Support</h2>
            <p className="public-footer-link mt-4">Family support</p>
            <p className="public-footer-placeholder">[Placeholder]</p>
            <p className="public-footer-made">Made for families worldwide.</p>
          </div>
          <div className="public-footer-cta">
            <p className="public-eyebrow">A good next step</p>
            <h2 className="mt-3 text-xl font-bold tracking-[-0.03em]">Let&apos;s make learning feel possible.</h2>
            <Link href={cta.startHref} className="public-button public-button-primary mt-5">
              {cta.start}<ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="public-footer-bottom">
          <p>© {new Date().getFullYear()} TeachMeNest</p>
          <p className="inline-flex items-center gap-2"><Sparkles className="size-3.5" aria-hidden="true" /> Learn. Grow. Thrive.</p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}

function FooterGroup({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="public-footer-heading">{title}</h2>
      <nav aria-label={`${title} footer links`} className="mt-4 flex flex-col items-start gap-3">
        {links.map((item) => <Link key={item.label} href={item.href} className="public-footer-link">{item.label}</Link>)}
      </nav>
    </div>
  )
}

export function PublicShell({ audience, children }: PublicShellProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const updateScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0)
      setShowBackToTop(window.scrollY > 480)
    }

    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)
    return () => {
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [])

  return (
    <div className="public-site" data-audience={audience}>
      <a href="#main-content" className="public-skip-link">Skip to content</a>
      <div className="public-scroll-progress" style={{ transform: `scaleX(${scrollProgress / 100})` }} aria-hidden="true" />
      <Header audience={audience} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer audience={audience} />
      {showBackToTop && (
        <button
          type="button"
          className="public-back-to-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
