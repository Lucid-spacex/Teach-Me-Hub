'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const role = getUserRole()
    if (role === 'PARENT') {
      router.push('/parent')
    } else if (role === 'TUTOR') {
      router.push('/tutor')
    } else if (role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  )
}
