import { useState } from 'react'
import { submitScore } from '../supabase.js'
import { LEVELS } from '../game/levels.js'

export default function WinScreen({ result, levelIndex, onNextLevel, onMenu, onLeaderboard }) {
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const hasNextLevel = levelIndex + 1 < LEVELS.length

  const score = Math.round(
    result.gems * 500 +
    Math.max(0, 3000 - Math.floor(result.time) * 10)
  )
  const mins = Math.floor(result.time / 60).toString().padStart(2, '0')
  const secs = Math.floor(result.time % 60).toString().padStart(2, '0')

  async function handleSubmit() {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    await submitScore({
      player_name: name.trim(),
      score,
      gems: result.gems,
      level: levelIndex + 1,
      time_seconds: Math.floor(result.time),
    })
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div style={{
      width: 1280, height: 688,
      background: 'linear-gradient(135deg, #0d0820 0%, #1a0f3c 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 24, fontFamily: 'monospace',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Sparkles bg */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 137.5) % 100}%`,
          top:  `${(i * 83.7) % 100}%`,
          width: 4, height: 4,
          borderRadius: '50%',
          background: ['#ff6b9d', '#c44dff', '#00e5ff', '#ffd700'][i % 4],
          boxShadow: `0 0 6px 2px ${['#ff6b9d', '#c44dff', '#00e5ff', '#ffd700'][i % 4]}`,
          animation: `twinkle ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
        }} />
      ))}

      <div style={{ fontSize: 64 }}>🎉</div>
      <div style={{
        fontSize: 48, fontWeight: 'bold', color: '#ffd700',
        textShadow: '0 0 20px #ffd700',
      }}>
        Level Complete!
      </div>
      <div style={{ color: '#b8a9d9', fontSize: 18 }}>
        Level {levelIndex + 1} — {LEVELS[levelIndex].name}
      </div>

      {/* Stats */}
      <div style={{
        background: 'rgba(26,15,60,0.85)', border: '1px solid rgba(124,58,237,0.5)',
        borderRadius: 16, padding: '24px 48px', display: 'flex', gap: 48,
      }}>
        <Stat label="💎 Gems" value={`${result.gems}`} color="#bf5af2" />
        <Stat label="⏱ Time" value={`${mins}:${secs}`} color="#00e5ff" />
        <Stat label="⭐ Score" value={score.toLocaleString()} color="#ffd700" />
      </div>

      {/* Score submission */}
      {!submitted ? (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter your name..."
            maxLength={20}
            style={{
              padding: '10px 18px', borderRadius: 999,
              border: '2px solid rgba(124,58,237,0.6)',
              background: 'rgba(26,15,60,0.9)', color: '#f0eaff',
              fontSize: 16, fontFamily: 'monospace', outline: 'none', width: 220,
            }}
          />
          <button onClick={handleSubmit} disabled={submitting || !name.trim()} style={{
            padding: '10px 24px', borderRadius: 999, border: 'none',
            background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
            color: '#fff', cursor: 'pointer', fontFamily: 'monospace',
            fontWeight: 'bold', fontSize: 15, opacity: name.trim() ? 1 : 0.5,
          }}>
            {submitting ? '...' : '🏆 Submit Score'}
          </button>
        </div>
      ) : (
        <div style={{ color: '#00ff88', fontSize: 18 }}>✅ Score submitted!</div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16 }}>
        {hasNextLevel && (
          <button onClick={onNextLevel} style={actionBtn('#ff6b9d', '#c44dff')}>
            ▶ Next Level
          </button>
        )}
        <button onClick={onLeaderboard} style={actionBtn('transparent', '#00e5ff', true)}>
          🏆 Leaderboard
        </button>
        <button onClick={onMenu} style={actionBtn('transparent', '#7c3aed', true)}>
          🏠 Menu
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#b8a9d9', fontSize: 14, marginBottom: 4 }}>{label}</div>
      <div style={{ color, fontSize: 32, fontWeight: 'bold', textShadow: `0 0 10px ${color}` }}>{value}</div>
    </div>
  )
}

function actionBtn(from, to, outline = false) {
  return {
    padding: '12px 32px', borderRadius: 999,
    border: outline ? `2px solid ${to}` : 'none',
    background: outline ? 'transparent' : `linear-gradient(90deg, ${from}, ${to})`,
    color: '#fff', cursor: 'pointer', fontFamily: 'monospace',
    fontWeight: 'bold', fontSize: 16,
    boxShadow: `0 0 12px ${to}66`,
  }
}
