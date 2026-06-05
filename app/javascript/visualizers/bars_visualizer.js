export default class BarsVisualizer {
  draw(sketch, audioData, baseColor = "#4f46e5") {
    const barWidth = sketch.width / audioData.length
    
    sketch.push()
    sketch.translate(0, sketch.height)
    sketch.noStroke()

    const startColor = sketch.color(baseColor)
    // Make end color slightly different/brighter for gradient
    // We can use p5's color methods if we want, or just lerp towards white
    const targetColor = sketch.color(255, 255, 255)

    for (let i = 0; i < audioData.length; i++) {
      const h = sketch.map(audioData[i], 0, 255, 0, sketch.height * 0.8)
      
      const interpolation = sketch.map(i, 0, audioData.length, 0, 0.5)
      const col = sketch.lerpColor(startColor, targetColor, interpolation)
      
      sketch.fill(sketch.red(col), sketch.green(col), sketch.blue(col), 200)
      sketch.rect(i * barWidth, -h, barWidth - 1, h)
    }
    sketch.pop()
  }
}
