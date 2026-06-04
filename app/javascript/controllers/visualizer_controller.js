import { Controller } from "@hotwired/stimulus"
import p5 from "p5"
import AudioEngine from "../audio/audio_engine"
import ParticleVisualizer from "../visualizers/particle_visualizer"
import BarsVisualizer from "../visualizers/bars_visualizer"
import CircleVisualizer from "../visualizers/circle_visualizer"

export default class extends Controller {
  static targets = [
    "canvas", "sensitivitySlider", "sensitivityValue", 
    "visualizerSelect", "fps", "playButton", "playIcon",
    "currentTime", "duration", "timeline"
  ]

  connect() {
    this.settings = {
      sensitivity: 0.5,
      mode: "particles",
      isPlaying: false
    }

    this.initAudio()
    this.initP5()
    this.initShortcuts()
  }

  disconnect() {
    if (this.p5) this.p5.remove()
    document.removeEventListener('keydown', this.handleKeydown)
  }

  initShortcuts() {
    this.handleKeydown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault()
        this.playPause()
      } else if (event.code === 'KeyF') {
        this.toggleFullscreen()
      } else if (event.code === 'Digit1') {
        this.changeVisualizerMode('particles')
      } else if (event.code === 'Digit2') {
        this.changeVisualizerMode('bars')
      } else if (event.code === 'Digit3') {
        this.changeVisualizerMode('circle')
      }
    }
    document.addEventListener('keydown', this.handleKeydown)
  }

  changeVisualizerMode(mode) {
    if (this.hasVisualizerSelectTarget) {
      this.visualizerSelectTarget.value = mode
    }
    this.settings.mode = mode
    console.log(`Visualizer changed to: ${mode}`)
  }

  initAudio() {
    this.audio = new AudioEngine()
    
    // Add event listeners to audio element
    const el = this.audio.audioElement
    el.addEventListener('timeupdate', () => this.updateProgress())
    el.addEventListener('loadedmetadata', () => {
      this.durationTarget.textContent = this.formatTime(el.duration)
    })
    el.addEventListener('play', () => {
      this.settings.isPlaying = true
      this.updatePlayIcon()
    })
    el.addEventListener('pause', () => {
      this.settings.isPlaying = false
      this.updatePlayIcon()
    })
  }

  initP5() {
    this.visualizers = {
      particles: new ParticleVisualizer(),
      bars: new BarsVisualizer(),
      circle: new CircleVisualizer()
    }
    
    this.p5 = new p5((sketch) => {
      sketch.setup = () => {
        const container = this.canvasTarget
        const canvas = sketch.createCanvas(container.offsetWidth, container.offsetHeight)
        canvas.parent(container)
        sketch.background(0)
      }

      sketch.draw = () => {
        // Motion Blur Trails (background with alpha)
        sketch.background(0, 30)
        
        const audioData = this.audio.getData()
        
        // Apply sensitivity to audio data
        const sensitiveData = Array.from(audioData).map(val => val * this.settings.sensitivity * 2)
        
        const activeVisualizer = this.visualizers[this.settings.mode]
        if (activeVisualizer) {
          activeVisualizer.draw(sketch, sensitiveData)
        }
        
        // Update FPS display occasionally
        if (sketch.frameCount % 30 === 0) {
          this.fpsTarget.textContent = Math.round(sketch.frameRate())
        }
      }

      sketch.windowResized = () => {
        const container = this.canvasTarget
        sketch.resizeCanvas(container.offsetWidth, container.offsetHeight)
      }
    }, this.canvasTarget)
  }

  // Actions
  playPause() {
    const el = this.audio.audioElement
    if (el.paused) {
      // Resume AudioContext if suspended
      if (this.audio.audioContext.state === 'suspended') {
        this.audio.audioContext.resume()
      }
      el.play()
    } else {
      el.pause()
    }
  }

  updateSensitivity(event) {
    const val = event.target.value
    this.settings.sensitivity = val / 100
    this.sensitivityValueTarget.textContent = `${val}%`
  }

  changeVisualizer(event) {
    this.settings.mode = event.target.value
    console.log(`Visualizer changed to: ${this.settings.mode}`)
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.element.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Helpers
  updateProgress() {
    const el = this.audio.audioElement
    const percent = (el.currentTime / el.duration) * 100
    this.timelineTarget.style.width = `${percent}%`
    this.currentTimeTarget.textContent = this.formatTime(el.currentTime)
  }

  updatePlayIcon() {
    if (this.settings.isPlaying) {
      // Pause icon
      this.playIconTarget.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    } else {
      // Play icon
      this.playIconTarget.innerHTML = '<path d="M8 5v14l11-7z"/>'
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  startUpdateLoop() {
    // Any non-p5 logic that needs to run periodically
  }
}
