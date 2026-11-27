'use client'

import { useEffect, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/public/Reveal'
import { usePublicMotionPreference } from '@/components/public/usePublicMotionPreference'

const places = [
  { role: 'Parent', city: 'New York', zone: 'America/New_York', color: 'parent-time-coral' },
  { role: 'Tutor', city: 'London', zone: 'Europe/London', color: 'parent-time-gold' },
  { role: 'Child', city: 'Dubai', zone: 'Asia/Dubai', color: 'parent-time-teal' },
]

export function ParentWorldClock() {
  const [timestamp, setTimestamp] = useState<number | null>(null)

  useEffect(() => {
    const updateClock = () => setTimestamp(Date.now())
    updateClock()
    const interval = window.setInterval(updateClock, 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const sampleClassAt = timestamp === null ? null : timestamp + 3 * 60 * 60 * 1000

  return (
    <section className="parent-world-section landing-section" aria-labelledby="parent-world-title">
      <div className="parent-world-inner">
        <div className="parent-world-copy"><p className="landing-eyebrow">Different places, one shared hour</p><h2 id="parent-world-title" className="landing-section-title">A class can fit across <em className="landing-accent">time zones.</em></h2><p className="landing-section-copy">Your family and tutor see the same class in their own local time.</p></div>
        <div className="parent-world-board" aria-label="Sample local time scene">
          <span className="parent-world-sun-doodle" aria-hidden="true"><Sparkles /></span>
          <div className="parent-world-cities">{places.map((place) => {
            const localTime = timestamp === null ? '—:—' : new Intl.DateTimeFormat('en', { timeZone: place.zone, hour: 'numeric', minute: '2-digit' }).format(timestamp)
            const classTime = sampleClassAt === null ? '—:—' : new Intl.DateTimeFormat('en', { timeZone: place.zone, hour: 'numeric', minute: '2-digit' }).format(sampleClassAt)
            return <article className={`parent-world-city ${place.color}`} key={place.role}><span className="parent-world-role">{place.role} · {place.city}</span><time className="parent-world-live-time" dateTime={timestamp === null ? undefined : new Date(timestamp).toISOString()}>{localTime}</time><span className="parent-world-zone">{place.zone}</span><span className="parent-world-class-time">Sample class <strong>{classTime}</strong></span></article>
          })}</div>
          <p className="parent-world-caption">Example only · New York, London, and Dubai</p>
        </div>
      </div>
    </section>
  )
}

const gradeBands = [
  { label: 'Preschool to G1', subjects: ['Early reading', 'Number sense', 'Patterns', 'Creative play'] },
  { label: 'G2 to G4', subjects: ['Reading & writing', 'Multiplication', 'Science', 'Study habits'] },
  { label: 'G5 to G8', subjects: ['Fractions & algebra', 'Essay writing', 'Life science', 'Coding'] },
  { label: 'G9 to G12', subjects: ['Advanced mathematics', 'Literature', 'Lab sciences', 'Exam preparation'] },
]

export function ParentGradeBands() {
  const [activeBand, setActiveBand] = useState(0)
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const reduceMotion = usePublicMotionPreference()
  const selectedBand = gradeBands[activeBand]

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let nextIndex = activeBand
    if (event.key === 'ArrowRight') nextIndex = (activeBand + 1) % gradeBands.length
    if (event.key === 'ArrowLeft') nextIndex = (activeBand - 1 + gradeBands.length) % gradeBands.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = gradeBands.length - 1
    if (nextIndex !== activeBand) {
      event.preventDefault()
      setActiveBand(nextIndex)
      document.getElementById(`parent-grade-tab-${nextIndex}`)?.focus()
    }
  }

  return (
    <section id="subjects" className="parent-section parent-grade-bands landing-section" aria-labelledby="parent-grade-title">
      <div className="parent-section-inner">
        <div className="landing-section-heading"><p className="landing-eyebrow">Find your child’s next step</p><h2 id="parent-grade-title" className="landing-section-title">Good learning starts with <em className="landing-accent">curiosity.</em></h2><p className="landing-section-copy">Choose a stage to see a few example subjects and skills.</p></div>
        <div className="parent-grade-tabs" role="tablist" aria-label="Choose a grade band" aria-orientation="horizontal">{gradeBands.map((band, index) => <button key={band.label} id={`parent-grade-tab-${index}`} type="button" role="tab" aria-selected={activeBand === index} aria-controls="parent-grade-panel" tabIndex={activeBand === index ? 0 : -1} onClick={() => setActiveBand(index)} onKeyDown={handleKeyDown}>{activeBand === index ? <motion.span className="parent-grade-tab-pill" layoutId="parent-grade-tab-pill" transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }} /> : null}<span>{band.label}</span></button>)}</div>
        <div id="parent-grade-panel" className="parent-grade-panel" role="tabpanel" aria-labelledby={`parent-grade-tab-${activeBand}`} tabIndex={0}>
          <AnimatePresence mode="wait" initial={false}><motion.div key={selectedBand.label} className="parent-grade-panel-content" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? 0.15 : 0.28 }}><div><p className="parent-grade-panel-eyebrow">A few things to explore</p><h3>{selectedBand.label}</h3></div><div className="parent-grade-chip-list">{selectedBand.subjects.map((subject, index) => <motion.span key={subject} layout className="parent-grade-chip" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0.15 : 0.25, delay: reduceMotion ? 0 : index * 0.08 }}><Sparkles aria-hidden="true" />{subject}</motion.span>)}</div></motion.div></AnimatePresence>
        </div>
        <div className="parent-grade-pricing-preview"><p>See current pricing inside your family account.</p><div className="parent-grade-currency" role="group" aria-label="Preview payment currency">{(['NGN', 'USD'] as const).map((code) => <button type="button" key={code} aria-pressed={currency === code} onClick={() => setCurrency(code)}>{code}</button>)}</div><span>{currency} · Preview only · No prices shown</span></div>
      </div>
    </section>
  )
}

const quizOptions = [7, 8, 9, 10]
const correctAnswer = 8

export function ParentQuizShowcase() {
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [result, setResult] = useState<'correct' | 'incorrect' | 'time-up' | null>(null)
  const reduceMotion = usePublicMotionPreference()
  const progress = secondsLeft / 30

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return
    const timeout = window.setTimeout(() => setSecondsLeft((remaining) => Math.max(0, remaining - 1)), 1000)
    return () => window.clearTimeout(timeout)
  }, [isRunning, secondsLeft])

  useEffect(() => {
    if (isRunning && secondsLeft === 0) { setIsRunning(false); setResult('time-up') }
  }, [isRunning, secondsLeft])

  function startDemo() { setSecondsLeft(30); setSelectedAnswer(null); setResult(null); setIsRunning(true) }
  function chooseAnswer(choice: number) {
    if (!isRunning || selectedAnswer !== null) return
    setSelectedAnswer(choice)
    setIsRunning(false)
    setResult(choice === correctAnswer ? 'correct' : 'incorrect')
  }

  return (
    <section className="parent-section parent-quiz-showcase landing-section" aria-labelledby="parent-quiz-title">
      <div className="parent-section-inner parent-quiz-showcase-layout">
        <Reveal><div className="parent-quiz-showcase-copy"><p className="landing-eyebrow">A little brain break</p><h2 id="parent-quiz-title" className="landing-section-title">One quick puzzle. A bright <em className="landing-accent">aha.</em></h2><p className="landing-section-copy">Try a 30-second pattern puzzle. This demo stays in your browser and saves nothing.</p></div></Reveal>
        <div className="parent-quiz-demo-card landing-game">
          <span className="parent-quiz-game-doodle" aria-hidden="true"><Sparkles /></span>
          <div className="parent-quiz-demo-question"><div><span className="parent-quiz-step-label">Your turn · Sample game</span><h3>What comes next? <strong>2, 4, 6, …</strong></h3></div><div className="parent-quiz-ring" role="img" aria-label={`${secondsLeft} seconds remain in the sample quiz`}><svg viewBox="0 0 68 68" aria-hidden="true"><circle className="parent-quiz-ring-track" cx="34" cy="34" r="28" pathLength="1" /><motion.circle className="parent-quiz-ring-fill" cx="34" cy="34" r="28" pathLength="1" initial={false} animate={{ pathLength: progress }} transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: 'easeOut' }} /></svg><span aria-hidden="true">{secondsLeft}</span></div></div>
          {!isRunning && result === null ? <button type="button" className="parent-quiz-start" onClick={startDemo}>Start the game <ArrowRight aria-hidden="true" /></button> : null}
          <div className="parent-quiz-demo-options" role="group" aria-label="Choose the next number in the sample sequence">{quizOptions.map((choice) => { const selected = choice === selectedAnswer; const correct = selected && choice === correctAnswer; const incorrect = selected && choice !== correctAnswer; return <button type="button" key={choice} aria-pressed={selected} disabled={!isRunning || selectedAnswer !== null} onClick={() => chooseAnswer(choice)} className={cn('parent-quiz-demo-option', correct && 'is-correct', incorrect && 'is-incorrect')}>{choice}{correct ? <Check aria-label="Correct answer" /> : null}</button> })}</div>
          <div className="parent-quiz-progress" role="progressbar" aria-label="Sample game time remaining" aria-valuemin={0} aria-valuemax={30} aria-valuenow={secondsLeft}><span style={{ transform: `scaleX(${progress})` }} /></div>
          <p className={cn('parent-quiz-feedback', result && `is-${result}`)} aria-live="polite">{result === 'correct' ? 'That’s right. The pattern adds two.' : result === 'incorrect' ? 'Not quite. The next number is 8.' : result === 'time-up' ? 'Time is up. Take a breath and try again.' : isRunning ? 'Choose the number that fits.' : 'Start whenever you’re ready.'}</p>
          {result ? <button type="button" className="parent-quiz-retry" onClick={startDemo}><RotateCcw aria-hidden="true" />Try again</button> : null}
        </div>
      </div>
    </section>
  )
}
