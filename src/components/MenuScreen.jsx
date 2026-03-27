import { useEffect, useRef } from 'react'

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
`

export default function MenuScreen({ onPlay, onLeaderboard }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const tickRef = useRef(0)

  useEffect(() => {
    // Inject fonts
    const style = document.createElement('style')
    style.textContent = FONTS
    document.head.appendChild(style)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * 1280, y: Math.random() * 720,
      r: 0.5 + Math.random() * 1.5,
      a: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.02,
    }))

    const particles = Array.from({ length: 25 }, (_, i) => ({
      x: Math.random() * 1280, y: Math.random() * 720,
      vx: (Math.random() - 0.5) * 0.4, vy: -0.2 - Math.random() * 0.4,
      color: ['#ff89ad', '#d277ff', '#00e3fd', '#ffd700', '#b73ff3'][i % 5],
      size: 2 + Math.random() * 3,
    }))

    function draw() {
      tickRef.current++
      const t = tickRef.current * 0.018

      // Background radial gradient
      const bg = ctx.createRadialGradient(640, 360, 0, 640, 360, 720)
      bg.addColorStop(0, '#1b1532')
      bg.addColorStop(1, '#0f0a22')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, 1280, 720)

      // Stars twinkle
      stars.forEach(s => {
        s.a += s.speed
        ctx.globalAlpha = 0.3 + Math.sin(s.a) * 0.25
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      // Floating magic particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.y < -10) { p.y = 730; p.x = Math.random() * 1280 }
        ctx.shadowColor = p.color; ctx.shadowBlur = 8
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.7
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      })
      ctx.globalAlpha = 1; ctx.shadowBlur = 0

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: 1280, height: 720, fontFamily: "'Epilogue', sans-serif", overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={1280} height={720} style={{ position: 'absolute', inset: 0 }} />

      {/* Nav bar */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid rgba(189,157,255,0.15)',
        background: 'rgba(15,10,34,0.6)', backdropFilter: 'blur(8px)',
      }}>
        <span style={{ color: '#ff89ad', fontWeight: 900, fontSize: 22, letterSpacing: -0.5 }}>
          UniQuest
        </span>
        <div style={{ display: 'flex', gap: 32, color: '#a89bc4', fontSize: 14, fontWeight: 600 }}>
          <span style={{ color: '#fff' }}>Home</span>
          <span style={{ cursor: 'pointer' }}>Quests</span>
          <span style={{ cursor: 'pointer' }}>Skins</span>
          <span style={{ cursor: 'pointer' }}>Settings</span>
        </div>
        <div style={{ display: 'flex', gap: 16, color: '#a89bc4', fontSize: 20 }}>
          <span>★</span><span>🔔</span>
        </div>
      </nav>

      {/* Main content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 32, paddingTop: 60,
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            margin: 0,
            fontSize: 72, fontWeight: 900, letterSpacing: -2,
            background: 'linear-gradient(135deg, #ff89ad 0%, #d277ff 50%, #00e3fd 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(210,119,255,0.5))',
          }}>
            UniQuest
          </h1>
          <p style={{ margin: '4px 0 0', color: '#a89bc4', fontSize: 16, fontStyle: 'italic', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Two unicorns. One destiny.
          </p>
        </div>

        {/* Character cards */}
        <div style={{ display: 'flex', gap: 24 }}>
          <CharCard
            name="Rainbow Spirit"
            controls="WASD CONTROLS"
            color="#ff89ad"
            bg="linear-gradient(135deg, #3d1a2e 0%, #2a1040 100%)"
            border="#ff89ad"
            emoji="🦄"
            emojiColor="#ff6b9d"
          />
          <CharCard
            name="Crystal Guardian"
            controls="ARROW KEYS"
            color="#00e3fd"
            bg="linear-gradient(135deg, #0a2030 0%, #1a1040 100%)"
            border="#00e3fd"
            emoji="🦄"
            emojiColor="#00e5ff"
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <button onClick={onPlay} style={playBtnStyle}>
            ▶ Play Game
          </button>
          <button onClick={onLeaderboard} style={lbBtnStyle}>
            🏆 Leaderboard
          </button>
        </div>

        <p style={{ color: 'rgba(168,155,196,0.5)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          2 Players Required • Keyboard Controls
        </p>
      </div>
    </div>
  )
}

function CharCard({ name, controls, color, bg, border, emoji, emojiColor }) {
  return (
    <div style={{
      background: 'rgba(27,21,50,0.85)',
      border: `1px solid rgba(${border === '#ff89ad' ? '255,137,173' : '0,227,253'},0.25)`,
      borderRadius: 20, padding: '28px 40px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      backdropFilter: 'blur(12px)',
      boxShadow: `0 0 40px rgba(${border === '#ff89ad' ? '255,137,173' : '0,227,253'},0.08)`,
      width: 220,
    }}>
      {/* Portrait circle */}
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${border === '#ff89ad' ? '#3d1a2e' : '#0a3040'} 0%, #1b1532 100%)`,
        border: `3px solid ${color}`,
        boxShadow: `0 0 20px ${color}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 52,
      }}>
        {emoji}
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ color, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{name}</div>
        <div style={{
          background: `${color}22`, border: `1px solid ${color}44`,
          borderRadius: 999, padding: '3px 12px',
          color, fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {controls}
        </div>
      </div>
    </div>
  )
}

const playBtnStyle = {
  padding: '14px 64px', borderRadius: 999, border: 'none',
  background: 'linear-gradient(90deg, #ff89ad, #d277ff)',
  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: 0.5,
  boxShadow: '0 0 24px rgba(255,137,173,0.5)',
  transition: 'transform 0.1s, box-shadow 0.1s',
  width: 260,
}

const lbBtnStyle = {
  padding: '14px 64px', borderRadius: 999,
  border: '2px solid #00e3fd',
  background: 'transparent',
  color: '#00e3fd', fontSize: 16, fontWeight: 700, cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: 0.5,
  boxShadow: '0 0 16px rgba(0,227,253,0.2)',
  width: 260,
}
