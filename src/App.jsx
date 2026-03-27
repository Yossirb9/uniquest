import { useState } from 'react'
import { SCREENS } from './game/constants.js'
import MenuScreen from './components/MenuScreen.jsx'
import GameScreen from './components/GameScreen.jsx'
import WinScreen from './components/WinScreen.jsx'
import DeadScreen from './components/DeadScreen.jsx'
import LeaderboardScreen from './components/LeaderboardScreen.jsx'
import QuestsScreen from './components/QuestsScreen.jsx'
import SkinsScreen from './components/SkinsScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'

export default function App() {
  const [screen, setScreen] = useState(SCREENS.MENU)
  const [levelIndex, setLevelIndex] = useState(0)
  const [winResult, setWinResult] = useState(null)
  const [deadReason, setDeadReason] = useState('')

  function handleWin(result) {
    setWinResult(result)
    setScreen(SCREENS.WIN)
  }

  function handleDead(reason) {
    setDeadReason(reason)
    setScreen(SCREENS.GAMEOVER)
  }

  function handleNextLevel() {
    setLevelIndex(i => i + 1)
    setScreen(SCREENS.GAME)
  }

  function handlePlay() {
    setLevelIndex(0)
    setScreen(SCREENS.GAME)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0618',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        border: '2px solid rgba(124,58,237,0.4)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(124,58,237,0.3)',
      }}>
        {screen === SCREENS.MENU && (
          <MenuScreen
            onPlay={handlePlay}
            onLeaderboard={() => setScreen(SCREENS.LEADERBOARD)}
            onNav={(dest) => setScreen(dest)}
          />
        )}

        {screen === SCREENS.GAME && (
          <GameScreen
            key={`level-${levelIndex}`}
            levelIndex={levelIndex}
            onWin={handleWin}
            onDead={handleDead}
          />
        )}

        {screen === SCREENS.WIN && winResult && (
          <WinScreen
            result={winResult}
            levelIndex={levelIndex}
            onNextLevel={handleNextLevel}
            onMenu={() => setScreen(SCREENS.MENU)}
            onLeaderboard={() => setScreen(SCREENS.LEADERBOARD)}
          />
        )}

        {screen === SCREENS.GAMEOVER && (
          <DeadScreen
            reason={deadReason}
            onRetry={() => setScreen(SCREENS.GAME)}
            onMenu={() => setScreen(SCREENS.MENU)}
          />
        )}

        {screen === SCREENS.LEADERBOARD && (
          <LeaderboardScreen
            onMenu={() => setScreen(SCREENS.MENU)}
            onPlay={handlePlay}
          />
        )}

        {screen === SCREENS.QUESTS && (
          <QuestsScreen onMenu={() => setScreen(SCREENS.MENU)} />
        )}

        {screen === SCREENS.SKINS && (
          <SkinsScreen onMenu={() => setScreen(SCREENS.MENU)} />
        )}

        {screen === SCREENS.SETTINGS && (
          <SettingsScreen onMenu={() => setScreen(SCREENS.MENU)} />
        )}
      </div>
    </div>
  )
}
