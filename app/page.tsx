'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import Homepage from '@/components/home/Homepage'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user) return
    const role = getUserRole()
    const destinations = { PARENT: '/parent', TUTOR: '/tutor', ADMIN: '/admin', STUDENT: '/student' } as const
    if (role && destinations[role as keyof typeof destinations]) router.push(destinations[role as keyof typeof destinations])
  }, [router])

  return <Homepage />
}
