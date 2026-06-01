import { describe, it, expect, vi, beforeEach } from 'vitest'
import AudioEngine from '@/audio/audio_engine'

describe('AudioEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes correctly', () => {
    const engine = new AudioEngine()
    
    // Check AudioContext and Audio initialization
    expect(global.AudioContext).toHaveBeenCalled()
    expect(global.Audio).toHaveBeenCalled()
    
    // Check audio element source (using endsWith because of jsdom's absolute URL resolution)
    expect(engine.audioElement.src).toMatch(/\/audio\/piano_song\.mp3$/)
    
    // Get the mock context and analyser to verify calls
    const mockContext = vi.mocked(global.AudioContext).mock.results[0].value
    const mockAnalyser = mockContext.createAnalyser.mock.results[0].value
    
    // Check connections and configuration
    expect(mockContext.createMediaElementSource).toHaveBeenCalledWith(engine.audioElement)
    expect(mockContext.createAnalyser).toHaveBeenCalled()
    expect(mockAnalyser.fftSize).toBe(256)
    
    // Check node connections
    // In our setup.js mock, createMediaElementSource returns an object with a connect method
    expect(engine.source.connect).toHaveBeenCalledWith(mockAnalyser)
    expect(mockAnalyser.connect).toHaveBeenCalledWith(mockContext.destination)
    
    // Check dataArray initialization
    expect(engine.dataArray).toBeInstanceOf(Uint8Array)
    expect(engine.dataArray.length).toBe(mockAnalyser.frequencyBinCount)
  })

  it('getData updates and returns dataArray', () => {
    const engine = new AudioEngine()
    const mockContext = vi.mocked(global.AudioContext).mock.results[0].value
    const mockAnalyser = mockContext.createAnalyser.mock.results[0].value
    
    const result = engine.getData()
    
    expect(mockAnalyser.getByteFrequencyData).toHaveBeenCalledWith(engine.dataArray)
    expect(result).toBe(engine.dataArray)
  })
})
