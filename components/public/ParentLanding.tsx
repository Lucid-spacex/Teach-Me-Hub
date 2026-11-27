import { ParentHero } from '@/components/public/ParentHero'
import { ParentDemos, ParentFinderQuiz, ParentWorldClock } from '@/components/public/ParentDemos'
import {
  ParentApproach,
  ParentBenefits,
  ParentClosingCta,
  ParentFaq,
  ParentPromiseStrip,
  ParentStories,
  ParentSubjectExplorer,
} from '@/components/public/ParentSections'
import { PublicShell } from '@/components/public/PublicShell'

export function ParentLanding() {
  return (
    <PublicShell audience="parents">
      <div className="parent-page">
        <ParentHero />
        <ParentPromiseStrip />
        <ParentApproach />
        <ParentDemos />
        <ParentBenefits />
        <ParentWorldClock />
        <ParentSubjectExplorer />
        <ParentFinderQuiz />
        <ParentStories />
        <ParentFaq />
        <ParentClosingCta />
      </div>
    </PublicShell>
  )
}
