import { useEffect, useRef, useState } from 'react'
import { GameEngine } from '../game/GameEngine.js'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants.js'
import { generateLevel } from '../game/levelGen.js'

export default function GameScreen({ levelIndex = 0, onWin, onDead }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [hud, setHud] = useState({ gems: 0, totalGems: 0, time: 0 })
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const level = generateLevel(levelIndex)
    const engine = new GameEngine(canvas, level)
    engineRef.current = engine

    engine.start((state) => {
      setHud({ gems: state.gems, totalGems: state.totalGems, time: state.time })
      if (state.result === 'win')  onWin({ gems: state.gems, time: state.time, level: levelIndex })
      if (state.result === 'dead') onDead(state.deadReason)
    })

    const onKey = (e) => {
      if (e.code === 'Escape') {
        pausedRef.current = !pausedRef.current
        setPaused(pausedRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => { engine.destroy(); window.removeEventListener('keydown', onKey) }
  }, [levelIndex])

  const mins = Math.floor(hud.time / 60).toString().padStart(2, '0')
  const secs = Math.floor(hud.time % 60).toString().padStart(2, '0')
  const level = generateLevel(levelIndex) // just for name

  return (
    <div style={{ position: 'relative', width: CANVAS_WIDTH, fontFamily: "'Epilogue', sans-serif" }}>
      {/* HUD — Stitch style */}
      <div style={{
        height: 52, background: 'rgba(16,11,30,0.95)',
        borderBottom: '1px solid rgba(189,157,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        {/* P1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #3d1a2e, #2a1040)',
            border: '2px solid #ff89ad', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🦄</div>
          <div>
            <div style={{ color: '#ff89ad', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>RAINBOW</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#d277ff', fontSize: 13 }}>💎</span>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{hud.gems}</span>
            </div>
          </div>
          <span style={{ color: 'rgba(168,155,196,0.5)', fontSize: 11, marginLeft: 4 }}>P1</span>
        </div>

        {/* Center */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#a89bc4', fontSize: 12, fontWeight: 500 }}>
            Level {levelIndex + 1} — {level.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ color: '#a89bc4', fontSize: 14 }}>🕐</span>
            <span style={{ color: '#ffd700', fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>
              {mins}:{secs}
            </span>
          </div>
        </div>

        {/* P2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexDirection: 'row-reverse' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #0a2030, #1a1040)',
            border: '2px solid #00e3fd', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🦄</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#00e3fd', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>CRYSTAL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <span style={{ color: '#bd9dff', fontSize: 13 }}>💎</span>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{hud.totalGems - hud.gems}</span>
            </div>
          </div>
          <span style={{ color: 'rgba(168,155,196,0.5)', fontSize: 11, marginRight: 4 }}>P2</span>
        </div>
      </div>

      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ display: 'block' }} />

      {/* Bottom bar — Stitch style */}
      <div style={{
        height: 44, background: 'rgba(16,11,30,0.95)',
        borderTop: '1px solid rgba(189,157,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
      }}>
        <HudBtn icon="⏸" label="PAUSE (ESC)" onClick={() => { pausedRef.current = true; setPaused(true) }} />
        <HudBtn icon="🎒" label="INVENTORY" active />
        <HudBtn icon="🗺" label="MAP" />
      </div>

      {/* Pause overlay */}
      {paused && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
        }}>
          <div style={{ color: '#f0eaff', fontSize: 48, fontWeight: 900 }}>⏸ Paused</div>
          <div style={{ color: '#a89bc4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Press ESC to continue</div>
          <button onClick={() => { pausedRef.current = false; setPaused(false) }} style={{
            padding: '12px 40px', borderRadius: 999, border: 'none',
            background: 'linear-gradient(90deg, #ff89ad, #d277ff)',
            color: '#fff', cursor: 'pointer', fontFamily: "'Epilogue', sans-serif",
            fontWeight: 700, fontSize: 16,
          }}>▶ Continue</button>
          <button onClick={() => onDead('Quit')} style={{
            padding: '10px 32px', borderRadius: 999,
            border: '2px solid rgba(189,157,255,0.4)', background: 'transparent',
            color: '#a89bc4', cursor: 'pointer', fontFamily: "'Epilogue', sans-serif", fontSize: 14,
          }}>🏠 Quit to Menu</button>
        </div>
      )}
    </div>
  )
}

function HudBtn({ icon, label, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
      background: active ? 'rgba(189,157,255,0.15)' : 'transparent',
      border: active ? '1px solid rgba(189,157,255,0.3)' : '1px solid transparent',
      borderRadius: 8, padding: '4px 16px', cursor: 'pointer',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ color: active ? '#bd9dff' : '#79728a', fontSize: 9, fontWeight: 700, letterSpacing: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {label}
      </span>
    </button>
  )
}
