'use client'

import { motion } from 'motion/react'
import { useReducedMotionPreference } from '@/lib/motion'

type WordRevealProps = {
  text: string
  highlight?: string
}

export function WordReveal({ text, highlight = '' }: WordRevealProps) {
  const reduceMotion = useReducedMotionPreference()
  const normalizeWord = (word: string) => word.replace(/[.,!?]/g, '').toLowerCase()
  const highlightedWords = new Set(highlight.split(/\s+/).filter(Boolean).map(normalizeWord))
  const words = text.split(/\s+/)

  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="word-reveal-visual" aria-hidden="true">
        {words.map((word, index) => (
          <span className="word-reveal-mask" key={`${word}-${index}`}>
            <motion.span
              className={highlightedWords.has(normalizeWord(word)) ? 'word-reveal-word is-highlighted' : 'word-reveal-word'}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: '110%' }}
              animate={{ opacity: 1, y: '0%' }}
              transition={reduceMotion ? { duration: 0.15, delay: index * 0.015 } : { duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    </>
  )
}
