export default class ParticleVisualizer {
    draw(sketch, audioData) {
        const avg = audioData.reduce((a, b) => a + b, 0) / audioData.length;

        sketch.fill(avg, 100, 255)

        sketch.circle(
            sketch.width / 2,
            sketch.height / 2,
            avg * 2
        )
    }
}