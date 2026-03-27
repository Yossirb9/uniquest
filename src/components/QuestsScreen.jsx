const QUESTS = [
  { id: 1, icon: '💎', title: 'אספן מתחיל',    desc: 'אסוף 50 אבנים סה"כ',         target: 50,  current: 12, reward: 500,  done: false },
  { id: 2, icon: '🏃', title: 'ריצה מהירה',    desc: 'סיים שלב תוך פחות מ-2 דקות', target: 1,   current: 0,  reward: 800,  done: false },
  { id: 3, icon: '🤝', title: 'עבודת צוות',    desc: 'השתמש ב-BOOST פעמיים',       target: 2,   current: 0,  reward: 1000, done: false },
  { id: 4, icon: '🌟', title: 'מושלם',          desc: 'סיים שלב עם כל האבנים',       target: 1,   current: 0,  reward: 1500, done: false },
  { id: 5, icon: '⚡', title: 'חד-קרן מהיר',   desc: 'הגע לשלב 5',                  target: 5,   current: 1,  reward: 2000, done: false },
  { id: 6, icon: '🔥', title: 'עמיד ללהבות',   desc: 'הגע לשלב 10',                 target: 10,  current: 1,  reward: 5000, done: false },
]

export default function QuestsScreen({ onMenu }) {
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
        <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 24 }}>📋 משימות</div>
        <button onClick={onMenu} style={backBtn}>← חזרה</button>
      </div>

      <div style={{ padding: '32px 80px', overflowY: 'auto', flex: 1 }}>
        <p style={{ color: '#a89bc4', marginBottom: 32, fontSize: 15 }}>
          השלם משימות וצבור ניקוד נוסף!
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {QUESTS.map(q => (
            <div key={q.id} style={{
              background: 'rgba(27,21,50,0.8)',
              border: `1px solid ${q.done ? '#ffd700' : 'rgba(189,157,255,0.2)'}`,
              borderRadius: 16, padding: '20px 24px',
              display: 'flex', gap: 16, alignItems: 'center',
              opacity: q.done ? 1 : 0.85,
            }}>
              <div style={{ fontSize: 36 }}>{q.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#f0eaff', fontWeight: 700, fontSize: 16 }}>{q.title}</div>
                <div style={{ color: '#a89bc4', fontSize: 13, margin: '4px 0 10px' }}>{q.desc}</div>
                {/* Progress bar */}
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 999, height: 6, width: '100%' }}>
                  <div style={{
                    height: 6, borderRadius: 999,
                    width: `${Math.min(100, (q.current / q.target) * 100)}%`,
                    background: 'linear-gradient(90deg, #ff89ad, #d277ff)',
                  }} />
                </div>
                <div style={{ color: '#a89bc4', fontSize: 11, marginTop: 4 }}>
                  {q.current}/{q.target}
                </div>
              </div>
              <div style={{
                color: '#ffd700', fontSize: 13, fontWeight: 700,
                background: 'rgba(255,215,0,0.1)', padding: '4px 10px', borderRadius: 999,
                whiteSpace: 'nowrap',
              }}>
                ⭐ {q.reward.toLocaleString()}
              </div>
            </div>
          ))}
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
