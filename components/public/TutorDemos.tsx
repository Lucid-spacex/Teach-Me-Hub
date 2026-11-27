'use client'

import { useState, type KeyboardEvent } from 'react'
import { CalendarDays, Check, ClipboardCheck, GraduationCap, MessageCircle, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Reveal } from '@/components/public/Reveal'
import { useReducedMotionPreference } from '@/lib/motion'

const tabs = [
  { id: 'schedule', label: 'Schedule', icon: CalendarDays, title: 'A teaching week, at a glance', lines: ['Monday · 9:00 AM · Europe/London', 'Wednesday · 11:30 AM · Africa/Lagos', 'Friday · 4:00 PM · America/New_York'], footnote: 'Sample schedule · Times shown in their listed timezone' },
  { id: 'students', label: 'Students', icon: Users, title: 'Learner context before the lesson', lines: ['Learning focus · Sample', 'Recent note · Ready for a new example', 'Next step · Ask a question together'], footnote: 'Sample learner view · No real student data' },
  { id: 'scoring', label: 'Scoring', icon: ClipboardCheck, title: 'Give clear feedback on practice', lines: ['Homework 3 · 8/10 · Sample', 'Feedback · Show the working step by step', 'Status · Ready for review'], footnote: 'Sample scores · No live grade data' },
  { id: 'grades', label: 'Grades', icon: GraduationCap, title: 'Keep grade review in the loop', lines: ['Draft grade · Sample', 'Review · Sent to admin', 'Parent view · After admin review'], footnote: 'Sample grade workflow · Every grade is reviewed by an admin' },
]

function DashboardPanel({ activeId }: { activeId: string }) {
  const tab = tabs.find((item) => item.id === activeId) ?? tabs[0]
  const Icon = tab.icon
  const reduceMotion = useReducedMotionPreference()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={tab.id} className="tutor-dashboard-panel" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? 0.15 : 0.25 }}>
        <div className="tutor-dashboard-panel-head"><span className="tutor-dashboard-panel-icon"><Icon className="size-5" aria-hidden="true" /></span><span className="tutor-sample-badge">Sample</span></div>
        <h3>{tab.title}</h3>
        <div className="tutor-dashboard-lines">{tab.lines.map((line, index) => <div className="tutor-dashboard-line" key={line}><span className="tutor-dashboard-line-index">0{index + 1}</span><span>{line}</span>{tab.id === 'grades' && index === 1 ? <Check className="size-4" aria-label="Sent to admin" /> : null}</div>)}</div>
        <p className="tutor-dashboard-footnote">{tab.footnote}</p>
      </motion.div>
    </AnimatePresence>
  )
}

export function TutorDayInLife() {
  const [activeTab, setActiveTab] = useState('schedule')
  const reduceMotion = useReducedMotionPreference()

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
    let nextIndex = currentIndex
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1
    if (nextIndex !== currentIndex) {
      event.preventDefault()
      setActiveTab(tabs[nextIndex].id)
      document.getElementById(`tutor-tab-${tabs[nextIndex].id}`)?.focus()
    }
  }

  return (
    <section className="tutor-section tutor-day-in-life" aria-labelledby="tutor-day-title">
      <div className="tutor-section-inner">
        <Reveal><div className="tutor-day-heading"><div><p className="tutor-eyebrow">A teaching day, your way</p><h2 id="tutor-day-title" className="tutor-section-title">Keep the useful details close.</h2></div><p className="tutor-section-intro">Explore a sample workspace with the core tools that support a tutor’s day.</p></div></Reveal>
        <div className="tutor-dashboard-browser">
          <div className="tutor-browser-bar"><span className="tutor-browser-dots" aria-hidden="true"><i /><i /><i /></span><span className="tutor-browser-title">Tutor workspace · Sample</span><span className="tutor-sample-badge">Preview</span></div>
          <div className="tutor-dashboard-layout">
            <div className="tutor-dashboard-tabs" role="tablist" aria-label="Sample tutor workspace" aria-orientation="horizontal">
              {tabs.map(({ id, label, icon: Icon }) => <button id={`tutor-tab-${id}`} key={id} type="button" role="tab" aria-controls="tutor-tabpanel" aria-selected={activeTab === id} tabIndex={activeTab === id ? 0 : -1} className="tutor-dashboard-tab" onClick={() => setActiveTab(id)} onKeyDown={handleTabKeyDown}><Icon className="size-4" aria-hidden="true" />{label}{activeTab === id ? <motion.span className="tutor-tab-underline" layoutId="tutor-tab-underline" transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }} /> : null}</button>)}
            </div>
            <div id="tutor-tabpanel" className="tutor-dashboard-content" role="tabpanel" aria-labelledby={`tutor-tab-${activeTab}`} tabIndex={0}><DashboardPanel activeId={activeTab} /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
