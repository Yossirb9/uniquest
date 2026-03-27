import { useEffect, useRef } from 'react'

export default function MenuScreen({ onPlay, onLeaderboard }) {
  const canvasRef = useRef(null)
  const tickRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * 1280,
      y: Math.random() * 720,
      r: 0.5 + Math.random() * 1.5,
      speed: 0.1 + Math.random() * 0.3,
    }))

    const particles = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 1280,
      y: Math.random() * 720,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.3 - Math.random() * 0.5,
      color: ['#ff6b9d', '#c44dff', '#00e5ff', '#ffd700'][i % 4],
      size: 2 + Math.random() * 3,
    }))

    function draw() {
      tickRef.current++
      const t = tickRef.current * 0.02

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, 720)
      bg.addColorStop(0, '#0d0820')
      bg.addColorStop(1, '#1a0f3c')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, 1280, 720)

      // Stars
      stars.forEach(s => {
        s.y += s.speed
        if (s.y > 720) s.y = 0
        ctx.globalAlpha = 0.4 + Math.sin(t + s.x) * 0.3
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      // Floating particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.y < -10) { p.y = 730; p.x = Math.random() * 1280 }
        ctx.shadowColor = p.color
        ctx.shadowBlur = 6
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.shadowBlur = 0

      // Logo glow halo
      const logoGrad = ctx.createRadialGradient(640, 180, 10, 640, 180, 200)
      logoGrad.addColorStop(0, 'rgba(196,77,255,0.18)')
      logoGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = logoGrad
      ctx.fillRect(440, 80, 400, 200)

      // Title "UniQuest"
      ctx.font = 'bold 80px serif'
      ctx.textAlign = 'center'
      const textGrad = ctx.createLinearGradient(400, 0, 880, 0)
      textGrad.addColorStop(0,   '#ff6b9d')
      textGrad.addColorStop(0.3, '#c44dff')
      textGrad.addColorStop(0.6, '#4d79ff')
      textGrad.addColorStop(1,   '#00e5ff')
      ctx.fillStyle = textGrad
      ctx.shadowColor = '#c44dff'
      ctx.shadowBlur = 24
      ctx.fillText('🦄 UniQuest 🦄', 640, 180)

      // Tagline
      ctx.shadowBlur = 0
      ctx.font = 'italic 22px serif'
      ctx.fillStyle = '#b8a9d9'
      ctx.fillText('Two unicorns. One destiny.', 640, 220)

      // Character preview
      drawUnicornPreview(ctx, 340, 330, 'rainbow', t)
      drawUnicornPreview(ctx, 900, 330, 'crystal', t)

      // P1 label
      ctx.font = 'bold 16px monospace'
      ctx.fillStyle = '#ff9dc8'
      ctx.fillText('P1 — WASD + W to jump', 340, 420)
      // P2 label
      ctx.fillStyle = '#80f0ff'
      ctx.fillText('P2 — Arrows + ↑ to jump', 900, 420)

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div style={{ position: 'relative', width: 1280, height: 720 }}>
      <canvas ref={canvasRef} width={1280} height={720} style={{ display: 'block' }} />

      <div style={{
        position: 'absolute', bottom: 140, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <button onClick={onPlay} style={btnStyle('#ff6b9d', '#c44dff')}>
          ▶ Play Game
        </button>
        <button onClick={onLeaderboard} style={btnStyle('transparent', '#00e5ff', true)}>
          🏆 Leaderboard
        </button>
      </div>

      <div style={{
        position: 'absolute', bottom: 18, width: '100%', textAlign: 'center',
        color: '#b8a9d9', fontSize: 13, fontFamily: 'monospace',
      }}>
        2 Players Required • Keyboard Controls
      </div>
    </div>
  )
}

function btnStyle(from, to, outline = false) {
  return {
    padding: '14px 56px',
    borderRadius: 999,
    border: outline ? `2px solid ${to}` : 'none',
    background: outline ? 'transparent' : `linear-gradient(90deg, ${from}, ${to})`,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: 1,
    boxShadow: `0 0 20px ${to}88`,
    transition: 'transform 0.1s',
    fontFamily: 'monospace',
  }
}

function drawUnicornPreview(ctx, cx, cy, type, t) {
  const isRainbow = type === 'rainbow'
  const bodyColor = isRainbow ? '#ff9dc8' : '#80f0ff'
  const shadowC   = isRainbow ? '#ff6b9d' : '#00bfff'
  const bob = Math.sin(t * 2 + (isRainbow ? 0 : Math.PI)) * 4

  ctx.save()
  ctx.translate(cx, cy + bob)
  if (!isRainbow) ctx.scale(-1, 1)

  ctx.shadowColor = shadowC
  ctx.shadowBlur = 20

  // Body
  ctx.fillStyle = bodyColor
  ctx.beginPath()
  ctx.roundRect(-28, -20, 56, 36, 12)
  ctx.fill()

  // Head
  ctx.beginPath()
  ctx.roundRect(12, -36, 30, 24, 10)
  ctx.fill()

  // Horn
  ctx.strokeStyle = isRainbow ? '#ffd700' : '#c0f0ff'
  ctx.lineWidth = 4
  ctx.shadowColor = isRainbow ? '#ffd700' : '#c0f0ff'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(26, -36)
  ctx.lineTo(32, -58)
  ctx.stroke()

  // Eye
  ctx.shadowBlur = 0
  ctx.fillStyle = '#0a0618'
  ctx.beginPath(); ctx.arc(34, -26, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'white'
  ctx.beginPath(); ctx.arc(36, -28, 1.5, 0, Math.PI * 2); ctx.fill()

  // Mane
  const mane = isRainbow
    ? ['#ff6b9d', '#ffcc00', '#00e5ff', '#c44dff']
    : ['#00e5ff', '#4d79ff', '#c44dff']
  mane.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.shadowColor = c
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(-14 - i * 8, -28 + Math.sin(t * 2 + i) * 5, 10 - i * 1.5, 0, Math.PI * 2)
    ctx.fill()
  })

  // Legs
  ctx.shadowBlur = 0
  ctx.fillStyle = bodyColor
  const legAnim = Math.sin(t * 3) * 8
  ctx.fillRect(-20, 16, 10, 18 + legAnim)
  ctx.fillRect(-4,  16, 10, 18 - legAnim)
  ctx.fillRect(8,   16, 10, 18 + legAnim * 0.5)

  ctx.restore()
}
