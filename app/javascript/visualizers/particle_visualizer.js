export default class ParticleVisualizer {
  constructor() {
    this.particles = []
    this.numParticles = 100
  }

  draw(sketch, audioData) {
    const avg = audioData.length > 0 
      ? audioData.reduce((a, b) => a + b, 0) / audioData.length 
      : 0

    // Initialize particles if they don't exist
    if (this.particles.length === 0) {
      for (let i = 0; i < this.numParticles; i++) {
        this.particles.push({
          x: sketch.random(sketch.width),
          y: sketch.random(sketch.height),
          size: sketch.random(2, 5),
          vx: sketch.random(-0.5, 0.5),
          vy: sketch.random(-0.5, 0.5)
        })
      }
    }

    // Draw ambient background particles
    sketch.noStroke()
    this.particles.forEach(p => {
      // Movement is slightly influenced by audio
      p.x += p.vx + (sketch.random(-1, 1) * avg * 0.01)
      p.y += p.vy + (sketch.random(-1, 1) * avg * 0.01)

      // Wrap around screen
      if (p.x < 0) p.x = sketch.width
      if (p.x > sketch.width) p.x = 0
      if (p.y < 0) p.y = sketch.height
      if (p.y > sketch.height) p.y = 0

      // Particle color glows based on audio
      const glow = sketch.map(avg, 0, 255, 50, 255)
      sketch.fill(100, 150, 255, glow)
      sketch.circle(p.x, p.y, p.size + (avg * 0.05))
    })

    // Draw central reactive pulse
    sketch.push()
    sketch.translate(sketch.width / 2, sketch.height / 2)
    
    // Outer glow
    sketch.fill(79, 70, 229, 20) // Indigo-600 with low alpha
    sketch.circle(0, 0, avg * 3)
    
    // Inner pulse
    sketch.fill(129, 140, 248, 150) // Indigo-400
    sketch.circle(0, 0, avg * 1.5)
    sketch.pop()
  }
}
