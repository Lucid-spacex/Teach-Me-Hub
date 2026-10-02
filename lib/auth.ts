import { User } from './types'
import { api } from './api'

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    const user = JSON.parse(userStr)
    // Validate that user has required fields
    if (!user || !user.id || !user.role) {
      console.warn('Invalid user data in localStorage')
      return null
    }
    return user
  } catch (err) {
    console.error('Error parsing user from localStorage:', err)
    return null
  }
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('userRole', user.role)
  // Also set role in cookie for middleware access
  document.cookie = `userRole=${user.role}; path=/; max-age=3600; SameSite=Strict`
  window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: user }))
}

export function clearUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user')
  localStorage.removeItem('userRole')
  document.cookie = 'userRole=; path=/; max-age=0'
  window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: null }))
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}

export function getUserRole(): string | null {
  const user = getUser()
  return user?.role || null
}

export function requiresAuth(role?: string): boolean {
  if (!isAuthenticated()) return false
  if (role && getUserRole() !== role) return false
  return true
}

export async function syncUserWithServer(): Promise<User | null> {
  if (typeof window === 'undefined') return null
  
  const cached = getUser()
  if (!cached) return null

  try {
    const freshUser = await api.getMe()
    if (freshUser && freshUser.id) {
      setUser(freshUser)
      return freshUser
    }
    return cached
  } catch (err: any) {
    console.warn('Failed to sync user with /auth/me:', err)
    // If unauthorized or token invalid, clear local user
    if (
      err?.message?.includes('401') || 
      err?.message?.includes('Session expired') || 
      err?.message?.includes('Unauthorized')
    ) {
      clearUser()
      return null
    }
    // Return cached user during transient network errors
    return cached
  }
}
