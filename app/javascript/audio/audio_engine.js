export default class AudioEngine {
  constructor() {
    this.audioContext = new AudioContext()

    this.audioElement = new Audio()
    
    this.source = this.audioContext.createMediaElementSource(this.audioElement)
    
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256

    this.source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
  }

  async loadFile(file) {
    const url = URL.createObjectURL(file)
    this.audioElement.src = url
    
    // Some browsers require a user interaction to start the audio context
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    try {
      await this.audioElement.play()
    } catch (e) {
      console.warn("Autoplay was prevented. User must click play.")
    }
  }

  getData() {
    this.analyser.getByteFrequencyData(this.dataArray)

    return this.dataArray
  }
}