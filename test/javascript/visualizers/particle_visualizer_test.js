import { describe, it, expect, vi, beforeEach } from 'vitest'
import ParticleVisualizer from '@/visualizers/particle_visualizer'

describe('ParticleVisualizer', () => {
  let visualizer
  let mockSketch

  beforeEach(() => {
    visualizer = new ParticleVisualizer()
    mockSketch = {
      width: 800,
      height: 600,
      random: vi.fn((min, max) => {
        if (max === undefined) return min * 0.5 // sketch.random(max)
        return (min + max) * 0.5 // sketch.random(min, max)
      }),
      noStroke: vi.fn(),
      fill: vi.fn(),
      circle: vi.fn(),
      map: vi.fn((val, start1, stop1, start2, stop2) => {
        return ((val - start1) / (stop1 - start1)) * (stop2 - start2) + start2
      }),
      push: vi.fn(),
      pop: vi.fn(),
      translate: vi.fn(),
    }
  })

  it('initializes with default values', () => {
    expect(visualizer.particles).toEqual([])
    expect(visualizer.numParticles).toBe(100)
  })

  it('initializes particles on first draw', () => {
    const audioData = new Uint8Array([0, 0, 0])
    visualizer.draw(mockSketch, audioData)
    
    expect(visualizer.particles.length).toBe(100)
    expect(mockSketch.random).toHaveBeenCalled()
    
    // Check one particle structure
    const p = visualizer.particles[0]
    expect(p).toHaveProperty('x')
    expect(p).toHaveProperty('y')
    expect(p).toHaveProperty('size')
    expect(p).toHaveProperty('vx')
    expect(p).toHaveProperty('vy')
  })

  it('updates particle positions and wraps them around the screen', () => {
    const audioData = new Uint8Array([100]) // avg = 100
    visualizer.draw(mockSketch, audioData) // init

    // Force a particle to the edge to test wrapping
    const p = visualizer.particles[0]
    
    // Test left wrap
    p.x = -1
    visualizer.draw(mockSketch, audioData)
    expect(p.x).toBe(mockSketch.width)

    // Test right wrap
    p.x = mockSketch.width + 1
    visualizer.draw(mockSketch, audioData)
    expect(p.x).toBe(0)

    // Test top wrap
    p.y = -1
    visualizer.draw(mockSketch, audioData)
    expect(p.y).toBe(mockSketch.height)

    // Test bottom wrap
    p.y = mockSketch.height + 1
    visualizer.draw(mockSketch, audioData)
    expect(p.y).toBe(0)
  })

  it('draws reactive pulse and handles empty audio data', () => {
    // Empty audio data
    visualizer.draw(mockSketch, [])
    expect(mockSketch.circle).toHaveBeenCalledWith(0, 0, 0) // pulse size 0

    // Reactive audio data
    const audioData = [100, 200] // avg = 150
    visualizer.draw(mockSketch, audioData)
    
    expect(mockSketch.translate).toHaveBeenCalledWith(400, 300)
    // Outer pulse: 150 * 3 = 450
    // Inner pulse: 150 * 1.5 = 225
    expect(mockSketch.circle).toHaveBeenCalledWith(0, 0, 450)
    expect(mockSketch.circle).toHaveBeenCalledWith(0, 0, 225)
  })
})
