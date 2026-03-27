import { useState } from 'react'

const SKINS = [
  { id: 'default',  name: 'קשת',       color: '#ff89ad', unlocked: true,  emoji: '🦄' },
  { id: 'galaxy',   name: 'גלקסיה',    color: '#bd9dff', unlocked: true,  emoji: '🌌' },
  { id: 'fire',     name: 'אש',         color: '#ff6b35', unlocked: false, emoji: '🔥', cost: 2000 },
  { id: 'ice',      name: 'קרח',        color: '#00e3fd', unlocked: false, emoji: '❄️', cost: 2000 },
  { id: 'gold',     name: 'זהב',        color: '#ffd700', unlocked: false, emoji: '✨', cost: 5000 },
  { id: 'shadow',   name: 'צל',         color: '#7c3aed', unlocked: false, emoji: '🌑', cost: 5000 },
  { id: 'rainbow2', name: 'קשת מלכותי', color: '#ff89ad', unlocked: false, emoji: '👑', cost: 10000 },
  { id: 'cosmic',   name: 'קוסמי',      color: '#00ff88', unlocked: false, emoji: '🚀', cost: 10000 },
]

export default function SkinsScreen({ onMenu }) {
  const [selected, setSelected] = useState('default')

  return (
    <div style={{
      width: 1280, height: 736,
      background: 'linear-gradient(135deg, #0f0a22 0%, #1b1532 100%)',
      fontFamily: "'Epilogue', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 40px', borderBottom: '1px solid rgba(189,157,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ color: '#ff89ad', fontWeight: 900, fontSize: 20 }}>UniQuest</div>
        <div style={{ color: '#d277ff', fontWeight: 700, fontSize: 24 }}>🎨 עורות</div>
        <button onClick={onMenu} style={backBtn}>← חזרה</button>
      </div>

      <div style={{ padding: '32px 80px', flex: 1 }}>
        <p style={{ color: '#a89bc4', marginBottom: 32, fontSize: 15 }}>
          בחר עור לחד-הקרן שלך! עורות נעולים יפתחו עם ניקוד.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {SKINS.map(s => (
            <div
              key={s.id}
              onClick={() => s.unlocked && setSelected(s.id)}
              style={{
                background: selected === s.id
                  ? `linear-gradient(135deg, ${s.color}33, rgba(27,21,50,0.9))`
                  : 'rgba(27,21,50,0.8)',
                border: `2px solid ${selected === s.id ? s.color : 'rgba(189,157,255,0.2)'}`,
                borderRadius: 16, padding: '24px 16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                cursor: s.unlocked ? 'pointer' : 'default',
                opacity: s.unlocked ? 1 : 0.5,
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {!s.unlocked && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  fontSize: 16,
                }}>🔒</div>
              )}
              <div style={{
                width: 70, height: 70, borderRadius: '50%',
                background: `radial-gradient(circle, ${s.color}44, #1b1532)`,
                border: `3px solid ${s.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
                boxShadow: selected === s.id ? `0 0 20px ${s.color}88` : 'none',
              }}>
                {s.emoji}
              </div>
              <div style={{ color: s.unlocked ? '#f0eaff' : '#a89bc4', fontWeight: 700 }}>{s.name}</div>
              {s.cost && !s.unlocked && (
                <div style={{ color: '#ffd700', fontSize: 12 }}>⭐ {s.cost.toLocaleString()}</div>
              )}
              {s.unlocked && selected === s.id && (
                <div style={{ color: s.color, fontSize: 12, fontWeight: 700 }}>✓ נבחר</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center', color: '#a89bc4', fontSize: 13 }}>
          💡 צבור ניקוד בשלבים כדי לפתוח עורות נוספים
        </div>
      </div>
    </div>
  )
}

const backBtn = {
  padding: '8px 20px', borderRadius: 999,
  border: '1px solid rgba(189,157,255,0.4)',
  background: 'transparent', color: '#a89bc4',
  cursor: 'pointer', fontFamily: "'Epilogue', sans-serif", fontSize: 14,
}
