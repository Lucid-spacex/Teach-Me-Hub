'use client'

import { PublicShell } from '@/components/public/PublicShell'
import { KidsHero } from '@/components/public/KidsHero'
import { KidsClassSteps, KidsSubjects, KidsSafety, KidsGrownUpHandoff, KidsFaq, KidsClosing } from '@/components/public/KidsSections'
import { KidsSampleStats } from '@/components/public/KidsSampleStats'
import { KidsQuickQuiz } from '@/components/public/KidsQuickQuiz'

export function KidsLanding() {
  return (
    <PublicShell audience="kids">
      <div className="kids-page">
        <KidsHero />
        <KidsClassSteps />
        <KidsSubjects />
        <KidsSampleStats />
        <KidsQuickQuiz />
        <KidsSafety />
        <KidsGrownUpHandoff />
        <KidsFaq />
        <KidsClosing />
      </div>
    </PublicShell>
  )
}
