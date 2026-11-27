import { ParentHero } from '@/components/public/ParentHero'
import { ParentGradeBands, ParentWorldClock } from '@/components/public/ParentDemos'
import { ParentFeatureList } from '@/components/public/ParentShowcase'
import {
  ParentApproach,
  ParentFaq,
  ParentPrinciples,
  ParentSafety,
  ParentStories,
  ParentClosingCta,
} from '@/components/public/ParentSections'
import { PublicShell } from '@/components/public/PublicShell'

export function ParentLanding() {
  return (
    <PublicShell audience="parents">
      <div className="parent-page adult-landing">
        <ParentHero />
        <ParentPrinciples />
        <ParentApproach />
        <ParentFeatureList />
        <ParentWorldClock />
        <ParentGradeBands />
        <ParentSafety />
        <ParentStories />
        <ParentFaq />
        <ParentClosingCta />
      </div>
    </PublicShell>
  )
}
