'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { Footer, FeatureBento, Hero, HowItWorks, Nav, ProgressQuiz, Roles, SocialProofAndPricing, TrustStrip, WhySection } from './HomeSections'

export function Homepage() {
  const router = useRouter()
  const [dark, setDark] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    return () => document.documentElement.classList.remove('dark')
  }, [dark])

  return <div className="min-h-screen overflow-x-hidden bg-white text-[#171715] transition-colors dark:bg-[#11110f] dark:text-white">
    <div className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-[#F3C33F]" style={{ transform: `scaleX(${progress / 100})` }} aria-hidden="true" />
    <div className="fixed bottom-5 right-5 z-50"><button onClick={() => setDark(!dark)} className="grid size-11 place-items-center rounded-full border border-black/10 bg-white/85 text-black shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#22221d] dark:text-white" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button></div>
    <Nav go={(path) => router.push(path)} />
    <main><Hero go={(path) => router.push(path)} /><TrustStrip /><WhySection /><HowItWorks /><FeatureBento /><Roles /><ProgressQuiz /><SocialProofAndPricing go={(path) => router.push(path)} /></main>
    <Footer />
  </div>
}

export default Homepage
