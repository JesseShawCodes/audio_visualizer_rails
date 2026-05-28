import { Controller } from "@hotwired/stimulus"
import p5 from "p5"
import AudioEngine from "../audio/audio_engine"
import ParticleVisualizer from "../visualizers/particle_visualizer"

// Connects to data-controller="visualizer"
export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    this.audio = new AudioEngine()
    this.particleVisualizer = new ParticleVisualizer()

    this.p5 = new p5((sketch) => {
      sketch.setup = () => {
        sketch.createCanvas(800, 500)
      }

      sketch.draw = () => {
        sketch.background(0)
        
        const audioData = this.audio.getData()
        this.particleVisualizer.draw(sketch, audioData)
      }
    }, this.canvasTarget)
  }

  disconnect() {
    this.sketch.remove()
  }
}
