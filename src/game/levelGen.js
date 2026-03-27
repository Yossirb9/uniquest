import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js'

// Seeded RNG so the same levelIndex always gives the same level
function seededRng(seed) {
  let s = seed + 1
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const LEVEL_NAMES = [
  'Crystal Caverns', 'Rainbow Abyss', 'Moonlit Peaks', 'Neon Swamps',
  'Starfall Temple', 'Prismatic Depths', 'Aurora Heights', 'Void Labyrinth',
  'Cosmic Cliffs', 'Eternal Ruins',
]

// Jump physics: JUMP_FORCE=-14, GRAVITY=0.45
// Max jump height ≈ 14²/(2*0.45) ≈ 218px → use max 180px gaps safely
const MAX_JUMP_H = 175  // px vertical gap between platforms (safe)
const MAX_JUMP_W = 240  // px horizontal gap (at MOVE_SPEED=5)

export function generateLevel(levelIndex) {
  const rng = seededRng(levelIndex * 7919 + 13)
  const difficulty = Math.min(levelIndex, 8) // caps at 8

  const name = LEVEL_NAMES[levelIndex % LEVEL_NAMES.length]

  // --- PLATFORMS ---
  // Always start with ground sections at y=580, then build upward
  const platforms = []
  const GROUND_Y = 580
  const TILE_H = 20

  // Left ground spawn
  platforms.push({ x: 0,    y: GROUND_Y, w: 160, h: TILE_H })
  // Right ground spawn
  platforms.push({ x: CANVAS_WIDTH - 160, y: GROUND_Y, w: 160, h: TILE_H })

  // Generate a path of stepping-stone platforms from left-bottom to top-left portal
  // and from right-bottom to top-right portal
  // Both paths must be reachable within jump physics

  const leftPath  = buildPath(rng, 80,  GROUND_Y - 20, 140, difficulty, 'left')
  const rightPath = buildPath(rng, CANVAS_WIDTH - 120, GROUND_Y - 20, 140, difficulty, 'right')

  // Middle connecting platforms
  const midPlats = buildMidSection(rng, difficulty)

  platforms.push(...leftPath, ...rightPath, ...midPlats)

  // --- HAZARDS ---
  const hazards = buildHazards(rng, difficulty, platforms)

  // --- MOVING PLATFORMS ---
  const movingPlatforms = buildMoving(rng, difficulty)

  // --- GEMS ---
  const allPlats = [...platforms, ...movingPlatforms]
  const gems = placeGems(rng, allPlats, 8 + difficulty * 2)

  // --- SWITCHES & GATES ---
  const { switches, gates } = buildSwitchGates(rng, difficulty, platforms)

  // Portals at top
  const portalRainbow = { x: 40,  y: 60, w: 50, h: 80 }
  const portalCrystal = { x: CANVAS_WIDTH - 90, y: 60, w: 50, h: 80 }

  // Portal platforms
  platforms.push({ x: 20,  y: 140, w: 100, h: TILE_H })
  platforms.push({ x: CANVAS_WIDTH - 120, y: 140, w: 100, h: TILE_H })

  return {
    name,
    platforms,
    hazards,
    movingPlatforms,
    switches,
    gates,
    gems,
    portalRainbow,
    portalCrystal,
    spawnRainbow:  { x: 20,   y: GROUND_Y - 50 },
    spawnCrystal:  { x: CANVAS_WIDTH - 80, y: GROUND_Y - 50 },
  }
}

function buildPath(rng, startX, startY, w, difficulty, side) {
  const plats = []
  let cx = startX
  let cy = startY
  const steps = 4 + Math.floor(difficulty * 0.5)

  for (let i = 0; i < steps; i++) {
    const pw = w - difficulty * 4 - Math.floor(rng() * 20)  // platforms get narrower
    const safeW = Math.max(pw, 60)
    const dx = side === 'left'
      ? 60  + Math.floor(rng() * Math.min(MAX_JUMP_W - 80, 80 + difficulty * 12))
      : -(60 + Math.floor(rng() * Math.min(MAX_JUMP_W - 80, 80 + difficulty * 12)))

    // Step up ~80-160px each time, always within jump height
    const dy = -(80 + Math.floor(rng() * Math.min(MAX_JUMP_H - 80, 60 + difficulty * 10)))

    cx = Math.max(20, Math.min(CANVAS_WIDTH - safeW - 20, cx + dx))
    cy = Math.max(160, cy + dy)

    plats.push({ x: cx, y: cy, w: safeW, h: 20 })
  }
  return plats
}

function buildMidSection(rng, difficulty) {
  const plats = []
  // 2-4 central platforms for connectivity
  const count = 2 + Math.floor(difficulty * 0.4)
  const centerX = CANVAS_WIDTH / 2
  for (let i = 0; i < count; i++) {
    const y = 200 + i * (140 + Math.floor(rng() * 60))
    if (y > 520) continue
    const w = 100 - difficulty * 5
    const safeW = Math.max(w, 60)
    const x = centerX - safeW / 2 + (rng() - 0.5) * 160
    plats.push({ x: Math.max(200, Math.min(CANVAS_WIDTH - safeW - 200, x)), y, w: safeW, h: 20 })
  }
  return plats
}

function buildHazards(rng, difficulty, platforms) {
  const hazards = []
  const GROUND_Y = 580
  // Lava gaps on the left side, ice gaps on the right
  const numLava = 1 + Math.floor(difficulty * 0.4)
  const numIce  = 1 + Math.floor(difficulty * 0.4)

  for (let i = 0; i < numLava; i++) {
    const x = 160 + Math.floor(rng() * (CANVAS_WIDTH / 2 - 200))
    hazards.push({ x, y: GROUND_Y + 8, w: 48 + difficulty * 4, h: 40, type: 'lava' })
  }
  for (let i = 0; i < numIce; i++) {
    const x = CANVAS_WIDTH / 2 + 40 + Math.floor(rng() * (CANVAS_WIDTH / 2 - 240))
    hazards.push({ x, y: GROUND_Y + 8, w: 48 + difficulty * 4, h: 40, type: 'ice' })
  }
  return hazards
}

function buildMoving(rng, difficulty) {
  const moving = []
  const count = 1 + Math.floor(difficulty * 0.5)
  for (let i = 0; i < count; i++) {
    const y = 300 + Math.floor(rng() * 200)
    const x = 200 + Math.floor(rng() * (CANVAS_WIDTH - 400))
    const range = 100 + Math.floor(rng() * 100)
    const speed = 1 + rng() * (1 + difficulty * 0.3)
    moving.push({ x, y, w: 90, h: 20, dx: speed, minX: x - range / 2, maxX: x + range / 2 })
  }
  return moving
}

function placeGems(rng, platforms, count) {
  const gems = []
  const shuffled = [...platforms].sort(() => rng() - 0.5)
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const p = shuffled[i]
    gems.push({ x: p.x + p.w / 2 - 10, y: p.y - 28 })
  }
  return gems
}

function buildSwitchGates(rng, difficulty, platforms) {
  const switches = []
  const gates = []

  if (difficulty < 1) return { switches, gates }

  // Find a mid platform for the switch
  const mid = platforms.find(p =>
    p.x > 200 && p.x < CANVAS_WIDTH - 200 && p.y > 250 && p.y < 450
  )
  if (!mid) return { switches, gates }

  switches.push({ x: mid.x + mid.w / 2 - 16, y: mid.y - 16, w: 32, h: 16, id: 'sw1' })

  // Gate blocks a passage slightly to the right of the switch platform
  const gateX = mid.x + mid.w + 20 + Math.floor(rng() * 40)
  const gateY = mid.y - 60
  gates.push({ x: gateX, y: gateY, w: 16, h: 80, id: 'sw1' })

  // Second switch/gate on harder levels
  if (difficulty >= 4) {
    const mid2 = platforms.find(p =>
      p.x > 400 && p.x < CANVAS_WIDTH - 400 && p.y > 150 && p.y < 300 && p !== mid
    )
    if (mid2) {
      switches.push({ x: mid2.x + mid2.w / 2 - 16, y: mid2.y - 16, w: 32, h: 16, id: 'sw2' })
      gates.push({ x: mid2.x - 50, y: mid2.y - 80, w: 16, h: 80, id: 'sw2' })
    }
  }

  return { switches, gates }
}
