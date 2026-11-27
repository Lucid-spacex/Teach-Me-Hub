'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/public/Reveal'
import { useReducedMotionPreference } from '@/lib/motion'

const choices = [2, 3, 4, 5]
const answer = 3

export function KidsQuickQuiz() {
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(false)
  const [selection, setSelection] = useState<number | null>(null)
  const [result, setResult] = useState<'correct' | 'try-again' | 'time-up' | null>(null)
  const reduceMotion = useReducedMotionPreference()

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return
    const timeout = window.setTimeout(() => setSecondsLeft((remaining) => Math.max(0, remaining - 1)), 1000)
    return () => window.clearTimeout(timeout)
  }, [isRunning, secondsLeft])

  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false)
      setResult('time-up')
    }
  }, [isRunning, secondsLeft])

  function startAgain() {
    setSecondsLeft(30)
    setSelection(null)
    setResult(null)
    setIsRunning(true)
  }

  function chooseOption(option: number) {
    if (!isRunning || selection !== null) return
    setSelection(option)
    setIsRunning(false)
    setResult(option === answer ? 'correct' : 'try-again')
  }

  const progress = secondsLeft / 30

  return (
    <section id="quick-quiz" className="kids-section kids-quiz" aria-labelledby="kids-quiz-title">
      <div className="kids-section-inner kids-quiz-layout">
        <Reveal><div className="kids-quiz-copy"><p className="kids-eyebrow"><Sparkles className="size-4" aria-hidden="true" /> Quick brain break</p><h2 id="kids-quiz-title" className="kids-section-title">Ready for a tiny challenge?</h2><p className="kids-section-intro">Try this little question. It&apos;s just for fun—there are no points on your account.</p><div className="kids-quiz-callout"><span className="kids-quiz-dot" aria-hidden="true" /> 30-second sample challenge</div></div></Reveal>
        <div className="kids-quiz-card">
          <div className="kids-quiz-card-top"><span>Mini quiz</span><span className="kids-sample-tag">Sample</span></div>
          <div className="kids-quiz-question-row"><div><p className="kids-quiz-progress-label">Question 1 <span>of 1</span></p><h3>How many sides does a triangle have?</h3></div><div className="kids-quiz-timer" role="img" aria-label={`${secondsLeft} seconds left in the sample quiz`}><svg viewBox="0 0 60 60" aria-hidden="true"><circle className="kids-quiz-timer-track" cx="30" cy="30" r="25" pathLength="1" /><motion.circle className="kids-quiz-timer-fill" cx="30" cy="30" r="25" pathLength="1" initial={false} animate={{ pathLength: progress }} transition={{ duration: reduceMotion ? 0.15 : 0.45, ease: 'easeOut' }} /></svg><span aria-hidden="true">0:{String(secondsLeft).padStart(2, '0')}</span></div></div>
          {!isRunning && result === null ? <button type="button" className="kids-quiz-start" onClick={startAgain}>Start the 30-second challenge <ArrowRight className="size-4" aria-hidden="true" /></button> : null}
          <div className="kids-quiz-options" role="group" aria-label="Choose the number of sides">
            {choices.map((choice) => {
              const selected = selection === choice
              const isCorrect = selected && choice === answer
              const isIncorrect = selected && choice !== answer
              return <button key={choice} type="button" disabled={!isRunning || selection !== null} aria-pressed={selected} onClick={() => chooseOption(choice)} className={cn('kids-quiz-option', selected && 'is-selected', isCorrect && 'is-correct', isIncorrect && 'is-incorrect')}><span>{choice}</span>{isCorrect ? <span className="kids-quiz-option-feedback">That&apos;s right!</span> : null}{isIncorrect ? <span className="kids-quiz-option-feedback">Not quite</span> : null}</button>
            })}
          </div>
          <p className={cn('kids-quiz-message', result === 'correct' && 'is-correct', result === 'try-again' && 'is-incorrect', result === 'time-up' && 'is-time-up')} aria-live="polite">{result === 'correct' ? 'You got it! A triangle has three sides.' : result === 'try-again' ? 'Good try. A triangle has three sides—give the quiz another go.' : result === 'time-up' ? 'Time is up. No worries—you can try again whenever you like.' : isRunning ? 'Pick the answer that feels right.' : 'Start whenever you’re ready.'}</p>
          {result ? <button type="button" className="kids-quiz-again" onClick={startAgain}><RotateCcw className="size-4" aria-hidden="true" /> Try again</button> : null}
        </div>
      </div>
    </section>
  )
}
