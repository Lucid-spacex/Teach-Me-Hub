import { TutorHero } from '@/components/public/TutorHero'
import {
  TutorApplicationSteps,
  TutorBenefits,
  TutorClosing,
  TutorFaq,
  TutorRequirements,
  TutorTrust,
} from '@/components/public/TutorSections'
import { PublicShell } from '@/components/public/PublicShell'

export function TutorLanding() {
  return (
    <PublicShell audience="tutors">
      <div className="tutor-page">
        <TutorHero />
        <TutorBenefits />
        <TutorApplicationSteps />
        <TutorRequirements />
        <TutorTrust />
        <TutorFaq />
        <TutorClosing />
      </div>
    </PublicShell>
  )
}
