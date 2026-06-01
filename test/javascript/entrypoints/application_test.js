import { describe, it, expect, vi } from 'vitest'

// Mock Turbo
vi.mock('@hotwired/turbo-rails', () => ({
  Turbo: {
    start: vi.fn(),
    session: {}
  }
}))

// Mock Controllers index to prevent side effects during entry point test
vi.mock('./controllers', () => ({}))

describe('application.js entry point', () => {
  it('imports without throwing and loads dependencies', async () => {
    // We import it dynamically to test the side effects of importing
    await import('@/application.js')
    
    // If it gets here without error, the basic structural imports are valid
    expect(true).toBe(true)
  })
})
