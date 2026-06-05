export default class CircleVisualizer {
  draw(sketch, audioData, baseColor = "#4f46e5") {
    sketch.push()
    sketch.translate(sketch.width / 2, sketch.height / 2)
    sketch.noFill()
    sketch.strokeWeight(2)

    const radius = Math.min(sketch.width, sketch.height) * 0.2
    const numBars = audioData.length
    const c = sketch.color(baseColor)
    const targetColor = sketch.color(255, 255, 255)
    
    sketch.beginShape()
    for (let i = 0; i < numBars; i++) {
      const angle = sketch.map(i, 0, numBars, 0, sketch.TWO_PI)
      const amplitude = audioData[i]
      const r = radius + sketch.map(amplitude, 0, 255, 0, radius * 1.5)
      
      const x = r * sketch.cos(angle)
      const y = r * sketch.sin(angle)
      
      const interpolation = sketch.map(amplitude, 0, 255, 0, 0.8)
      const col = sketch.lerpColor(c, targetColor, interpolation)
      
      sketch.stroke(sketch.red(col), sketch.green(col), sketch.blue(col), 150)
      sketch.vertex(x, y)
      
      // Also draw lines from center for more impact
      sketch.push()
      sketch.strokeWeight(1)
      sketch.stroke(sketch.red(col), sketch.green(col), sketch.blue(col), 50)
      sketch.line(0, 0, x, y)
      sketch.pop()
    }
    sketch.endShape(sketch.CLOSE)
    sketch.pop()
  }
}
