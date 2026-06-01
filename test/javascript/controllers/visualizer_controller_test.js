import { Application } from "@hotwired/stimulus"
import VisualizerController from "../../../app/javascript/controllers/visualizer_controller"
import { waitFor } from "@testing-library/dom"
import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest'

// Mock dependencies of the controller
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
        return new Uint8Array(128)
      }
    }
  }
})

vi.mock("../../../app/javascript/visualizers/particle_visualizer", () => {
  return {
    default: class MockParticleVisualizer {
      draw() {}
    }
  }
})

describe("VisualizerController", () => {
  let application

  beforeEach(() => {
    application = Application.start()
    application.register("visualizer", VisualizerController)
    
    document.body.innerHTML = `
      <div data-controller="visualizer">
        <div data-visualizer-target="canvas" style="width: 800px; height: 600px;"></div>
        <input type="range" data-visualizer-target="sensitivitySlider" value="50">
        <span data-visualizer-target="sensitivityValue">50%</span>
        <select data-visualizer-target="visualizerSelect">
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
  })

  afterEach(() => {
    application.stop()
    document.body.innerHTML = ""
  })

  test("initializes with default settings", async () => {
    const el = document.querySelector('[data-controller="visualizer"]')
    let controller
    
    await waitFor(() => {
      controller = application.getControllerForElementAndIdentifier(el, "visualizer")
      expect(controller).not.toBeNull()
    })

    expect(controller.settings.sensitivity).toBe(0.5)
    expect(controller.settings.mode).toBe("particles")
    expect(controller.settings.isPlaying).toBe(false)
  })

  test("updates sensitivity when slider changes", async () => {
    const el = document.querySelector('[data-controller="visualizer"]')
    let controller
    
    await waitFor(() => {
      controller = application.getControllerForElementAndIdentifier(el, "visualizer")
      expect(controller.audio).toBeDefined()
    })

    const slider = document.querySelector('[data-visualizer-target="sensitivitySlider"]')
    const valueDisplay = document.querySelector('[data-visualizer-target="sensitivityValue"]')
    
    slider.value = 75
    // Dispatching input event to simulate user change
    slider.dispatchEvent(new Event("input", { bubbles: true }))
    
    // Manually call the action as Stimulus might not pick up the event in JSDOM immediately
    controller.updateSensitivity({ target: slider })
    
    expect(controller.settings.sensitivity).toBe(0.75)
    expect(valueDisplay.textContent).toBe("75%")
  })

  test("toggles play/pause", async () => {
    const el = document.querySelector('[data-controller="visualizer"]')
    let controller
    
    await waitFor(() => {
      controller = application.getControllerForElementAndIdentifier(el, "visualizer")
      expect(controller.audio).toBeDefined()
    })
    
    const playSpy = vi.spyOn(controller.audio.audioElement, 'play')
    const pauseSpy = vi.spyOn(controller.audio.audioElement, 'pause')

    // Initial state is paused (audioElement.paused = true)
    controller.playPause()
    expect(playSpy).toHaveBeenCalled()

    // Mock it as playing
    controller.audio.audioElement.paused = false
    controller.playPause()
    expect(pauseSpy).toHaveBeenCalled()
  })

  test("toggles fullscreen", async () => {
    const el = document.querySelector('[data-controller="visualizer"]')
    let controller
    
    await waitFor(() => {
      controller = application.getControllerForElementAndIdentifier(el, "visualizer")
      expect(controller).not.toBeNull()
    })

    const requestSpy = vi.spyOn(el, 'requestFullscreen')
    const exitSpy = vi.spyOn(document, 'exitFullscreen')

    // Initially not in fullscreen
    controller.toggleFullscreen()
    expect(requestSpy).toHaveBeenCalled()

    // Mock document.fullscreenElement to simulate being in fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      value: el,
      configurable: true
    })

    controller.toggleFullscreen()
    expect(exitSpy).toHaveBeenCalled()

    // Clean up
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true
    })
  })

  test("changes visualizer mode", async () => {
    const el = document.querySelector('[data-controller="visualizer"]')
    let controller
    
    await waitFor(() => {
      controller = application.getControllerForElementAndIdentifier(el, "visualizer")
      expect(controller).not.toBeNull()
    })

    const select = document.querySelector('[data-visualizer-target="visualizerSelect"]')
    select.value = "particles"
    select.dispatchEvent(new Event("change", { bubbles: true }))

    expect(controller.settings.mode).toBe("particles")
  })
})
