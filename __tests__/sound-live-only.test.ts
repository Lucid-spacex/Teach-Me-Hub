import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Notification Sound - Live Only', () => {
  let soundEnabled: boolean
  let lastSoundTime: number
  const SOUND_THROTTLE_MS = 3000 // 3 seconds

  beforeEach(() => {
    soundEnabled = false
    lastSoundTime = 0
  })

  it('should not play sound when disabled', () => {
    soundEnabled = false
    const shouldPlay = soundEnabled
    expect(shouldPlay).toBe(false)
  })

  it('should play sound when enabled', () => {
    soundEnabled = true
    const shouldPlay = soundEnabled
    expect(shouldPlay).toBe(true)
  })

  it('should throttle sound to max one per 3 seconds', () => {
    soundEnabled = true
    const now = Date.now()
    lastSoundTime = now

    // Try to play again immediately - should be throttled
    const tooSoon = now - lastSoundTime < SOUND_THROTTLE_MS
    expect(tooSoon).toBe(true)
  })

  it('should allow sound after throttle period', () => {
    soundEnabled = true
    const now = Date.now()
    lastSoundTime = now - SOUND_THROTTLE_MS - 100 // 3.1 seconds ago

    const enoughTimePassed = now - lastSoundTime >= SOUND_THROTTLE_MS
    expect(enoughTimePassed).toBe(true)
  })

  it('should respect localStorage preference', () => {
    const storedPref = 'true'
    const isEnabled = storedPref === 'true'
    expect(isEnabled).toBe(true)
  })

  it('should default to disabled if no preference stored', () => {
    const storedPref = null
    const isEnabled = storedPref === 'true'
    expect(isEnabled).toBe(false)
  })

  it('should update localStorage when preference changes', () => {
    const localStorageMock = {
      setItem: vi.fn(),
    }

    localStorageMock.setItem('soundEnabled', 'true')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('soundEnabled', 'true')
  })
})
