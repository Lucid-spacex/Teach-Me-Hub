'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Compass, Globe2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LearningNotebook, ParentLearningPreview, TutorWeekPreview } from '@/components/public/LandingIllustrations'
import { Reveal } from '@/components/public/Reveal'

const demoViews = [
  { label: 'Family overview', title: 'See the week at a glance.', copy: 'A sample view of learning notes and the next small step.', render: <ParentLearningPreview /> },
  { label: 'Tutor schedule', title: 'Make room for a steady rhythm.', copy: 'A sample timetable helps show how a learning week might take shape.', render: <TutorWeekPreview /> },
  { label: 'Learning plan', title: 'Keep the plan close to the learner.', copy: 'A sample notebook for goals, practice, and the ideas worth remembering.', render: <LearningNotebook /> },
]

const clockCities = [
  { city: 'London', zone: 'Europe/London' },
  { city: 'Accra', zone: 'Africa/Accra' },
  { city: 'Lagos', zone: 'Africa/Lagos' },
  { city: 'Nairobi', zone: 'Africa/Nairobi' },
  { city: 'Dubai', zone: 'Asia/Dubai' },
  { city: 'New York', zone: 'America/New_York' },
]

const sampleSessions = [
  { day: 1, time: '4:00 pm', subject: 'Reading practice', tone: 'reading' },
  { day: 2, time: '5:30 pm', subject: 'Maths check-in', tone: 'maths' },
  { day: 4, time: '4:30 pm', subject: 'Science questions', tone: 'science' },
]

const finderQuestions = [
  { prompt: 'What would feel most useful to explore first?', options: ['A school subject', 'More confidence', 'A calmer study routine'] },
  { prompt: 'When could learning fit into your family rhythm?', options: ['After school', 'At the weekend', 'We are still figuring that out'] },
  { prompt: 'What kind of support sounds right today?', options: ['One-to-one guidance', 'A little practice between lessons', 'A conversation with a tutor'] },
]

function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, options).format(date)
}

function startOfWeek(date: Date) {
  const day = date.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function shiftDays(date: Date, amount: number) {
  const shifted = new Date(date)
  shifted.setDate(shifted.getDate() + amount)
  return shifted
}

export function ParentDemos() {
  const [activeView, setActiveView] = useState(0)
  const selectedView = demoViews[activeView]

  return (
    <section id="features" className="parent-section parent-feature-tour" aria-labelledby="parent-feature-title">
      <div className="parent-section-inner">
        <Reveal>
          <div className="parent-feature-heading">
            <div><p className="public-eyebrow">A look inside the learning space</p><h2 id="parent-feature-title" className="parent-section-title">Useful details, without the noise.</h2></div>
            <p className="parent-section-intro">Explore sample screens for the people and routines around a learner. These are examples, not live account data.</p>
          </div>
        </Reveal>
        <div className="parent-feature-layout">
          <div className="parent-feature-copy">
            <div className="parent-feature-tabs" role="group" aria-label="Choose a sample learning view">
              {demoViews.map((view, index) => (
                <button
                  key={view.label}
                  type="button"
                  className="parent-feature-tab"
                  aria-pressed={activeView === index}
                  onClick={() => setActiveView(index)}
                >
                  <span className="parent-feature-tab-index">0{index + 1}</span>{view.label}
                </button>
              ))}
            </div>
            <div className="parent-feature-description" aria-live="polite" aria-atomic="true">
              <span className="parent-feature-kicker"><Check className="size-4" aria-hidden="true" /> Sample view</span>
              <h3>{selectedView.title}</h3>
              <p>{selectedView.copy}</p>
              <Link href="/register" className="public-text-link">Explore the family portal <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="parent-feature-preview" aria-live="polite" aria-atomic="true">
            <div className="parent-feature-preview-top"><span className="parent-feature-preview-dot" aria-hidden="true" /><span>{selectedView.label} · Sample</span><span className="parent-feature-preview-spacer" /><Sparkles className="size-4" aria-hidden="true" /></div>
            <div className="parent-feature-preview-body" key={selectedView.label}>{selectedView.render}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ParentWorldClock() {
  const [timestamp, setTimestamp] = useState<number | null>(null)

  useEffect(() => {
    const updateClock = () => setTimestamp(Date.now())
    updateClock()
    const interval = window.setInterval(updateClock, 30_000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <section className="parent-world-section" aria-labelledby="parent-world-title">
      <div className="parent-world-inner">
        <Reveal>
          <div className="parent-world-copy">
            <p className="public-eyebrow">Learning has no one time zone</p>
            <h2 id="parent-world-title" className="parent-section-title">Wherever your family is, find your local time.</h2>
            <p className="parent-section-intro">Use these live clocks as a simple timezone reference when planning a conversation about learning.</p>
            <span className="parent-world-note"><Clock3 className="size-4" aria-hidden="true" /> Live local times · sample reference only</span>
          </div>
        </Reveal>
        <div className="parent-world-board">
          <div className="parent-world-globe" aria-hidden="true"><Globe2 className="size-16" strokeWidth={1} /><span /><span /><span /></div>
          <div className="parent-world-cities">
            {clockCities.map(({ city, zone }) => {
              const time = timestamp === null ? '--:--' : new Intl.DateTimeFormat(undefined, { timeZone: zone, hour: 'numeric', minute: '2-digit' }).format(timestamp)
              const day = timestamp === null ? '' : new Intl.DateTimeFormat(undefined, { timeZone: zone, weekday: 'short' }).format(timestamp)
              return (
                <div className="parent-world-city" key={city}>
                  <span className="parent-world-city-dot" aria-hidden="true" />
                  <span className="parent-world-city-name">{city}<small>{day || 'Local time'}</small></span>
                  <time className="parent-world-city-time" dateTime={timestamp === null ? undefined : new Date(timestamp).toISOString()} aria-label={`${city} local time`}>{time}</time>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ParentSampleWeek() {
  const [weekStart, setWeekStart] = useState<Date | null>(null)

  useEffect(() => {
    setWeekStart(startOfWeek(new Date()))
  }, [])

  function shiftWeek(direction: number) {
    setWeekStart((current) => current ? shiftDays(current, direction * 7) : current)
  }

  const weekEnd = weekStart ? shiftDays(weekStart, 6) : null
  const rangeLabel = weekStart && weekEnd
    ? `${formatDate(weekStart, { month: 'short', day: 'numeric' })} – ${formatDate(weekEnd, { month: 'short', day: 'numeric' })}`
    : 'Current week'

  return (
    <section className="parent-section parent-sample-week" aria-labelledby="parent-week-title">
      <div className="parent-section-inner parent-week-layout">
        <Reveal>
          <div className="parent-week-copy">
            <p className="public-eyebrow">Make room for a rhythm</p>
            <h2 id="parent-week-title" className="parent-section-title">A week that moves with your family.</h2>
            <p className="parent-section-intro">Step through a sample calendar to see how lessons and practice can sit alongside everyday life.</p>
            <div className="parent-week-sample-note"><CalendarDays className="size-4" aria-hidden="true" /><span>Sample schedule · No real bookings or learner information</span></div>
            <Link href="/register" className="public-text-link">Plan with your family account <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </Reveal>
        <div className="parent-calendar-card" role="group" aria-label="Sample week calendar">
          <div className="parent-calendar-header">
            <div><span className="parent-calendar-kicker">Family planner</span><h3>One week at a time</h3></div>
            <span className="parent-calendar-sample">Sample</span>
          </div>
          <div className="parent-calendar-controls">
            <p className="parent-calendar-range" aria-live="polite">{rangeLabel}</p>
            <div className="parent-calendar-buttons">
              <button type="button" className="parent-calendar-button" aria-label="Previous sample week" disabled={!weekStart} onClick={() => shiftWeek(-1)}><ArrowLeft className="size-4" aria-hidden="true" /></button>
              <button type="button" className="parent-calendar-button" aria-label="Next sample week" disabled={!weekStart} onClick={() => shiftWeek(1)}><ArrowRight className="size-4" aria-hidden="true" /></button>
            </div>
          </div>
          <div className="parent-calendar-grid">
            {Array.from({ length: 7 }, (_, index) => {
              const date = weekStart ? shiftDays(weekStart, index) : null
              const event = sampleSessions.find((session) => session.day === index)
              const dayName = date ? formatDate(date, { weekday: 'short' }) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]
              return (
                <div className={cn('parent-calendar-day', event && `has-${event.tone}`)} key={index}>
                  <span className="parent-calendar-day-name">{dayName}</span>
                  <span className="parent-calendar-date">{date ? formatDate(date, { day: 'numeric' }) : '—'}</span>
                  {event ? <span className="parent-calendar-event"><small>{event.time}</small>{event.subject}</span> : <span className="parent-calendar-empty">Open</span>}
                </div>
              )
            })}
          </div>
          <p className="parent-calendar-footer"><span className="parent-calendar-key" aria-hidden="true" /> Example sessions · Change weeks to explore the calendar</p>
        </div>
      </div>
    </section>
  )
}

export function ParentFinderQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const isComplete = step >= finderQuestions.length
  const question = finderQuestions[step]
  const selectedAnswer = answers[step]
  const progress = isComplete ? 100 : Math.round((step / finderQuestions.length) * 100)

  function chooseAnswer(answer: string) {
    setAnswers((current) => {
      const next = [...current]
      next[step] = answer
      return next
    })
  }

  function continueQuiz() {
    if (!selectedAnswer) return
    setStep((current) => current + 1)
  }

  function resetQuiz() {
    setAnswers([])
    setStep(0)
  }

  return (
    <section className="parent-section parent-finder" aria-labelledby="parent-finder-title">
      <div className="parent-section-inner parent-finder-layout">
        <Reveal>
          <div className="parent-finder-intro">
            <p className="public-eyebrow">A small starting point</p>
            <h2 id="parent-finder-title" className="parent-section-title">Not sure where to begin?</h2>
            <p className="parent-section-intro">Pick a few things that feel true today. This quick guide stays in your browser and does not save your answers.</p>
            <div className="parent-finder-hint"><Compass className="size-5" aria-hidden="true" /><span>No perfect answers. Just a way to start the conversation.</span></div>
          </div>
        </Reveal>
        <div className="parent-quiz-card">
          <div className="parent-quiz-header">
            <span className="parent-quiz-kicker">Parent pathfinder · Sample guide</span>
            <span className="parent-quiz-count">{isComplete ? 'Summary' : `Step ${step + 1} of ${finderQuestions.length}`}</span>
          </div>
          <div className="parent-quiz-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
          {!isComplete && question ? (
            <div className="parent-quiz-body" aria-live="polite" aria-atomic="true">
              <h3>{question.prompt}</h3>
              <div className="parent-quiz-options" role="group" aria-label={question.prompt}>
                {question.options.map((option) => (
                  <button type="button" key={option} className={cn('parent-quiz-option', selectedAnswer === option && 'is-selected')} aria-pressed={selectedAnswer === option} onClick={() => chooseAnswer(option)}>
                    <span>{option}</span><span className="parent-quiz-option-mark" aria-hidden="true">{selectedAnswer === option ? <Check className="size-4" /> : <span />}</span>
                  </button>
                ))}
              </div>
              <div className="parent-quiz-actions">
                <button type="button" className="parent-quiz-back" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</button>
                <button type="button" className="public-button public-button-primary" disabled={!selectedAnswer} onClick={continueQuiz}>{step === finderQuestions.length - 1 ? 'See my summary' : 'Next'}<ArrowRight className="size-4" aria-hidden="true" /></button>
              </div>
            </div>
          ) : (
            <div className="parent-quiz-result" aria-live="polite">
              <span className="parent-quiz-result-icon"><Sparkles className="size-5" aria-hidden="true" /></span>
              <h3>A good first conversation can start here.</h3>
              <p>Your first focus: <strong>{answers[0]}</strong>. Share this with a parent or caregiver and explore the next step together.</p>
              <div className="parent-quiz-result-actions"><Link href="/register" className="public-button public-button-primary">Explore registration <ArrowRight className="size-4" aria-hidden="true" /></Link><button type="button" className="parent-quiz-back" onClick={resetQuiz}>Start again</button></div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
