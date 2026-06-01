import { Application } from "@hotwired/stimulus"
import VisualizerController from "../../../app/javascript/controllers/visualizer_controller"
import { waitFor } from "@testing-library/dom"
import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest'
import p5 from "p5"

// Mock dependencies
vi.mock("../../../app/javascript/audio/audio_engine", () => {
  return {
    default: class MockAudioEngine {
      constructor() {
        this.audioContext = {
          state: 'suspended',
          resume: vi.fn().mockResolvedValue(),
        }
        this.audioElement = {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          play: vi.fn().mockResolvedValue(),
          pause: vi.fn(),
          paused: true,
          duration: 100,
          currentTime: 0,
        }
      }
      getData() {
        return new Uint8Array([10, 20, 30])
      }
    }
  }
})

vi.mock("../../../app/javascript/visualizers/particle_visualizer", () => {
  return {
    default: class MockParticleVisualizer {
      draw = vi.fn()
    }
  }
})

describe("VisualizerController", () => {
  let application
  let container

  beforeEach(() => {
    application = Application.start()
    application.register("visualizer", VisualizerController)
    
    container = document.createElement("div")
    container.innerHTML = `
      <div data-controller="visualizer">
        <div data-visualizer-target="canvas" style="width: 800px; height: 600px;"></div>
        <input type="range" data-visualizer-target="sensitivitySlider" value="50">
        <span data-visualizer-target="sensitivityValue">50%</span>
        <select data-visualizer-target="visualizerSelect" data-action="change->visualizer#changeVisualizer">
          <option value="particles">Particles</option>
          <option value="bars">Bars</option>
        </select>
        <span data-visualizer-target="fps">0</span>
        <button data-action="click->visualizer#playPause" data-visualizer-target="playButton">
          <svg data-visualizer-target="playIcon"></svg>
        </button>
        <span data-visualizer-target="currentTime">00:00</span>
        <span data-visualizer-target="duration">00:00</span>
        <div class="progress-bar">
          <div data-visualizer-target="timeline" style="width: 0%;"></div>
        </div>
      </div>
    `
    document.body.appendChild(container)
  })

  afterEach(() => {
    application.stop()
    container.remove()
    vi.clearAllMocks()
  })

  async function getController() {
    const el = container.querySelector('[data-controller="visualizer"]')
    let controller
    await waitFor(() => {
      controller = application.getControllerForElementAndIdentifier(el, "visualizer")
      expect(controller).not.toBeNull()
    })
    return controller
  }

  test("initializes and disconnects correctly", async () => {
    const controller = await getController()
    const p5RemoveSpy = vi.spyOn(controller.p5, 'remove')
    const removeEventSpy = vi.spyOn(document, 'removeEventListener')

    expect(controller.settings.sensitivity).toBe(0.5)
    
    // Test disconnect
    controller.disconnect()
    expect(p5RemoveSpy).toHaveBeenCalled()
    expect(removeEventSpy).toHaveBeenCalledWith('keydown', controller.handleKeydown)
  })

  test("keyboard shortcuts trigger actions", async () => {
    const controller = await getController()
    const playPauseSpy = vi.spyOn(controller, 'playPause')
    const fullscreenSpy = vi.spyOn(controller, 'toggleFullscreen')
    const modeSpy = vi.spyOn(controller, 'changeVisualizerMode')

    // Space -> playPause
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))
    expect(playPauseSpy).toHaveBeenCalled()

    // KeyF -> toggleFullscreen
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' }))
    expect(fullscreenSpy).toHaveBeenCalled()

    // Digit1, 2, 3 -> changeVisualizerMode
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }))
    expect(modeSpy).toHaveBeenCalledWith('particles')
    
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit2' }))
    expect(modeSpy).toHaveBeenCalledWith('bars')
    
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit3' }))
    expect(modeSpy).toHaveBeenCalledWith('circle')
    
    // Other keys should do nothing
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }))
    expect(playPauseSpy).toHaveBeenCalledTimes(1)
  })

  test("audio event listeners update UI", async () => {
    const controller = await getController()
    const audioEl = controller.audio.audioElement
    
    // Get the actual listeners added during initAudio
    const listeners = {}
    audioEl.addEventListener.mock.calls.forEach(([event, listener]) => {
      listeners[event] = listener
    })

    // timeupdate
    audioEl.currentTime = 30
    audioEl.duration = 100
    listeners['timeupdate']()
    expect(controller.currentTimeTarget.textContent).toBe("00:30")
    expect(controller.timelineTarget.style.width).toBe("30%")

    // loadedmetadata
    audioEl.duration = 125
    listeners['loadedmetadata']()
    expect(controller.durationTarget.textContent).toBe("02:05")

    // play
    listeners['play']()
    expect(controller.settings.isPlaying).toBe(true)
    expect(controller.playIconTarget.innerHTML).toContain('path')

    // pause
    listeners['pause']()
    expect(controller.settings.isPlaying).toBe(false)
  })

  test("p5 sketch lifecycle and draw loop", async () => {
    const controller = await getController()
    
    // The p5 mock in setup.js allows us to access the sketch object
    const sketch = controller.p5.sketch
    
    // Test setup
    sketch.setup()
    expect(sketch.createCanvas).toHaveBeenCalled()
    
    // Test draw
    sketch.frameCount = 30
    sketch.draw()
    expect(sketch.background).toHaveBeenCalledWith(0, 30)
    expect(controller.particleVisualizer.draw).toHaveBeenCalled()
    expect(controller.fpsTarget.textContent).toBeDefined()

    // Test windowResized
    sketch.windowResized()
    expect(sketch.resizeCanvas).toHaveBeenCalled()
  })

  test("updateSensitivity updates settings and UI", async () => {
    const controller = await getController()
    const event = { target: { value: 80 } }
    controller.updateSensitivity(event)
    
    expect(controller.settings.sensitivity).toBe(0.8)
    expect(controller.sensitivityValueTarget.textContent).toBe("80%")
  })

  test("changeVisualizer updates mode", async () => {
    const controller = await getController()
    const event = { target: { value: 'bars' } }
    controller.changeVisualizer(event)
    
    expect(controller.settings.mode).toBe('bars')
  })

  test("playPause toggles play and pause and resumes context", async () => {
    const controller = await getController()
    
    // Resume context
    controller.audio.audioContext.state = 'suspended'
    controller.audio.audioElement.paused = true
    await controller.playPause()
    expect(controller.audio.audioContext.resume).toHaveBeenCalled()
    expect(controller.audio.audioElement.play).toHaveBeenCalled()

    // Toggle to pause
    controller.audio.audioElement.paused = false
    await controller.playPause()
    expect(controller.audio.audioElement.pause).toHaveBeenCalled()
  })

  test("toggleFullscreen toggles and handles errors", async () => {
    const controller = await getController()
    const el = controller.element
    
    // Request fullscreen
    const requestSpy = vi.spyOn(el, 'requestFullscreen')
    await controller.toggleFullscreen()
    expect(requestSpy).toHaveBeenCalled()

    // Exit fullscreen
    const exitSpy = vi.spyOn(document, 'exitFullscreen')
    Object.defineProperty(document, 'fullscreenElement', {
      value: el,
      configurable: true
    })
    controller.toggleFullscreen()
    expect(exitSpy).toHaveBeenCalled()

    // Error handling
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true })
    vi.spyOn(el, 'requestFullscreen').mockRejectedValue(new Error("FS Error"))
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    await controller.toggleFullscreen()
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("FS Error"))
  })

  test("startUpdateLoop exists", async () => {
    const controller = await getController()
    expect(typeof controller.startUpdateLoop).toBe('function')
    controller.startUpdateLoop()
  })
})
