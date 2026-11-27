import { ArrowDownRight, BookOpen, Check, CircleHelp, Compass, GraduationCap, Heart, Lightbulb, MessageCircle, NotebookPen, Paintbrush, Play, Sparkles, Sprout, Star, Users, Video } from 'lucide-react'

export function ParentLearningPreview() {
  return (
    <div className="parent-preview-card" aria-label="Sample learning progress view" role="img">
      <div className="parent-preview-topline">
        <span className="parent-preview-avatar"><Sprout className="size-5" aria-hidden="true" /></span>
        <div><span className="parent-preview-name">A little progress, week by week</span><span className="parent-preview-caption">A sample learning snapshot</span></div>
        <span className="parent-preview-more" aria-hidden="true">···</span>
      </div>
      <div className="parent-preview-highlight">
        <div><span className="parent-preview-label">This week’s focus</span><strong>Reading with confidence</strong></div>
        <span className="parent-preview-open"><ArrowDownRight className="size-4" aria-hidden="true" /></span>
      </div>
      <div className="parent-preview-lines">
        <div><span>Session notes</span><span className="parent-preview-pill">Ready to read</span></div>
        <div className="parent-preview-line"><i className="parent-preview-line-fill" /></div>
        <div><span>Practice together</span><span>One small step</span></div>
        <div className="parent-preview-line"><i className="parent-preview-line-fill parent-preview-line-short" /></div>
      </div>
      <div className="parent-preview-footer"><span><Check className="size-3.5" aria-hidden="true" /> Shared with your learning team</span><span>Sample</span></div>
    </div>
  )
}

export function TutorWeekPreview() {
  return (
    <div className="tutor-week-preview" aria-label="Illustrative tutor schedule for a sample week" role="img">
      <div className="tutor-week-header"><div><span className="tutor-week-kicker">Your teaching week</span><strong>Plan with a little more breathing room</strong></div><span className="tutor-week-spark"><Sparkles className="size-4" aria-hidden="true" /></span></div>
      <div className="tutor-week-days" aria-hidden="true"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span></div>
      <div className="tutor-week-grid" aria-hidden="true">
        <span className="tutor-time">09:00</span><span className="tutor-schedule-block tutor-schedule-teal">Maths<span>Sample session</span></span><span /><span className="tutor-schedule-block tutor-schedule-gold">Reading<span>Sample session</span></span><span />
        <span className="tutor-time">11:00</span><span /><span className="tutor-schedule-block tutor-schedule-lilac">Science<span>Sample session</span></span><span /><span className="tutor-schedule-block tutor-schedule-teal">Maths<span>Sample session</span></span>
        <span className="tutor-time">14:00</span><span className="tutor-schedule-block tutor-schedule-lilac">Science<span>Sample session</span></span><span /><span className="tutor-schedule-block tutor-schedule-gold">Reading<span>Sample session</span></span><span />
      </div>
      <div className="tutor-week-footer"><span className="tutor-week-dot" /> Sample week · Your schedule, your pace</div>
    </div>
  )
}

export function KidsLearningScene() {
  return (
    <div className="kids-learning-scene" aria-hidden="true">
      <span className="kids-scene-star kids-scene-star-one"><Star className="size-5 fill-current" /></span>
      <span className="kids-scene-star kids-scene-star-two"><Sparkles className="size-5" /></span>
      <div className="kids-scene-sun" />
      <div className="kids-scene-orbit kids-scene-orbit-one" />
      <div className="kids-scene-orbit kids-scene-orbit-two" />
      <div className="kids-scene-book"><BookOpen className="size-16" strokeWidth={1.4} /><span>one page<br />at a time</span></div>
      <div className="kids-scene-card kids-scene-card-left"><span><Lightbulb className="size-4" /></span><strong>Curious</strong><small>is a superpower</small></div>
      <div className="kids-scene-card kids-scene-card-right"><span><Paintbrush className="size-4" /></span><strong>Try again</strong><small>that’s how we grow</small></div>
      <div className="kids-scene-sticker"><Heart className="size-4 fill-current" /><span>You’ve got this!</span></div>
      <span className="kids-scene-dot kids-scene-dot-one" />
      <span className="kids-scene-dot kids-scene-dot-two" />
      <span className="kids-scene-dot kids-scene-dot-three" />
    </div>
  )
}

export function LearningNotebook() {
  return (
    <div className="learning-notebook" aria-hidden="true">
      <div className="notebook-page">
        <div className="notebook-top"><span><NotebookPen className="size-4" /> Your learning plan</span><span className="notebook-sample">Sample</span></div>
        <div className="notebook-title">Small steps<br />add up.</div>
        <div className="notebook-progress-row"><span className="notebook-progress-icon"><Play className="size-3.5 fill-current" /></span><span><strong>Practice that fits your week</strong><small>One session at a time</small></span><span className="notebook-check"><Check className="size-4" /></span></div>
        <div className="notebook-progress-row"><span className="notebook-progress-icon notebook-progress-icon-blue"><MessageCircle className="size-3.5" /></span><span><strong>Share what’s working</strong><small>Keep your team in the loop</small></span><span className="notebook-check"><Check className="size-4" /></span></div>
      </div>
      <span className="notebook-flower"><Sparkles className="size-5" /></span>
      <span className="notebook-doodle"><CircleHelp className="size-5" /></span>
    </div>
  )
}

export function TutorSupportCard() {
  return (
    <div className="tutor-support-card" aria-hidden="true">
      <div className="tutor-support-header"><span className="tutor-support-mark"><GraduationCap className="size-5" /></span><div><strong>Good teaching deserves good support.</strong><span>Built for the people behind every breakthrough.</span></div></div>
      <div className="tutor-support-items"><span><Users className="size-4" /> A team that has your back</span><span><Compass className="size-4" /> Clear tools for your teaching day</span><span><Video className="size-4" /> Flexible online sessions</span></div>
    </div>
  )
}
