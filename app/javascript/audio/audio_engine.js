export default class AudioEngine {
  constructor() {
    this.audioContext = new AudioContext()

    this.audioElement = new Audio()
    this.audioElement.src = "/audio/piano_song.mp3"
    
    this.source = this.audioContext.createMediaElementSource(this.audioElement)
    
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256

    this.source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
  }

  getData() {
    this.analyser.getByteFrequencyData(this.dataArray)

    return this.dataArray
  }
}