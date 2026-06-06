import { describe, it, expect, vi, beforeEach } from 'vitest'
import AudioEngine from '@/audio/audio_engine'

describe('AudioEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-url')
  })

  it('initializes correctly', () => {
    const engine = new AudioEngine()
    
    // Check AudioContext and Audio initialization
    expect(global.AudioContext).toHaveBeenCalled()
    expect(global.Audio).toHaveBeenCalled()
    
    // Get the mock context and analyser to verify calls
    const mockContext = vi.mocked(global.AudioContext).mock.results[0].value
    const mockAnalyser = mockContext.createAnalyser.mock.results[0].value
    
    // Check connections and configuration
    expect(mockContext.createMediaElementSource).toHaveBeenCalledWith(engine.audioElement)
    expect(mockContext.createAnalyser).toHaveBeenCalled()
    expect(mockAnalyser.fftSize).toBe(256)
    
    // Check node connections
    expect(engine.source.connect).toHaveBeenCalledWith(mockAnalyser)
    expect(mockAnalyser.connect).toHaveBeenCalledWith(mockContext.destination)
    
    // Check dataArray initialization
    expect(engine.dataArray).toBeInstanceOf(Uint8Array)
    expect(engine.dataArray.length).toBe(mockAnalyser.frequencyBinCount)
  })

  it('loadFile updates src and plays audio', async () => {
    const engine = new AudioEngine()
    const mockFile = new File([''], 'test.mp3', { type: 'audio/mp3' })
    const playSpy = vi.spyOn(engine.audioElement, 'play').mockResolvedValue()
    
    await engine.loadFile(mockFile)
    
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile)
    expect(engine.audioElement.src).toBe('blob:http://localhost/mock-url')
    expect(playSpy).toHaveBeenCalled()
  })

  it('loadFile resumes suspended AudioContext', async () => {
    const engine = new AudioEngine()
    const mockFile = new File([''], 'test.mp3', { type: 'audio/mp3' })
    vi.spyOn(engine.audioElement, 'play').mockResolvedValue()
    
    const mockContext = vi.mocked(global.AudioContext).mock.results[0].value
    mockContext.state = 'suspended'
    
    await engine.loadFile(mockFile)
    
    expect(mockContext.resume).toHaveBeenCalled()
  })

  it('handles autoplay prevention', async () => {
    const engine = new AudioEngine()
    const mockFile = new File([''], 'test.mp3', { type: 'audio/mp3' })
    const playSpy = vi.spyOn(engine.audioElement, 'play').mockRejectedValue(new Error('Autoplay prevented'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    await engine.loadFile(mockFile)
    
    expect(warnSpy).toHaveBeenCalledWith("Autoplay was prevented. User must click play.")
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
