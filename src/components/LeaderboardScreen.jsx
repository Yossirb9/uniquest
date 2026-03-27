import { useEffect, useState } from 'react'
import { fetchLeaderboard } from '../supabase.js'

const MEDAL = ['🥇', '🥈', '🥉']
const MEDAL_COLOR = ['#ffd700', '#c0c0c0', '#cd7f32']

export default function LeaderboardScreen({ onMenu, onPlay }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard().then(data => {
      setRows(data)
      setLoading(false)
    })
  }, [])

  // Podium top 3
  const top3 = rows.slice(0, 3)

  return (
    <div style={{
      width: 1280, height: 688,
      background: 'linear-gradient(135deg, #0d0820 0%, #1a0f3c 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 0 24px', gap: 0, fontFamily: 'monospace',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        fontSize: 36, fontWeight: 'bold', color: '#ffd700',
        textShadow: '0 0 20px #ffd700', marginBottom: 8,
      }}>
        🏆 Hall of Legends
      </div>

      {/* Podium */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, marginBottom: 24 }}>
        {[1, 0, 2].map((idx) => {
          const entry = top3[idx]
          if (!entry) return <div key={idx} style={{ width: 180 }} />
          const heights = [120, 160, 90]
          const h = heights[idx === 0 ? 1 : idx === 1 ? 0 : 2]
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{MEDAL[idx]}</div>
              <div style={{ color: MEDAL_COLOR[idx], fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>
                {entry.player_name}
              </div>
              <div style={{ color: MEDAL_COLOR[idx], fontSize: 13, marginBottom: 4 }}>
                {entry.score?.toLocaleString()}
              </div>
              <div style={{
                width: 140, height: h,
                background: `linear-gradient(180deg, ${MEDAL_COLOR[idx]}44, ${MEDAL_COLOR[idx]}22)`,
                border: `2px solid ${MEDAL_COLOR[idx]}88`,
                borderRadius: '8px 8px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
              }}>
                🦄
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div style={{
        width: 900, background: 'rgba(26,15,60,0.85)',
        border: '1px solid rgba(124,58,237,0.4)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '56px 1fr 120px 120px 90px 110px',
          background: 'rgba(124,58,237,0.2)', padding: '10px 16px',
          color: '#b8a9d9', fontSize: 13, fontWeight: 'bold',
          borderBottom: '1px solid rgba(124,58,237,0.3)',
        }}>
          <span>#</span>
          <span>Player</span>
          <span style={{ textAlign: 'center' }}>Level</span>
          <span style={{ textAlign: 'center' }}>Gems 💎</span>
          <span style={{ textAlign: 'center' }}>Time</span>
          <span style={{ textAlign: 'right' }}>Score ⭐</span>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#b8a9d9' }}>Loading...</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#b8a9d9' }}>
            No scores yet — be the first!
          </div>
        ) : (
          rows.map((row, i) => {
            const borderColor = i < 3 ? MEDAL_COLOR[i] : 'transparent'
            const mins = Math.floor((row.time_seconds || 0) / 60).toString().padStart(2, '0')
            const secs = ((row.time_seconds || 0) % 60).toString().padStart(2, '0')
            return (
              <div key={row.id || i} style={{
                display: 'grid', gridTemplateColumns: '56px 1fr 120px 120px 90px 110px',
                padding: '10px 16px',
                borderLeft: `4px solid ${borderColor}`,
                borderBottom: '1px solid rgba(124,58,237,0.15)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                color: i < 3 ? MEDAL_COLOR[i] : '#f0eaff',
                fontSize: 15,
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 'bold' }}>
                  {i < 3 ? MEDAL[i] : `#${i + 1}`}
                </span>
                <span style={{ fontWeight: i < 3 ? 'bold' : 'normal' }}>
                  {row.player_name}
                </span>
                <span style={{ textAlign: 'center', color: '#b8a9d9' }}>
                  Level {row.level}
                </span>
                <span style={{ textAlign: 'center', color: '#bf5af2' }}>
                  {row.gems}
                </span>
                <span style={{ textAlign: 'center', color: '#00e5ff' }}>
                  {mins}:{secs}
                </span>
                <span style={{ textAlign: 'right', fontWeight: 'bold', color: i < 3 ? MEDAL_COLOR[i] : '#ffd700' }}>
                  {row.score?.toLocaleString()}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <button onClick={onPlay} style={{
          padding: '12px 36px', borderRadius: 999, border: 'none',
          background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
          color: '#fff', cursor: 'pointer', fontFamily: 'monospace',
          fontWeight: 'bold', fontSize: 16,
        }}>
          ▶ Play Game
        </button>
        <button onClick={onMenu} style={{
          padding: '12px 36px', borderRadius: 999,
          border: '2px solid #7c3aed',
          background: 'transparent', color: '#f0eaff',
          cursor: 'pointer', fontFamily: 'monospace',
          fontWeight: 'bold', fontSize: 16,
        }}>
          🏠 Main Menu
        </button>
      </div>

      <div style={{ color: 'rgba(184,169,217,0.4)', fontSize: 11, marginTop: 12 }}>
        Powered by Supabase
      </div>
    </div>
  )
}
