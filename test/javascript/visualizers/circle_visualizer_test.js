import { describe, it, expect, vi, beforeEach } from 'vitest'
import CircleVisualizer from '@/visualizers/circle_visualizer'

describe('CircleVisualizer', () => {
  it('exists', () => {
    const visualizer = new CircleVisualizer()
    expect(visualizer).toBeDefined()
  })
})
