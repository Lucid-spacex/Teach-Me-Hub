'use client'

import { getUser, getUserRole } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { TutorStatusScreen } from '@/components/tutor/TutorStatusScreen'

export default function TutorPendingPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    // If tutor is not pending, redirect to appropriate page
    if (user.status !== 'PENDING_VETTING') {
      if (user.status === 'REJECTED') {
        router.push('/tutor/rejected')
      } else {
        router.push('/tutor')
      }
    }
  }, [router])

  // Don't use layout for restricted pages
  return (
    <div className="min-h-screen bg-background">
      <TutorStatusScreen status="PENDING_VETTING" />
    </div>
  )
}
