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
    }
  })

  it('draws bars based on audio data', () => {
    const audioData = new Uint8Array([0, 127, 255])
    visualizer.draw(mockSketch, audioData)

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

  it('applies gradient colors based on index', () => {
    const audioData = new Uint8Array([100, 200])
    visualizer.draw(mockSketch, audioData)

    // First bar colors (i=0, len=2)
    // r = map(0, 0, 2, 79, 168) = 79
    // g = map(0, 0, 2, 70, 85) = 70
    // b = map(0, 0, 2, 229, 247) = 229
    expect(mockSketch.fill).toHaveBeenNthCalledWith(1, 79, 70, 229, 200)

    // Second bar colors (i=1, len=2)
    // r = map(1, 0, 2, 79, 168) = 79 + (168-79)/2 = 123.5
    // g = map(1, 0, 2, 70, 85) = 70 + (85-70)/2 = 77.5
    // b = map(1, 0, 2, 229, 247) = 229 + (247-229)/2 = 238
    expect(mockSketch.fill).toHaveBeenNthCalledWith(2, 123.5, 77.5, 238, 200)
  })
})
