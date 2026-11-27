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
    if (secondsLeft === 0 && isRunning) { setIsRunning(false); setResult('time-up') }
  }, [isRunning, secondsLeft])

  function startAgain() { setSecondsLeft(30); setSelection(null); setResult(null); setIsRunning(true) }
  function chooseOption(option: number) {
    if (!isRunning || selection !== null) return
    setSelection(option)
    setIsRunning(false)
    setResult(option === answer ? 'correct' : 'try-again')
  }

  const progress = secondsLeft / 30

  return (
    <section id="quick-quiz" className="kids-section kids-quiz landing-section" aria-labelledby="kids-quiz-title">
      <div className="kids-section-inner kids-quiz-layout">
        <Reveal><div className="kids-quiz-copy"><p className="kids-eyebrow">A quick brain break</p><h2 id="kids-quiz-title" className="kids-section-title">Ready for a tiny <em className="landing-accent">challenge?</em></h2><p className="kids-section-intro">Try one fun question. It won’t save a score.</p></div></Reveal>
        <div className="kids-quiz-card kids-game-card">
          <span className="kids-game-spark kids-game-spark-one" aria-hidden="true"><Sparkles /></span>
          <span className="kids-game-label">Your turn!</span>
          <div className="kids-quiz-question-row"><h3>How many sides does a triangle have?</h3><div className="kids-quiz-timer" role="img" aria-label={`${secondsLeft} seconds left in the sample game`}><svg viewBox="0 0 60 60" aria-hidden="true"><circle className="kids-quiz-timer-track" cx="30" cy="30" r="25" pathLength="1" /><motion.circle className="kids-quiz-timer-fill" cx="30" cy="30" r="25" pathLength="1" initial={false} animate={{ pathLength: progress }} transition={{ duration: reduceMotion ? 0.15 : 0.45, ease: 'easeOut' }} /></svg><span aria-hidden="true">{secondsLeft}</span></div></div>
          {!isRunning && result === null ? <button type="button" className="kids-quiz-start" onClick={startAgain}>Start the game <ArrowRight aria-hidden="true" /></button> : null}
          <div className="kids-quiz-options" role="group" aria-label="Choose the number of sides on a triangle">{choices.map((choice) => { const selected = selection === choice; const isCorrect = selected && choice === answer; const isIncorrect = selected && choice !== answer; return <button key={choice} type="button" disabled={!isRunning || selection !== null} aria-pressed={selected} onClick={() => chooseOption(choice)} className={cn('kids-quiz-option', selected && 'is-selected', isCorrect && 'is-correct', isIncorrect && 'is-incorrect')}><span>{choice}</span>{isCorrect ? <span className="kids-quiz-option-feedback">You got it!</span> : null}{isIncorrect ? <span className="kids-quiz-option-feedback">Good try!</span> : null}</button> })}</div>
          <p className={cn('kids-quiz-message', result === 'correct' && 'is-correct', result === 'try-again' && 'is-incorrect', result === 'time-up' && 'is-time-up')} aria-live="polite">{result === 'correct' ? 'Yes! A triangle has three sides.' : result === 'try-again' ? 'A triangle has three sides. Try again!' : result === 'time-up' ? 'Time is up. You can have another go.' : isRunning ? 'Pick the answer you think is right.' : 'There’s no rush. Start when you’re ready.'}</p>
          {result ? <button type="button" className="kids-quiz-again" onClick={startAgain}><RotateCcw aria-hidden="true" /> Play again</button> : null}
        </div>
      </div>
    </section>
  )
}
