import { describe, it, expect, vi, beforeEach } from 'vitest'
import BarsVisualizer from '@/visualizers/bars_visualizer'

describe('BarsVisualizer', () => {
  let visualizer
  let mockSketch

  beforeEach(() => {
    visualizer = new BarsVisualizer()
    mockSketch = {
      width: 800,
      height: 600,
      push: vi.fn(),
      pop: vi.fn(),
      translate: vi.fn(),
      noStroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn(),
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

  it('draws bars based on audio data', () => {
    const audioData = new Uint8Array([0, 127, 255])
    visualizer.draw(mockSketch, audioData, '#4f46e5')

    expect(mockSketch.push).toHaveBeenCalled()
    expect(mockSketch.translate).toHaveBeenCalledWith(0, 600)
    expect(mockSketch.noStroke).toHaveBeenCalled()

    // 3 bars for 3 data points
    expect(mockSketch.rect).toHaveBeenCalledTimes(3)

    const barWidth = 800 / 3

    // First bar (0 amplitude)
    // h = map(0, 0, 255, 0, 600 * 0.8) = 0
    expect(mockSketch.rect).toHaveBeenNthCalledWith(1, 0 * barWidth, -0, barWidth - 1, 0)

    // Second bar (127 amplitude)
    // h = map(127, 0, 255, 0, 600 * 0.8) = 239.05882352941177
    expect(mockSketch.rect).toHaveBeenNthCalledWith(2, 1 * barWidth, -239.05882352941177, barWidth - 1, 239.05882352941177)

    // Third bar (255 amplitude)
    // h = map(255, 0, 255, 0, 600 * 0.8) = 480
    expect(mockSketch.rect).toHaveBeenNthCalledWith(3, 2 * barWidth, -480, barWidth - 1, 480)

    expect(mockSketch.pop).toHaveBeenCalled()
  })

  it('applies colors using lerpColor', () => {
    const audioData = new Uint8Array([100, 200])
    // Use a fixed base color for testing
    visualizer.draw(mockSketch, audioData, '#4f46e5')

    // First bar (i=0, len=2)
    // interpolation = map(0, 0, 2, 0, 0.5) = 0
    // col = lerpColor({r:79, g:70, b:229}, {r:255, g:255, b:255}, 0) = {r:79, g:70, b:229}
    expect(mockSketch.fill).toHaveBeenNthCalledWith(1, 79, 70, 229, 200)

    // Second bar (i=1, len=2)
    // interpolation = map(1, 0, 2, 0, 0.5) = 0.25
    // col = lerpColor({r:79, g:70, b:229}, {r:255, g:255, b:255}, 0.25)
    // r = 79 + (255-79)*0.25 = 79 + 44 = 123
    // g = 70 + (255-70)*0.25 = 70 + 46.25 = 116.25
    // b = 229 + (255-229)*0.25 = 229 + 6.5 = 235.5
    expect(mockSketch.fill).toHaveBeenNthCalledWith(2, 123, 116.25, 235.5, 200)
  })
})
