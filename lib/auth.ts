import { User } from './types'

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
  // Also set role in cookie for middleware access
  document.cookie = `userRole=${user.role}; path=/; max-age=3600; SameSite=Strict`
}

export function clearUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user')
  document.cookie = 'userRole=; path=/; max-age=0'
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
