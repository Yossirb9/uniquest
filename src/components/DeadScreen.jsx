export default function DeadScreen({ reason, onRetry, onMenu }) {
  return (
    <div style={{
      width: 1280, height: 688,
      background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f1e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 24, fontFamily: 'monospace',
    }}>
      <div style={{ fontSize: 64 }}>💀</div>
      <div style={{
        fontSize: 48, fontWeight: 'bold', color: '#ff4040',
        textShadow: '0 0 20px #ff4040',
      }}>
        Oops!
      </div>
      <div style={{ color: '#ff9dc8', fontSize: 20 }}>{reason}</div>
      <div style={{ color: '#b8a9d9', fontSize: 16 }}>
        Both unicorns must reach their portals together!
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <button onClick={onRetry} style={{
          padding: '14px 48px', borderRadius: 999, border: 'none',
          background: 'linear-gradient(90deg, #ff6b9d, #c44dff)',
          color: '#fff', cursor: 'pointer', fontFamily: 'monospace',
          fontWeight: 'bold', fontSize: 18,
          boxShadow: '0 0 20px #c44dff66',
        }}>
          🔄 Try Again
        </button>
        <button onClick={onMenu} style={{
          padding: '14px 48px', borderRadius: 999,
          border: '2px solid #7c3aed',
          background: 'transparent',
          color: '#f0eaff', cursor: 'pointer', fontFamily: 'monospace',
          fontWeight: 'bold', fontSize: 18,
        }}>
          🏠 Menu
        </button>
      </div>
    </div>
  )
}
