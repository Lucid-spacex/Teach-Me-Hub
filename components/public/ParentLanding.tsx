import { ParentHero } from '@/components/public/ParentHero'
import { ParentGradeBands, ParentQuizShowcase, ParentWorldClock } from '@/components/public/ParentDemos'
import { ParentFeatureBento } from '@/components/public/ParentShowcase'
import {
  ParentApproach,
  ParentFaq,
  ParentSafety,
  ParentStories,
  ParentSubjectMarquee,
  ParentTeasers,
  ParentClosingCta,
} from '@/components/public/ParentSections'
import { PublicShell } from '@/components/public/PublicShell'

export function ParentLanding() {
  return (
    <PublicShell audience="parents">
      <div className="parent-page">
        <ParentHero />
        <ParentSubjectMarquee />
        <ParentApproach />
        <ParentFeatureBento />
        <ParentWorldClock />
        <ParentGradeBands />
        <ParentQuizShowcase />
        <ParentSafety />
        <ParentStories />
        <ParentFaq />
        <ParentTeasers />
        <ParentClosingCta />
      </div>
    </PublicShell>
  )
}
