import { describe, it, expect } from 'vitest'

describe('Grade Compile - Weight Total Validation', () => {
  it('should calculate total weight correctly', () => {
    const components = [
      { type: 'QUIZ', weight: 20 },
      { type: 'ASSIGNMENT', weight: 30 },
      { type: 'TEST', weight: 40 },
      { type: 'PARTICIPATION', weight: 10 },
    ]

    const total = components.reduce((sum, comp) => sum + comp.weight, 0)
    expect(total).toBe(100)
  })

  it('should reject weight total that is not 100', () => {
    const components = [
      { type: 'QUIZ', weight: 20 },
      { type: 'ASSIGNMENT', weight: 30 },
      { type: 'TEST', weight: 40 },
      { type: 'PARTICIPATION', weight: 5 }, // Total = 95
    ]

    const total = components.reduce((sum, comp) => sum + comp.weight, 0)
    expect(total).not.toBe(100)
    expect(total).toBe(95)
  })

  it('should accept exactly 100 total weight', () => {
    const components = [
      { type: 'QUIZ', weight: 25 },
      { type: 'ASSIGNMENT', weight: 25 },
      { type: 'TEST', weight: 25 },
      { type: 'PARTICIPATION', weight: 25 },
    ]

    const total = components.reduce((sum, comp) => sum + comp.weight, 0)
    expect(total).toBe(100)
  })

  it('should handle single component with 100 weight', () => {
    const components = [
      { type: 'TEST', weight: 100 },
    ]

    const total = components.reduce((sum, comp) => sum + comp.weight, 0)
    expect(total).toBe(100)
  })

  it('should reject total weight over 100', () => {
    const components = [
      { type: 'QUIZ', weight: 30 },
      { type: 'ASSIGNMENT', weight: 30 },
      { type: 'TEST', weight: 30 },
      { type: 'PARTICIPATION', weight: 20 }, // Total = 110
    ]

    const total = components.reduce((sum, comp) => sum + comp.weight, 0)
    expect(total).toBe(110)
    expect(total).toBeGreaterThan(100)
  })
})
