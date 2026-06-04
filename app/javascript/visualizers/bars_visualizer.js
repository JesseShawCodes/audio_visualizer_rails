export default class BarsVisualizer {
  draw(sketch, audioData) {
    const barWidth = sketch.width / audioData.length
    
    sketch.push()
    sketch.translate(0, sketch.height)
    sketch.noStroke()

    for (let i = 0; i < audioData.length; i++) {
      const h = sketch.map(audioData[i], 0, 255, 0, sketch.height * 0.8)
      
      // Gradient-like effect based on index
      const r = sketch.map(i, 0, audioData.length, 79, 168)
      const g = sketch.map(i, 0, audioData.length, 70, 85)
      const b = sketch.map(i, 0, audioData.length, 229, 247)
      
      sketch.fill(r, g, b, 200)
      sketch.rect(i * barWidth, -h, barWidth - 1, h)
    }
    sketch.pop()
  }
}
