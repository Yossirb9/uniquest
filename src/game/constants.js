export const CANVAS_WIDTH = 1280
export const CANVAS_HEIGHT = 640

export const GRAVITY = 0.38
export const JUMP_FORCE = -14
export const MOVE_SPEED = 5

export const UNICORN = {
  RAINBOW: 'rainbow',
  CRYSTAL: 'crystal',
}

export const TILE = 40

// Colors
export const COLORS = {
  bg: '#0a0618',
  platform: '#2d1b69',
  platformGlow: '#7c3aed',
  lava: '#ff4500',
  ice: '#00bfff',
  gem: '#bf5af2',
  rainbow: {
    body: '#ff6b9d',
    mane: ['#ff6b9d', '#ffcc00', '#00e5ff', '#c44dff'],
    portal: '#ff6b9d',
  },
  crystal: {
    body: '#00e5ff',
    mane: ['#00e5ff', '#4d79ff', '#c44dff'],
    portal: '#00e5ff',
  },
  switch: '#ffd700',
  gate: '#8b5cf6',
  hud: 'rgba(13,8,32,0.85)',
}

export const SCREENS = {
  MENU: 'menu',
  GAME: 'game',
  GAMEOVER: 'gameover',
  WIN: 'win',
  LEADERBOARD: 'leaderboard',
}
