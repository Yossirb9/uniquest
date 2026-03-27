import { TILE } from './constants.js'

// Each level: platforms, hazards, gems, switches, gates, portals
export const LEVELS = [
  {
    name: 'Crystal Caverns',
    platforms: [
      // ground sections
      { x: 0,    y: 600, w: 200, h: TILE },
      { x: 240,  y: 600, w: 160, h: TILE },
      { x: 460,  y: 600, w: 160, h: TILE },
      { x: 680,  y: 600, w: 160, h: TILE },
      { x: 900,  y: 600, w: 180, h: TILE },
      { x: 1140, y: 600, w: 140, h: TILE },
      // upper
      { x: 100,  y: 480, w: 120, h: TILE },
      { x: 320,  y: 420, w: 120, h: TILE },
      { x: 540,  y: 360, w: 140, h: TILE },
      { x: 760,  y: 420, w: 120, h: TILE },
      { x: 960,  y: 480, w: 120, h: TILE },
      // high platforms
      { x: 200,  y: 280, w: 120, h: TILE },
      { x: 660,  y: 260, w: 140, h: TILE },
      { x: 1000, y: 300, w: 120, h: TILE },
      // top
      { x: 60,   y: 160, w: 100, h: TILE },
      { x: 1100, y: 160, w: 100, h: TILE },
    ],
    hazards: [
      // lava pools (dangerous for rainbow unicorn)
      { x: 200, y: 592, w: 40,  h: 48, type: 'lava' },
      { x: 620, y: 592, w: 60,  h: 48, type: 'lava' },
      // ice pools (dangerous for crystal unicorn)
      { x: 840, y: 592, w: 60,  h: 48, type: 'ice' },
      { x: 1080,y: 592, w: 60,  h: 48, type: 'ice' },
    ],
    movingPlatforms: [
      { x: 440, y: 500, w: 100, h: TILE, dx: 1.5, minX: 380, maxX: 560 },
    ],
    switches: [
      { x: 320, y: 404, w: 32, h: 16, id: 'sw1' },
    ],
    gates: [
      { x: 596, y: 320, w: 16, h: 80, id: 'sw1' },
    ],
    gems: [
      { x: 150, y: 455 }, { x: 360, y: 395 }, { x: 580, y: 335 },
      { x: 240, y: 255 }, { x: 690, y: 235 }, { x: 800, y: 395 },
      { x: 990, y: 275 }, { x: 1010, y: 455 }, { x: 80,  y: 135 },
      { x: 1120, y: 135 },
    ],
    portalRainbow: { x: 80,   y: 80,  w: 50, h: 80 },
    portalCrystal: { x: 1130, y: 80,  w: 50, h: 80 },
    spawnRainbow:  { x: 30,   y: 555 },
    spawnCrystal:  { x: 1200, y: 555 },
  },
  {
    name: 'Rainbow Abyss',
    platforms: [
      { x: 0,    y: 600, w: 160, h: TILE },
      { x: 220,  y: 560, w: 100, h: TILE },
      { x: 380,  y: 500, w: 100, h: TILE },
      { x: 540,  y: 450, w: 120, h: TILE },
      { x: 720,  y: 500, w: 100, h: TILE },
      { x: 880,  y: 560, w: 100, h: TILE },
      { x: 1040, y: 600, w: 240, h: TILE },
      { x: 160,  y: 380, w: 120, h: TILE },
      { x: 440,  y: 320, w: 100, h: TILE },
      { x: 660,  y: 320, w: 100, h: TILE },
      { x: 900,  y: 380, w: 120, h: TILE },
      { x: 300,  y: 220, w: 120, h: TILE },
      { x: 860,  y: 220, w: 120, h: TILE },
      { x: 560,  y: 180, w: 160, h: TILE },
      { x: 80,   y: 120, w: 100, h: TILE },
      { x: 1100, y: 120, w: 100, h: TILE },
    ],
    hazards: [
      { x: 160,  y: 592, w: 60,  h: 48, type: 'lava' },
      { x: 480,  y: 592, w: 60,  h: 48, type: 'lava' },
      { x: 780,  y: 592, w: 60,  h: 48, type: 'ice' },
      { x: 980,  y: 592, w: 60,  h: 48, type: 'ice' },
    ],
    movingPlatforms: [
      { x: 340, y: 440, w: 90, h: TILE, dx: 2, minX: 280, maxX: 480 },
      { x: 770, y: 440, w: 90, h: TILE, dx: -2, minX: 700, maxX: 860 },
    ],
    switches: [
      { x: 460, y: 304, w: 32, h: 16, id: 'sw1' },
      { x: 680, y: 304, w: 32, h: 16, id: 'sw2' },
    ],
    gates: [
      { x: 556, y: 100, w: 16, h: 80, id: 'sw1' },
      { x: 724, y: 100, w: 16, h: 80, id: 'sw2' },
    ],
    gems: [
      { x: 200, y: 355 }, { x: 370, y: 195 }, { x: 460, y: 295 },
      { x: 680, y: 295 }, { x: 900, y: 355 }, { x: 590, y: 155 },
      { x: 300, y: 195 }, { x: 880, y: 195 }, { x: 100, y: 95 },
      { x: 1120, y: 95 },
    ],
    portalRainbow: { x: 90,   y: 40,  w: 50, h: 80 },
    portalCrystal: { x: 1120, y: 40,  w: 50, h: 80 },
    spawnRainbow:  { x: 20,   y: 555 },
    spawnCrystal:  { x: 1220, y: 555 },
  },
]
