import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js'

// Seeded RNG — same levelIndex = same level every time
function seededRng(seed) {
  let s = (seed + 1) * 48271
  return () => {
    s = (s * 16807 + 7) % 2147483647
    return (s - 1) / 2147483646
  }
}

const LEVEL_NAMES = [
  'Crystal Caverns', 'Rainbow Abyss', 'Moonlit Peaks', 'Neon Swamps',
  'Starfall Temple', 'Prismatic Depths', 'Aurora Heights', 'Void Labyrinth',
  'Cosmic Cliffs', 'Eternal Ruins',
]

// Physics constants (must match constants.js)
const JUMP_FORCE = 14   // pixels/frame upward
const GRAVITY    = 0.45 // pixels/frame² downward
const MOVE_SPEED = 5    // pixels/frame horizontal

// Maximum reliable jump metrics:
const MAX_JUMP_HEIGHT = Math.floor((JUMP_FORCE * JUMP_FORCE) / (2 * GRAVITY)) - 20  // ~198px safe
const T_PEAK          = Math.ceil(JUMP_FORCE / GRAVITY)                              // ~31 frames
const MAX_JUMP_HORIZ  = Math.floor(MOVE_SPEED * T_PEAK * 0.85)                       // ~131px safe

const GROUND_Y   = 580
const PORTAL_Y   = 80   // top of portal rect
const PLATFORM_H = 20
const SPAWN_OFFSET = 50  // spawn is GROUND_Y - SPAWN_OFFSET

export function generateLevel(levelIndex) {
  const rng = seededRng(levelIndex * 7919 + 13)
  const difficulty = Math.min(levelIndex, 8)
  const name = LEVEL_NAMES[levelIndex % LEVEL_NAMES.length]

  // Spawn positions
  const spawnRainbow = { x: 30,  y: GROUND_Y - SPAWN_OFFSET }
  const spawnCrystal = { x: CANVAS_WIDTH - 70, y: GROUND_Y - SPAWN_OFFSET }

  // Portal rects
  const portalRainbow = { x: 30,  y: PORTAL_Y, w: 50, h: 80 }
  const portalCrystal = { x: CANVAS_WIDTH - 80, y: PORTAL_Y, w: 50, h: 80 }

  // Platform width scales with difficulty (easier = wider)
  const platW = () => Math.max(90, 140 - difficulty * 6 - Math.floor(rng() * 20))

  // --- Build two guaranteed stepping-stone paths ---
  // Left path: rainbow unicorn (P1) climbs left side
  const leftPath  = buildGuaranteedPath(
    rng,
    spawnRainbow.x + 15,  GROUND_Y - PLATFORM_H,   // start on ground
    portalRainbow.x + 25, PORTAL_Y + 80 + PLATFORM_H, // reach under portal
    difficulty, platW, 'left'
  )

  // Right path: crystal unicorn (P2) climbs right side
  const rightPath = buildGuaranteedPath(
    rng,
    spawnCrystal.x + 15, GROUND_Y - PLATFORM_H,
    portalCrystal.x + 25, PORTAL_Y + 80 + PLATFORM_H,
    difficulty, platW, 'right'
  )

  // Ground sections
  const platforms = [
    { x: 0,   y: GROUND_Y, w: 180, h: PLATFORM_H },                          // left ground
    { x: CANVAS_WIDTH - 180, y: GROUND_Y, w: 180, h: PLATFORM_H },           // right ground
    // portal landing platforms
    { x: portalRainbow.x - 10, y: PORTAL_Y + 80, w: 70, h: PLATFORM_H },
    { x: portalCrystal.x - 10, y: PORTAL_Y + 80, w: 70, h: PLATFORM_H },
    ...leftPath,
    ...rightPath,
  ]

  // Add optional mid-section platforms for connectivity (non-critical)
  if (difficulty >= 2) {
    const midPlats = buildMidSection(rng, difficulty, platW)
    platforms.push(...midPlats)
  }

  // --- Hazards: lava (kills rainbow) on left, ice (kills crystal) on right ---
  const hazards = buildHazards(rng, difficulty)

  // --- Moving platforms (only on harder levels) ---
  const movingPlatforms = difficulty >= 2 ? buildMoving(rng, difficulty, platW) : []

  // --- Gems on top of each platform ---
  const allStatic = [...platforms, ...movingPlatforms]
  const gems = placeGems(rng, allStatic, 8 + difficulty * 2)

  // --- Switches & gates (cooperative mechanic) ---
  const { switches, gates } = difficulty >= 1
    ? buildSwitchGates(rng, platforms)
    : { switches: [], gates: [] }

  return {
    name, platforms, hazards, movingPlatforms,
    switches, gates, gems,
    portalRainbow, portalCrystal,
    spawnRainbow, spawnCrystal,
  }
}

/**
 * Build a guaranteed-reachable chain of platforms from (startX, startY) to (endX, endY).
 * Each consecutive platform is within MAX_JUMP_HEIGHT and MAX_JUMP_HORIZ.
 */
function buildGuaranteedPath(rng, startX, startY, endX, endY, difficulty, platW, side) {
  const totalRise = startY - endY            // positive = going up
  const totalRun  = endX - startX           // can be ±

  // Number of steps: at least ceil(totalRise / SAFE_STEP_H)
  const SAFE_STEP_H = Math.min(MAX_JUMP_HEIGHT - 30, 140)  // 140px per step max
  const minSteps = Math.ceil(totalRise / SAFE_STEP_H)
  const steps = Math.max(minSteps, 3 + Math.floor(difficulty * 0.3))

  const platforms = []
  let cx = startX
  let cy = startY

  for (let i = 0; i < steps; i++) {
    const progress = (i + 1) / steps

    // Target position at this step along the path
    const targetX = startX + totalRun  * progress
    const targetY = startY - totalRise * progress

    // Add jitter (smaller on easier levels)
    const jitterX = (rng() - 0.5) * (40 - difficulty * 3)
    const jitterY = (rng() - 0.5) * 20

    // Clamp vertical step to safe jump height
    const stepH = Math.min(MAX_JUMP_HEIGHT - 20, cy - targetY + jitterY)
    const safeStepH = Math.max(40, stepH)  // at least 40px per step

    const nx = Math.max(30, Math.min(CANVAS_WIDTH - 130, targetX + jitterX))
    const ny = cy - safeStepH

    // Ensure horizontal gap is within jump range
    const dx = Math.abs(nx - cx)
    if (dx > MAX_JUMP_HORIZ) {
      // Add an intermediate stepping stone
      const midX = (cx + nx) / 2 + (rng() - 0.5) * 30
      const midY = cy - safeStepH * 0.4
      const midW = Math.max(80, platW() - 10)
      platforms.push({
        x: Math.max(20, Math.min(CANVAS_WIDTH - midW - 20, midX - midW / 2)),
        y: Math.max(100, midY),
        w: midW, h: 20,
      })
      cy = midY
      cx = midX
    }

    const w = platW()
    platforms.push({
      x: Math.max(20, Math.min(CANVAS_WIDTH - w - 20, nx - w / 2)),
      y: Math.max(100, ny),
      w, h: 20,
    })

    cx = nx
    cy = Math.max(100, ny)
  }

  return platforms
}

function buildMidSection(rng, difficulty, platW) {
  const plats = []
  const count = 1 + Math.floor(difficulty * 0.4)
  for (let i = 0; i < count; i++) {
    const y = 220 + i * 150 + Math.floor(rng() * 60)
    if (y > 500) continue
    const w = platW()
    const x = CANVAS_WIDTH / 2 - w / 2 + (rng() - 0.5) * 200
    plats.push({ x: Math.max(200, Math.min(CANVAS_WIDTH - w - 200, x)), y, w, h: 20 })
  }
  return plats
}

function buildHazards(rng, difficulty) {
  const hazards = []
  const GROUND_Y = 580
  const numLava = 1 + Math.floor(difficulty * 0.4)
  const numIce  = 1 + Math.floor(difficulty * 0.4)

  for (let i = 0; i < numLava; i++) {
    const x = 180 + Math.floor(rng() * (CANVAS_WIDTH / 2 - 220))
    hazards.push({ x, y: GROUND_Y + 8, w: 50 + difficulty * 4, h: 36, type: 'lava' })
  }
  for (let i = 0; i < numIce; i++) {
    const x = CANVAS_WIDTH / 2 + 40 + Math.floor(rng() * (CANVAS_WIDTH / 2 - 260))
    hazards.push({ x, y: GROUND_Y + 8, w: 50 + difficulty * 4, h: 36, type: 'ice' })
  }
  return hazards
}

function buildMoving(rng, difficulty, platW) {
  const moving = []
  const count = 1 + Math.floor(difficulty * 0.4)
  for (let i = 0; i < count; i++) {
    const y = 280 + Math.floor(rng() * 220)
    const x = 220 + Math.floor(rng() * (CANVAS_WIDTH - 440))
    const range = 80 + Math.floor(rng() * 80)
    const speed = 1 + rng() * (0.8 + difficulty * 0.25)
    const w = Math.max(80, platW())
    moving.push({ x, y, w, h: 20, dx: speed, minX: x - range / 2, maxX: x + range / 2 })
  }
  return moving
}

function placeGems(rng, platforms, count) {
  const gems = []
  const shuffled = [...platforms].sort(() => rng() - 0.5)
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const p = shuffled[i]
    gems.push({ x: p.x + p.w / 2 - 10, y: p.y - 30 })
  }
  return gems
}

function buildSwitchGates(rng, platforms) {
  const switches = []
  const gates = []

  // Find a platform in a mid zone
  const candidates = platforms.filter(p =>
    p.x > 250 && p.x < CANVAS_WIDTH - 250 && p.y > 200 && p.y < 480
  )
  if (candidates.length === 0) return { switches, gates }

  const sw = candidates[Math.floor(rng() * candidates.length)]
  switches.push({ x: sw.x + sw.w / 2 - 16, y: sw.y - 16, w: 32, h: 16, id: 'sw1' })

  // Gate blocking a nearby passage
  const gx = Math.min(sw.x + sw.w + 30, CANVAS_WIDTH - 50)
  gates.push({ x: gx, y: sw.y - 70, w: 16, h: 70, id: 'sw1' })

  return { switches, gates }
}
