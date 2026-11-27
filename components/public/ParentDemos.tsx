'use client'

import { useState, type KeyboardEvent } from 'react'

const cities = [
  { city: 'New York', zone: 'America/New_York' },
  { city: 'London', zone: 'Europe/London' },
  { city: 'Dubai', zone: 'Asia/Dubai' },
]

export function ParentWorldClock() {
  return (
    <section className="adult-section adult-timezones" aria-labelledby="parent-timezones-title">
      <div className="adult-section-inner adult-timezones-layout">
        <div>
          <p className="adult-eyebrow">Sample time zones</p>
          <h2 id="parent-timezones-title">A shared lesson, across <em className="adult-accent">borders.</em></h2>
          <p className="adult-section-copy">Class times are presented in each participant&apos;s local time.</p>
        </div>
        <ol className="adult-timezone-timeline" aria-label="Sample cities and time zones">
          {cities.map((place, index) => (
            <li key={place.city}>
              <span className="adult-timezone-index">0{index + 1}</span>
              <h3>{place.city}</h3>
              <p>{place.zone.replaceAll('_', ' ')}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const gradeBands = [
  { label: 'Preschool–Grade 1', subjects: ['Early reading', 'Number sense', 'Patterns', 'Creative projects'] },
  { label: 'Grades 2–4', subjects: ['Reading and writing', 'Multiplication', 'Science', 'Study skills'] },
  { label: 'Grades 5–8', subjects: ['Fractions and algebra', 'Essay writing', 'Life science', 'Coding'] },
  { label: 'Grades 9–12', subjects: ['Advanced mathematics', 'Literature', 'Lab sciences', 'Exam preparation'] },
]

export function ParentGradeBands() {
  const [activeBand, setActiveBand] = useState(0)
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
      document.getElementById(`adult-grade-tab-${nextIndex}`)?.focus()
    }
  }

  return (
    <section id="subjects" className="adult-section adult-subjects" aria-labelledby="parent-subjects-title">
      <div className="adult-section-inner">
        <div className="adult-section-heading">
          <p className="adult-eyebrow">Subjects and grade bands</p>
          <h2 id="parent-subjects-title">A curriculum for each learner&apos;s next <em className="adult-accent">step.</em></h2>
          <p className="adult-section-copy">Explore examples by grade band. Subject availability can vary.</p>
        </div>
        <div className="adult-grade-tabs" role="tablist" aria-label="Choose a grade band">
          {gradeBands.map((band, index) => (
            <button
              key={band.label}
              id={`adult-grade-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={activeBand === index}
              aria-controls="adult-grade-panel"
              tabIndex={activeBand === index ? 0 : -1}
              onClick={() => setActiveBand(index)}
              onKeyDown={handleKeyDown}
            >{band.label}</button>
          ))}
        </div>
        <div id="adult-grade-panel" className="adult-grade-panel" role="tabpanel" aria-labelledby={`adult-grade-tab-${activeBand}`} tabIndex={0}>
          <p className="adult-grade-panel-label">Example subjects and skills</p>
          <h3>{selectedBand.label}</h3>
          <ul>{selectedBand.subjects.map((subject) => <li key={subject}>{subject}</li>)}</ul>
        </div>
      </div>
    </section>
  )
}
