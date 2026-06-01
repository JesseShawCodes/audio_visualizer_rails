import { describe, it, expect } from 'vitest'
import { application } from '@/controllers/application'

describe('Stimulus Application Configuration', () => {
  it('initializes the Stimulus application', () => {
    expect(application).toBeDefined()
    expect(application.debug).toBe(false)
  })

  it('sets Stimulus on the window object', () => {
    expect(window.Stimulus).toBe(application)
  })
})
