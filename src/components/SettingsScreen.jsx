import { useState } from 'react'

export default function SettingsScreen({ onMenu }) {
  const [sfx, setSfx]       = useState(80)
  const [music, setMusic]   = useState(60)
  const [shake, setShake]   = useState(true)
  const [hints, setHints]   = useState(true)
  const [lang, setLang]     = useState('he')

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
        <div style={{ color: '#00e3fd', fontWeight: 700, fontSize: 24 }}>⚙️ הגדרות</div>
        <button onClick={onMenu} style={backBtn}>← חזרה</button>
      </div>

      <div style={{ padding: '40px 200px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Controls reference */}
        <Section title="🎮 שליטה">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ControlCard player="שחקן 1 — רוח הקשת" color="#ff89ad" controls={[
              ['תנועה', 'A / D'],
              ['קפיצה', 'W'],
              ['קפיצת BOOST', 'W מעל השותף'],
            ]} />
            <ControlCard player="שחקן 2 — שומר הקריסטל" color="#00e3fd" controls={[
              ['תנועה', '← / →'],
              ['קפיצה', '↑'],
              ['קפיצת BOOST', '↑ מעל השותף'],
            ]} />
          </div>
          <div style={{
            marginTop: 16, padding: '12px 20px', borderRadius: 10,
            background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
            color: '#a89bc4', fontSize: 13,
          }}>
            💡 <strong style={{ color: '#ffd700' }}>מכניקת Boost:</strong> עמוד על גב השותף ולחץ קפיצה — תקפוץ פי 3 גובה רגיל! נחוץ להגיע לפלטפורמות גבוהות בשלבים מתקדמים.
          </div>
        </Section>

        {/* Audio */}
        <Section title="🔊 שמע">
          <SliderRow label="אפקטים קוליים" value={sfx} onChange={setSfx} />
          <SliderRow label="מוזיקה רקע"    value={music} onChange={setMusic} />
        </Section>

        {/* Gameplay */}
        <Section title="🕹️ משחקיות">
          <ToggleRow label="רטט מסך בנפילה"   value={shake} onChange={setShake} />
          <ToggleRow label="הצג רמזי משחק"    value={hints} onChange={setHints} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#f0eaff' }}>שפת ממשק</span>
            <select
              value={lang} onChange={e => setLang(e.target.value)}
              style={{
                background: 'rgba(27,21,50,0.9)', color: '#f0eaff',
                border: '1px solid rgba(189,157,255,0.4)', borderRadius: 8,
                padding: '6px 12px', fontFamily: "'Epilogue', sans-serif", fontSize: 14, cursor: 'pointer',
              }}
            >
              <option value="he">עברית 🇮🇱</option>
              <option value="en">English 🇺🇸</option>
            </select>
          </div>
        </Section>

        {/* Save */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={onMenu} style={{
            padding: '12px 56px', borderRadius: 999, border: 'none',
            background: 'linear-gradient(90deg, #ff89ad, #d277ff)',
            color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 16,
            fontFamily: "'Epilogue', sans-serif",
            boxShadow: '0 0 20px rgba(255,137,173,0.4)',
          }}>
            💾 שמור וחזור
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ color: '#bd9dff', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{title}</div>
      <div style={{
        background: 'rgba(27,21,50,0.7)', border: '1px solid rgba(189,157,255,0.15)',
        borderRadius: 16, padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {children}
      </div>
    </div>
  )
}

function SliderRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ color: '#f0eaff', width: 140 }}>{label}</span>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#d277ff' }}
      />
      <span style={{ color: '#bd9dff', width: 36, textAlign: 'right', fontWeight: 700 }}>{value}%</span>
    </div>
  )
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: '#f0eaff' }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 48, height: 26, borderRadius: 999, cursor: 'pointer',
          background: value ? 'linear-gradient(90deg, #ff89ad, #d277ff)' : 'rgba(255,255,255,0.15)',
          position: 'relative', transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: value ? 25 : 3,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  )
}

function ControlCard({ player, color, controls }) {
  return (
    <div style={{
      background: `rgba(${color === '#ff89ad' ? '255,137,173' : '0,227,253'},0.06)`,
      border: `1px solid ${color}33`, borderRadius: 12, padding: '16px 20px',
    }}>
      <div style={{ color, fontWeight: 700, marginBottom: 12, fontSize: 14 }}>{player}</div>
      {controls.map(([action, key]) => (
        <div key={action} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ color: '#a89bc4', fontSize: 13 }}>{action}</span>
          <span style={{
            color: '#f0eaff', fontSize: 12, fontFamily: 'monospace', fontWeight: 700,
            background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4,
          }}>{key}</span>
        </div>
      ))}
    </div>
  )
}

const backBtn = {
  padding: '8px 20px', borderRadius: 999,
  border: '1px solid rgba(189,157,255,0.4)',
  background: 'transparent', color: '#a89bc4',
  cursor: 'pointer', fontFamily: "'Epilogue', sans-serif", fontSize: 14,
}
