export default class AudioEngine {
  constructor() {
    this.audioContext = new AudioContext()

    this.audioElement = new Audio()
    this.audioElement.src = "https://www.soundjay.com/Human/sounds/human-speech-1.wav"
    
    this.source = this.audioContext.createMediaElementSource(this.audioElement)
    
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256

    this.source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

    this.audioElement.play()
  }

  getData() {
    this.analyser.getByteFrequencyData(this.dataArray)

    return this.dataArray
  }
}