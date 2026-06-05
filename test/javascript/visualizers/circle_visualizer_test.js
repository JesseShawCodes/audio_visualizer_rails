import { describe, it, expect, vi, beforeEach } from 'vitest'
import CircleVisualizer from '@/visualizers/circle_visualizer'

describe('CircleVisualizer', () => {
  let visualizer
  let mockSketch

  beforeEach(() => {
    visualizer = new CircleVisualizer()
    mockSketch = {
      width: 800,
      height: 600,
      TWO_PI: Math.PI * 2,
      CLOSE: 'close',
      push: vi.fn(),
      pop: vi.fn(),
      translate: vi.fn(),
      noFill: vi.fn(),
      strokeWeight: vi.fn(),
      stroke: vi.fn(),
      beginShape: vi.fn(),
      endShape: vi.fn(),
      vertex: vi.fn(),
      line: vi.fn(),
      cos: vi.fn(val => Math.cos(val)),
      sin: vi.fn(val => Math.sin(val)),
      map: vi.fn((val, start1, stop1, start2, stop2) => {
        return ((val - start1) / (stop1 - start1)) * (stop2 - start2) + start2
      }),
      color: vi.fn((r, g, b) => {
        if (typeof r === 'string') return { r: 79, g: 70, b: 229 } // Mock hex to RGB
        return { r: r || 0, g: g || 0, b: b || 0 }
      }),
      lerpColor: vi.fn((c1, c2, amt) => {
        return {
          r: c1.r + (c2.r - c1.r) * amt,
          g: c1.g + (c2.g - c1.g) * amt,
          b: c1.b + (c2.b - c1.b) * amt,
        }
      }),
      red: vi.fn(c => c.r),
      green: vi.fn(c => c.g),
      blue: vi.fn(c => c.b),
    }
  })

  it('draws a reactive circle based on audio data', () => {
    const audioData = new Uint8Array([127, 255])
    visualizer.draw(mockSketch, audioData, '#4f46e5')

    expect(mockSketch.push).toHaveBeenCalled()
    expect(mockSketch.translate).toHaveBeenCalledWith(400, 300)
    expect(mockSketch.noFill).toHaveBeenCalled()
    expect(mockSketch.beginShape).toHaveBeenCalled()
    
    // 2 data points = 2 vertices + 2 lines
    expect(mockSketch.vertex).toHaveBeenCalledTimes(2)
    expect(mockSketch.line).toHaveBeenCalledTimes(2)

    expect(mockSketch.endShape).toHaveBeenCalledWith('close')
    expect(mockSketch.pop).toHaveBeenCalled()
  })

  it('applies dynamic colors to the strokes', () => {
    const audioData = new Uint8Array([255])
    visualizer.draw(mockSketch, audioData, '#4f46e5')

    // Verification of lerpColor usage
    expect(mockSketch.lerpColor).toHaveBeenCalled()
    expect(mockSketch.stroke).toHaveBeenCalled()
  })
})
