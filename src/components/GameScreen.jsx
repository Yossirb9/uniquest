import { useEffect, useRef, useState } from 'react'
import { GameEngine } from '../game/GameEngine.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants.js'
import { LEVELS } from '../game/levels.js'

export default function GameScreen({ levelIndex = 0, onWin, onDead }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [hud, setHud] = useState({ gems: 0, totalGems: 0, time: 0 })
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const engine = new GameEngine(canvas, levelIndex)
    engineRef.current = engine

    engine.start((state) => {
      setHud({ gems: state.gems, totalGems: state.totalGems, time: state.time })
      if (state.result === 'win')  onWin({ gems: state.gems, time: state.time, level: state.level })
      if (state.result === 'dead') onDead(state.deadReason)
    })

    const onKey = (e) => {
      if (e.code === 'Escape') {
        pausedRef.current = !pausedRef.current
        setPaused(pausedRef.current)
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      engine.destroy()
      window.removeEventListener('keydown', onKey)
    }
  }, [levelIndex])

  const level = LEVELS[levelIndex]
  const mins = Math.floor(hud.time / 60).toString().padStart(2, '0')
  const secs = Math.floor(hud.time % 60).toString().padStart(2, '0')

  return (
    <div style={{ position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT + 48 }}>
      {/* HUD */}
      <div style={{
        height: 48, background: 'rgba(13,8,32,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', borderBottom: '1px solid rgba(124,58,237,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ff9dc8', fontFamily: 'monospace', fontWeight: 'bold' }}>
          <span style={{ fontSize: 20 }}>🦄</span>
          <span>P1</span>
          <span style={{ color: '#bf5af2' }}>{'💎'.repeat(Math.min(hud.gems, 5))}</span>
          <span style={{ color: '#b8a9d9', fontSize: 13 }}>{hud.gems}/{hud.totalGems}</span>
        </div>

        <div style={{ textAlign: 'center', color: '#f0eaff', fontFamily: 'monospace' }}>
          <div style={{ fontSize: 13, color: '#b8a9d9' }}>
            Level {levelIndex + 1} — {level.name}
          </div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffd700' }}>
            {mins}:{secs}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#80f0ff', fontFamily: 'monospace', fontWeight: 'bold' }}>
          <span style={{ color: '#b8a9d9', fontSize: 13 }}>gems all shared</span>
          <span>P2</span>
          <span style={{ fontSize: 20 }}>🦄</span>
        </div>
      </div>

      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ display: 'block' }} />

      {/* ESC hint */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(184,169,217,0.5)', fontSize: 12, fontFamily: 'monospace',
      }}>
        ESC = Pause
      </div>

      {/* Pause overlay */}
      {paused && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 20,
        }}>
          <div style={{ color: '#f0eaff', fontSize: 48, fontWeight: 'bold', fontFamily: 'monospace' }}>
            ⏸ Paused
          </div>
          <div style={{ color: '#b8a9d9', fontFamily: 'monospace' }}>Press ESC to continue</div>
          <button
            onClick={() => onDead('Quit')}
            style={{
              padding: '10px 32px', borderRadius: 999, border: '2px solid #ff6b9d',
              background: 'transparent', color: '#ff6b9d', cursor: 'pointer',
              fontFamily: 'monospace', fontSize: 16,
            }}
          >
            🏠 Quit to Menu
          </button>
        </div>
      )}
    </div>
  )
}
