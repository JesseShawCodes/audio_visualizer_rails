import { vi } from 'vitest'
import 'vitest-canvas-mock'

// Mock AudioContext
const mockAudioContext = vi.fn().mockImplementation(() => ({
  createAnalyser: vi.fn().mockReturnValue({
    fftSize: 256,
    frequencyBinCount: 128,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
  }),
  createMediaElementSource: vi.fn().mockReturnValue({
    connect: vi.fn(),
  }),
  destination: {},
  state: 'suspended',
  resume: vi.fn().mockResolvedValue(),
}))

vi.stubGlobal('AudioContext', mockAudioContext)

// Mock Audio
const mockAudio = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  play: vi.fn().mockResolvedValue(),
  pause: vi.fn(),
  paused: true,
  duration: 100,
  currentTime: 0,
}))

vi.stubGlobal('Audio', mockAudio)

// Mock p5
vi.mock('p5', () => {
  return {
    default: class MockP5 {
      constructor(sketchFn, element) {
        this.sketch = {
          setup: vi.fn(),
          draw: vi.fn(),
          createCanvas: vi.fn().mockReturnValue({
            parent: vi.fn(),
          }),
          background: vi.fn(),
          noStroke: vi.fn(),
          fill: vi.fn(),
          circle: vi.fn(),
          random: vi.fn().mockReturnValue(0.5),
          map: vi.fn().mockReturnValue(0),
          push: vi.fn(),
          pop: vi.fn(),
          translate: vi.fn(),
          frameRate: vi.fn().mockReturnValue(60),
          frameCount: 0,
          windowResized: vi.fn(),
        }
        sketchFn(this.sketch)
      }
      remove() {}
    }
  }
})

// Mock fullscreen API
if (typeof document !== 'undefined') {
  if (!document.exitFullscreen) {
    document.exitFullscreen = vi.fn().mockResolvedValue()
  }
  if (!Element.prototype.requestFullscreen) {
    Element.prototype.requestFullscreen = vi.fn().mockResolvedValue()
  }
}
