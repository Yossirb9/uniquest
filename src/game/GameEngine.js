import { GRAVITY, JUMP_FORCE, MOVE_SPEED, COLORS, UNICORN, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js'

export class GameEngine {
  constructor(canvas, level) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.level = level
    this.keys = {}
    this.gems = this.level.gems.map((g, i) => ({ ...g, id: i, collected: false }))
    this.movingPlatforms = this.level.movingPlatforms.map(p => ({ ...p }))
    this.switches = this.level.switches.map(s => ({ ...s, active: false }))
    this.gates = this.level.gates.map(g => ({ ...g, open: false }))
    this.particles = []
    this.time = 0
    this.tick = 0
    this.result = null // 'win' | 'dead'
    this.deadReason = ''

    this.rainbow = this._spawnUnicorn(UNICORN.RAINBOW)
    this.crystal = this._spawnUnicorn(UNICORN.CRYSTAL)

    this._bindKeys()
  }

  _spawnUnicorn(type) {
    const spawn = type === UNICORN.RAINBOW
      ? this.level.spawnRainbow
      : this.level.spawnCrystal
    return {
      type,
      x: spawn.x, y: spawn.y,
      w: 36, h: 44,
      vx: 0, vy: 0,
      onGround: false,
      facing: type === UNICORN.RAINBOW ? 1 : -1,
      alive: true,
      inPortal: false,
      animFrame: 0,
    }
  }

  _bindKeys() {
    this._onKeyDown = (e) => { this.keys[e.code] = true }
    this._onKeyUp   = (e) => { this.keys[e.code] = false }
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup',   this._onKeyUp)
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup',   this._onKeyUp)
    if (this._raf) cancelAnimationFrame(this._raf)
  }

  start(onUpdate) {
    this.onUpdate = onUpdate
    const loop = (ts) => {
      this.time = ts / 1000
      this.update()
      this.draw()
      if (onUpdate) onUpdate({
        gems: this.gems.filter(g => g.collected).length,
        totalGems: this.gems.length,
        time: this.time,
        result: this.result,
        deadReason: this.deadReason,
        level: this.levelIndex,
      })
      if (!this.result) this._raf = requestAnimationFrame(loop)
    }
    this._raf = requestAnimationFrame(loop)
  }

  update() {
    this.tick++

    // Move platforms
    this.movingPlatforms.forEach(p => {
      p.x += p.dx
      if (p.x <= p.minX || p.x + p.w >= p.maxX) p.dx *= -1
    })

    // Update unicorns
    this._updateUnicorn(this.rainbow, 'KeyA', 'KeyD', 'KeyW')
    this._updateUnicorn(this.crystal, 'ArrowLeft', 'ArrowRight', 'ArrowUp')

    // Switches
    this.switches.forEach(sw => {
      const wasActive = sw.active
      sw.active = this._unicornOnSwitch(this.rainbow, sw) || this._unicornOnSwitch(this.crystal, sw)
      if (sw.active !== wasActive) {
        this.gates.filter(g => g.id === sw.id).forEach(g => g.open = sw.active)
      }
    })

    // Gems
    this.gems.forEach(g => {
      if (g.collected) return
      const r = 16
      if (this._circleRect(g.x + r, g.y + r, r, this.rainbow) ||
          this._circleRect(g.x + r, g.y + r, r, this.crystal)) {
        g.collected = true
        this._burst(g.x + r, g.y + r, COLORS.gem)
      }
    })

    // Particles
    this.particles = this.particles.filter(p => p.life > 0)
    this.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--
    })

    // Portal check
    const allGems = this.gems.every(g => g.collected)
    const rPortal = this.level.portalRainbow
    const cPortal = this.level.portalCrystal
    if (this._overlaps(this.rainbow, rPortal) && this._overlaps(this.crystal, cPortal)) {
      this.result = 'win'
    }

    // Animate
    if (this.tick % 8 === 0) {
      this.rainbow.animFrame = (this.rainbow.animFrame + 1) % 4
      this.crystal.animFrame = (this.crystal.animFrame + 1) % 4
    }
  }

  _updateUnicorn(u, leftKey, rightKey, jumpKey) {
    if (!u.alive) return

    // Input
    if (this.keys[leftKey])  { u.vx = -MOVE_SPEED; u.facing = -1 }
    else if (this.keys[rightKey]) { u.vx = MOVE_SPEED; u.facing = 1 }
    else u.vx = 0

    if (this.keys[jumpKey] && u.onGround) {
      u.vy = JUMP_FORCE
      u.onGround = false
    }

    // Gravity
    u.vy += GRAVITY
    if (u.vy > 16) u.vy = 16

    // Move X
    u.x += u.vx
    this._resolveX(u)

    // Move Y
    u.y += u.vy
    u.onGround = false
    this._resolveY(u)

    // Clamp to canvas
    if (u.x < 0) u.x = 0
    if (u.x + u.w > CANVAS_WIDTH) u.x = CANVAS_WIDTH - u.w

    // Hazard check
    this.level.hazards.forEach(h => {
      if (!this._overlaps(u, h)) return
      if (h.type === 'lava'  && u.type === UNICORN.RAINBOW) this._kill(u, 'Rainbow Unicorn fell into lava!')
      if (h.type === 'ice'   && u.type === UNICORN.CRYSTAL) this._kill(u, 'Crystal Unicorn fell into ice!')
    })

    // Fall off screen
    if (u.y > CANVAS_HEIGHT + 40) this._kill(u, `${u.type === UNICORN.RAINBOW ? 'Rainbow' : 'Crystal'} Unicorn fell off!`)
  }

  _kill(u, reason) {
    if (!u.alive) return
    u.alive = false
    this._burst(u.x + u.w / 2, u.y + u.h / 2, u.type === UNICORN.RAINBOW ? '#ff6b9d' : '#00e5ff', 20)
    this.result = 'dead'
    this.deadReason = reason
  }

  _resolveX(u) {
    const allPlatforms = [...this.level.platforms, ...this.movingPlatforms]
    allPlatforms.forEach(p => {
      if (!this._overlaps(u, p)) return
      if (u.vx > 0) u.x = p.x - u.w
      else if (u.vx < 0) u.x = p.x + p.w
      u.vx = 0
    })
    // Gates
    this.gates.forEach(g => {
      if (g.open || !this._overlaps(u, g)) return
      if (u.vx > 0) u.x = g.x - u.w
      else if (u.vx < 0) u.x = g.x + g.w
      u.vx = 0
    })
  }

  _resolveY(u) {
    const allPlatforms = [...this.level.platforms, ...this.movingPlatforms]
    allPlatforms.forEach(p => {
      if (!this._overlaps(u, p)) return
      if (u.vy > 0) {
        u.y = p.y - u.h
        u.onGround = true
      } else if (u.vy < 0) {
        u.y = p.y + p.h
      }
      u.vy = 0
    })
  }

  _unicornOnSwitch(u, sw) {
    return u.x < sw.x + sw.w && u.x + u.w > sw.x &&
           u.y + u.h >= sw.y && u.y + u.h <= sw.y + sw.h + 4
  }

  _overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y
  }

  _circleRect(cx, cy, r, rect) {
    const nearX = Math.max(rect.x, Math.min(cx, rect.x + rect.w))
    const nearY = Math.max(rect.y, Math.min(cy, rect.y + rect.h))
    return (cx - nearX) ** 2 + (cy - nearY) ** 2 <= r * r
  }

  _burst(x, y, color, n = 12) {
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        color, life: 30 + Math.random() * 20,
        size: 3 + Math.random() * 3,
      })
    }
  }

  // ─── DRAW ───────────────────────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    this._drawBackground(ctx)
    this._drawHazards(ctx)
    this._drawPlatforms(ctx)
    this._drawGates(ctx)
    this._drawSwitches(ctx)
    this._drawGems(ctx)
    this._drawPortals(ctx)
    this._drawUnicorn(ctx, this.rainbow)
    this._drawUnicorn(ctx, this.crystal)
    this._drawParticles(ctx)
  }

  _drawBackground(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    grad.addColorStop(0, '#0a0618')
    grad.addColorStop(1, '#1a0f3c')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 137.5 + this.tick * 0.1) % CANVAS_WIDTH)
      const sy = ((i * 83.7) % (CANVAS_HEIGHT * 0.7))
      const ss = 0.5 + (i % 3) * 0.5
      ctx.beginPath()
      ctx.arc(sx, sy, ss, 0, Math.PI * 2)
      ctx.fill()
    }

    // Crystal formations background
    ctx.strokeStyle = 'rgba(124,58,237,0.15)'
    ctx.lineWidth = 2
    for (let i = 0; i < 6; i++) {
      const bx = i * 220 + 60
      const by = CANVAS_HEIGHT - 50
      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.lineTo(bx - 20, by - 80 - i * 15)
      ctx.lineTo(bx + 20, by - 60 - i * 10)
      ctx.closePath()
      ctx.stroke()
    }
  }

  _drawPlatforms(ctx) {
    const allPlatforms = [...this.level.platforms, ...this.movingPlatforms]
    allPlatforms.forEach(p => {
      // glow
      ctx.shadowColor = COLORS.platformGlow
      ctx.shadowBlur = 10
      ctx.fillStyle = COLORS.platform
      this._roundRect(ctx, p.x, p.y, p.w, p.h, 4)
      ctx.fill()

      // top edge glow
      ctx.shadowBlur = 0
      ctx.strokeStyle = COLORS.platformGlow
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(p.x + 4, p.y + 2)
      ctx.lineTo(p.x + p.w - 4, p.y + 2)
      ctx.stroke()
    })
    ctx.shadowBlur = 0
  }

  _drawHazards(ctx) {
    this.level.hazards.forEach(h => {
      const isLava = h.type === 'lava'
      const t = this.tick * 0.05
      const grad = ctx.createLinearGradient(h.x, h.y, h.x, h.y + h.h)
      if (isLava) {
        grad.addColorStop(0, `rgba(255,${80 + Math.sin(t) * 40},0,1)`)
        grad.addColorStop(1, 'rgba(180,20,0,1)')
        ctx.shadowColor = '#ff4500'
      } else {
        grad.addColorStop(0, `rgba(0,${180 + Math.sin(t) * 40},255,0.9)`)
        grad.addColorStop(1, 'rgba(0,80,200,1)')
        ctx.shadowColor = '#00bfff'
      }
      ctx.shadowBlur = 12
      ctx.fillStyle = grad
      ctx.fillRect(h.x, h.y, h.w, h.h)

      // Waves
      ctx.shadowBlur = 0
      ctx.strokeStyle = isLava ? 'rgba(255,200,0,0.5)' : 'rgba(200,240,255,0.5)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let wx = h.x; wx < h.x + h.w; wx += 4) {
        const wy = h.y + 4 + Math.sin((wx + this.tick * 2) * 0.2) * 3
        wx === h.x ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy)
      }
      ctx.stroke()
    })
    ctx.shadowBlur = 0
  }

  _drawGates(ctx) {
    this.gates.forEach(g => {
      if (g.open) return
      ctx.fillStyle = COLORS.gate
      ctx.shadowColor = COLORS.gate
      ctx.shadowBlur = 8
      ctx.fillRect(g.x, g.y, g.w, g.h)
      ctx.shadowBlur = 0
    })
  }

  _drawSwitches(ctx) {
    this.switches.forEach(sw => {
      ctx.fillStyle = sw.active ? '#00ff88' : COLORS.switch
      ctx.shadowColor = sw.active ? '#00ff88' : COLORS.switch
      ctx.shadowBlur = sw.active ? 16 : 6
      this._roundRect(ctx, sw.x, sw.y, sw.w, sw.h, 4)
      ctx.fill()
      ctx.shadowBlur = 0
    })
  }

  _drawGems(ctx) {
    this.gems.forEach(g => {
      if (g.collected) return
      const t = this.tick * 0.05
      const bob = Math.sin(t + g.id) * 3
      const r = 10

      ctx.shadowColor = COLORS.gem
      ctx.shadowBlur = 14 + Math.sin(t) * 4
      ctx.fillStyle = COLORS.gem
      ctx.beginPath()
      // Diamond shape
      ctx.moveTo(g.x + r,     g.y + bob)
      ctx.lineTo(g.x + r * 2, g.y + r + bob)
      ctx.lineTo(g.x + r,     g.y + r * 2 + bob)
      ctx.lineTo(g.x,         g.y + r + bob)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.beginPath()
      ctx.moveTo(g.x + r,         g.y + bob)
      ctx.lineTo(g.x + r * 1.5,   g.y + r * 0.7 + bob)
      ctx.lineTo(g.x + r,         g.y + r + bob)
      ctx.lineTo(g.x + r * 0.5,   g.y + r * 0.7 + bob)
      ctx.closePath()
      ctx.fill()

      ctx.shadowBlur = 0
    })
  }

  _drawPortals(ctx) {
    const t = this.tick * 0.05
    const rp = this.level.portalRainbow
    const cp = this.level.portalCrystal

    // Rainbow portal
    const rColors = ['#ff6b9d', '#ffcc00', '#00e5ff', '#c44dff', '#ff6b9d']
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = rColors[i]
      ctx.lineWidth = 3
      ctx.shadowColor = rColors[i]
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.ellipse(rp.x + rp.w / 2, rp.y + rp.h / 2,
        (rp.w / 2) - i * 2 + Math.sin(t + i) * 3,
        (rp.h / 2) - i + Math.cos(t + i) * 2,
        t * 0.5, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Crystal portal
    ctx.strokeStyle = '#00e5ff'
    ctx.shadowColor = '#00e5ff'
    ctx.shadowBlur = 16 + Math.sin(t) * 6
    ctx.lineWidth = 3
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = 1 - i * 0.2
      ctx.beginPath()
      ctx.ellipse(cp.x + cp.w / 2, cp.y + cp.h / 2,
        (cp.w / 2) + i * 3 + Math.sin(t + i * 0.5) * 3,
        (cp.h / 2) + i * 2 + Math.cos(t + i * 0.5) * 2,
        -t * 0.3, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0

    // Labels
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ff6b9d'
    ctx.fillText('P1', rp.x + rp.w / 2, rp.y - 6)
    ctx.fillStyle = '#00e5ff'
    ctx.fillText('P2', cp.x + cp.w / 2, cp.y - 6)
    ctx.textAlign = 'left'
  }

  _drawUnicorn(ctx, u) {
    if (!u.alive) return
    ctx.save()
    ctx.translate(u.x + u.w / 2, u.y + u.h / 2)
    if (u.facing < 0) ctx.scale(-1, 1)

    const t = this.tick * 0.1
    const bob = Math.sin(t + (u.type === UNICORN.RAINBOW ? 0 : Math.PI)) * 2

    ctx.translate(0, bob)

    const isRainbow = u.type === UNICORN.RAINBOW
    const bodyColor = isRainbow ? '#ff9dc8' : '#80f0ff'
    const shadowC   = isRainbow ? '#ff6b9d' : '#00bfff'

    // Shadow glow
    ctx.shadowColor = shadowC
    ctx.shadowBlur = 12

    // Body
    ctx.fillStyle = bodyColor
    this._roundRect(ctx, -14, -16, 28, 22, 8)
    ctx.fill()

    // Head
    ctx.fillStyle = bodyColor
    this._roundRect(ctx, 6, -24, 18, 16, 6)
    ctx.fill()

    // Horn
    ctx.strokeStyle = isRainbow ? '#ffd700' : '#c0f0ff'
    ctx.lineWidth = 3
    ctx.shadowColor = isRainbow ? '#ffd700' : '#c0f0ff'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(14, -24)
    ctx.lineTo(18, -38)
    ctx.stroke()

    // Eye
    ctx.shadowBlur = 0
    ctx.fillStyle = '#0a0618'
    ctx.beginPath()
    ctx.arc(20, -18, 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(21, -19, 1, 0, Math.PI * 2)
    ctx.fill()

    // Mane
    const maneColors = isRainbow
      ? ['#ff6b9d', '#ffcc00', '#00e5ff']
      : ['#00e5ff', '#4d79ff', '#c44dff']
    maneColors.forEach((c, i) => {
      ctx.fillStyle = c
      ctx.shadowColor = c
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.arc(-8 - i * 5, -20 + Math.sin(t + i) * 3, 5 - i, 0, Math.PI * 2)
      ctx.fill()
    })

    // Tail
    const tailColors = isRainbow
      ? ['#ff6b9d', '#ffcc00', '#c44dff']
      : ['#c44dff', '#4d79ff', '#00e5ff']
    tailColors.forEach((c, i) => {
      ctx.fillStyle = c
      ctx.shadowColor = c
      ctx.shadowBlur = 4
      ctx.beginPath()
      ctx.arc(-16 - i * 3, -4 + Math.sin(t * 1.5 + i) * 4, 5 - i, 0, Math.PI * 2)
      ctx.fill()
    })

    // Legs (animated)
    ctx.shadowBlur = 0
    ctx.fillStyle = bodyColor
    const legAnim = u.onGround ? Math.sin(t * 2) * 5 : 0
    ctx.fillRect(-10, 6,  6, 10 + (legAnim > 0 ? legAnim : 0))
    ctx.fillRect(2,   6,  6, 10 - (legAnim > 0 ? legAnim : 0))
    ctx.fillRect(-10, 6,  6, 10 - (legAnim < 0 ? -legAnim : 0))
    ctx.fillRect(2,   6,  6, 10 + (legAnim < 0 ? -legAnim : 0))

    ctx.restore()
  }

  _drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life / 50
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 4
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }
}
