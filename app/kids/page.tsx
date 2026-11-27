import type { Metadata } from 'next'
import { KidsLanding } from '@/components/public/KidsLanding'

export const metadata: Metadata = {
  title: 'For Kids | TeachMeNest',
  description: 'A friendly guide for students learning with their parent or caregiver and tutor.',
}

export default function KidsPage() {
  return <KidsLanding />
}
