/**
 * Shard physics for the Smash Room (wrecking-ball) overlay.
 * Pure functions only — no THREE dependency so they stay unit-testable.
 *
 * A shard is a single fractured triangle defined in pane-local coordinates:
 * {
 *   id, ax, ay, bx, by, cx, cy,   // triangle corners (pane units, z = 0 plane)
 *   u1, v1, u2, v2, u3, v3,        // texture coords into the pristine screenshot
 *   px, py, pz,                    // current centroid position
 *   vx, vy, vz,                    // velocity
 *   rx, ry, rz,                    // rotation (radians)
 *   wx, wy, wz,                    // angular velocity
 *   life, maxLife, size,
 * }
 */

let nextShardId = 0

export const resetShardIds = () => {
  nextShardId = 0
}

const rand = (min, max) => min + Math.random() * (max - min)

const toUV = (x, y, paneW, paneH) => [(x + paneW / 2) / paneW, (y + paneH / 2) / paneH]

const makeShard = (ax, ay, bx, by, cx, cy, paneW, paneH, vx, vy, vz) => {
  const [u1, v1] = toUV(ax, ay, paneW, paneH)
  const [u2, v2] = toUV(bx, by, paneW, paneH)
  const [u3, v3] = toUV(cx, cy, paneW, paneH)
  const size = Math.max(
    Math.hypot(ax - bx, ay - by),
    Math.hypot(bx - cx, by - cy),
    Math.hypot(cx - ax, cy - ay),
  )
  return {
    id: nextShardId++,
    ax, ay, bx, by, cx, cy,
    u1, v1, u2, v2, u3, v3,
    px: (ax + bx + cx) / 3,
    py: (ay + by + cy) / 3,
    pz: rand(0.02, 0.12),
    vx, vy, vz,
    rx: 0, ry: 0, rz: rand(0, Math.PI * 2),
    wx: rand(-6, 6), wy: rand(-6, 6), wz: rand(-9, 9),
    life: 0,
    maxLife: rand(1.6, 2.4),
    size,
  }
}

/**
 * Build a fan of sharp glass triangles radiating from the impact point.
 */
const glassShards = ({ x, y, count, power, paneW, paneH }) => {
  const shards = []
  let angle = rand(0, Math.PI * 2)
  for (let i = 0; i < count; i++) {
    const sweep = (Math.PI * 2) / count
    const a1 = angle + rand(-0.15, 0.15)
    const a2 = angle + sweep + rand(-0.15, 0.15)
    angle = a2
    const inner = rand(0.03, 0.12) * power
    const outer = rand(0.45, 1.15) * power
    const ax = x + Math.cos(a1) * inner
    const ay = y + Math.sin(a1) * inner
    const bx = x + Math.cos(a1) * outer
    const by = y + Math.sin(a1) * outer
    const cx = x + Math.cos(a2) * outer * rand(0.75, 1)
    const cy = y + Math.sin(a2) * outer * rand(0.75, 1)
    const dirx = Math.cos((a1 + a2) / 2)
    const diry = Math.sin((a1 + a2) / 2)
    const speed = rand(2.2, 5.2) * power
    shards.push(
      makeShard(ax, ay, bx, by, cx, cy, paneW, paneH,
        dirx * speed + rand(-0.6, 0.6),
        diry * speed + rand(0.4, 1.6),
        rand(1.5, 4.5)),
    )
  }
  return shards
}

/**
 * Build elongated wood splinters stretched along random grain directions.
 */
const woodShards = ({ x, y, count, power, paneW, paneH }) => {
  const shards = []
  for (let i = 0; i < count; i++) {
    const dir = rand(0, Math.PI * 2)
    const dx = Math.cos(dir)
    const dy = Math.sin(dir)
    const px = -dy
    const py = dx
    const len = rand(0.5, 1.6) * power
    const wid = rand(0.05, 0.16)
    const ox = x + rand(-0.25, 0.25)
    const oy = y + rand(-0.25, 0.25)
    // Sliver triangle: wide base at one end, sharp tip at the other.
    // Base edge is exactly `wid` and the tip sits a full `len` away on
    // the axis, so longest/shortest >= len/wid >= 0.5/0.16 > 3 by construction.
    const half = Math.random() < 0.5 ? 1 : -1
    const ax = ox - dx * len * 0.5 * half + px * wid * 0.5
    const ay = oy - dy * len * 0.5 * half + py * wid * 0.5
    const bx = ox - dx * len * 0.5 * half - px * wid * 0.5
    const by = oy - dy * len * 0.5 * half - py * wid * 0.5
    const cx = ox + dx * len * 0.5 * half
    const cy = oy + dy * len * 0.5 * half
    const speed = rand(1.6, 4) * power
    shards.push(
      makeShard(ax, ay, bx, by, cx, cy, paneW, paneH,
        dx * speed * 0.7 + rand(-0.5, 0.5),
        dy * speed * 0.7 + rand(0.2, 1.2),
        rand(1, 3.2)),
    )
  }
  return shards
}

/**
 * Create fractured shards bursting from a pane-local impact point.
 */
export const createShards = ({ x, y, count = 18, material = 'glass', power = 1, paneW = 10, paneH = 10 }) => {
  const safeCount = Math.max(1, Math.round(count))
  const safePower = Math.min(2.2, Math.max(0.4, power))
  const args = { x, y, count: safeCount, power: safePower, paneW, paneH }
  return material === 'wood' ? woodShards(args) : glassShards(args)
}

/**
 * Advance shards one step. Mutates positions/rotations/life in place,
 * returns a new array containing only the shards still alive.
 */
export const stepShards = (shards, dt, { gravity = 9.5, drag = 0.12, floorY = null } = {}) => {
  const clampedDt = Math.min(0.05, Math.max(0, dt))
  const alive = []
  for (const s of shards) {
    s.vy -= gravity * clampedDt
    const dragK = 1 - drag * clampedDt
    s.vx *= dragK
    s.vy *= dragK
    s.vz *= dragK
    s.px += s.vx * clampedDt
    s.py += s.vy * clampedDt
    s.pz += s.vz * clampedDt
    if (s.pz < 0) {
      s.pz = 0
      s.vz *= -0.3
    }
    if (floorY != null && s.py < floorY) {
      s.py = floorY
      s.vy *= -0.35
      s.vx *= 0.7
      s.wx *= 0.6
      s.wz *= 0.6
    }
    s.rx += s.wx * clampedDt
    s.ry += s.wy * clampedDt
    s.rz += s.wz * clampedDt
    s.life += clampedDt
    if (s.life < s.maxLife) alive.push(s)
  }
  return alive
}

/**
 * Fade factor 1 → 0 over the last 35% of a shard's life.
 */
export const shardOpacity = (shard) => {  const remaining = shard.maxLife - shard.life
  const fadeWindow = shard.maxLife * 0.35
  if (remaining >= fadeWindow) return 1
  return Math.max(0, remaining / fadeWindow)
}

/**
 * Integrity loss (percentage points) for one impact of the given radius.
 * Scales with hole area relative to the pane, clamped so a single hit
 * can neither tickle nor nuke the whole panel.
 */
export const integrityLossForRadius = (radius, paneW, paneH) => {
  if (!(radius > 0) || !(paneW > 0) || !(paneH > 0)) return 0
  const holeArea = Math.PI * radius * radius * 0.7
  const raw = (holeArea / (paneW * paneH)) * 100 * 1.15
  return Math.min(7, Math.max(1.5, raw))
}

/**
 * Map ball impact speed to fracture power + texture hole radius.
 */
export const impactFromSpeed = (speed) => {
  const clamped = Math.min(22, Math.max(3, speed))
  const t = (clamped - 3) / (22 - 3)
  return {
    power: 0.7 + t * 0.9,
    radius: 0.45 + t * 0.75,
  }
}

/**
 * Max HP scales with target size — small buttons pop fast, big panels
 * take a beating. Clamped so nothing is indestructible or one-shot.
 */
export const targetMaxHp = (target) => {
  if (!target || !(target.w > 0) || !(target.h > 0)) return 60
  return Math.min(110, Math.max(30, Math.round(target.w * target.h * 12)))
}

/** Fixed camera depth used by the smash room (matches the R3F camera). */
export const CAMERA_Z = 10

/**
 * The sight ray through a clicked 3D point: origin at the camera,
 * direction normalized. Projectiles lock this at fire time so muzzle
 * offset, gravity, and timestep error can never push them off-pixel.
 */
export const rayFromPoint = (point) => {
  const dx = point.x
  const dy = point.y
  const dz = point.z - CAMERA_Z
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
  return { ox: 0, oy: 0, oz: CAMERA_Z, dx: dx / len, dy: dy / len, dz: dz / len }
}

/** Perpendicular distance from a projectile to its locked sight ray. */
export const distanceToRay = (p) => {  const rx = p.x - p.ox
  const ry = p.y - p.oy
  const rz = p.z - p.oz
  const t = rx * p.dx + ry * p.dy + rz * p.dz
  const cx = p.ox + p.dx * t
  const cy = p.oy + p.dy * t
  const cz = p.oz + p.dz * t
  return Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2 + (p.z - cz) ** 2)
}

/**
 * Steer a projectile's velocity toward its locked sight ray (beam riding).
 * Preserves speed, only bends direction. Gain is adaptive: strong when
 * far off-ray (converges within short flights), gentle when close (no
 * zigzag). Balls use gentle base gain (keeps the arc entry, snap the
 * terminal phase), bullets snap hard the whole way.
 */
export const steerToRay = (p, strength, dt) => {
  if (!p || !(strength > 0) || !(dt > 0)) return
  const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz)
  if (!(speed > 0)) return
  const err = distanceToRay(p)
  const rx = p.x - p.ox
  const ry = p.y - p.oy
  const rz = p.z - p.oz
  const t = Math.max(0, rx * p.dx + ry * p.dy + rz * p.dz) + 0.5
  const tx = p.ox + p.dx * t
  const ty = p.oy + p.dy * t
  const tz = p.oz + p.dz * t
  const dvx = tx - p.x
  const dvy = ty - p.y
  const dvz = tz - p.z
  const dl = Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz) || 1
  const k = Math.min(1, (strength + 8 * err) * dt)
  p.vx += ((dvx / dl) * speed - p.vx) * k
  p.vy += ((dvy / dl) * speed - p.vy) * k
  p.vz += ((dvz / dl) * speed - p.vz) * k
}

/**
 * Solve a launch velocity that lands exactly on target under gravity
 * (low-arc solution). Matches the scene's semi-implicit Euler integration
 * closely enough that hits land within a few cm. Returns null when the
 * target is out of range at this speed — fire faster or flatter instead.
 */
export const solveBallisticVelocity = (from, to, speed, gravity) => {
  if (!from || !to || !(speed > 0) || !(gravity > 0)) return null
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dz = to.z - from.z
  const h = Math.sqrt(dx * dx + dz * dz)
  if (h < 1e-6) return null
  const s2 = speed * speed
  const disc = s2 * s2 - gravity * (gravity * h * h + 2 * dy * s2)
  if (!(disc >= 0)) return null
  const tan = (s2 - Math.sqrt(disc)) / (gravity * h)
  const cos = 1 / Math.sqrt(1 + tan * tan)
  const sin = tan * cos
  return {
    x: (dx / h) * speed * cos,
    y: speed * sin,
    z: (dz / h) * speed * cos,
  }
}

/**
 * Shift a shard set by (dx, dy). Used to author fractures in target-local
 * coordinates, then move them into world space for rendering.
 */
export const translateShards = (shards, dx, dy) => {
  for (const s of shards) {
    s.ax += dx; s.bx += dx; s.cx += dx
    s.ay += dy; s.by += dy; s.cy += dy
    s.px += dx; s.py += dy
  }
  return shards
}

/**
 * Small untextured chips + dust for impact crunch. Rendered as one
 * THREE.Points cloud; plain objects so they stay unit-testable.
 */
export const createDebris = ({ x, y, z = 0.3, count = 26, power = 1 }) => {
  const parts = []
  const n = Math.max(1, Math.round(count))
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const speed = (1.5 + Math.random() * 4.5) * power
    parts.push({
      x: x + (Math.random() - 0.5) * 0.2,
      y: y + (Math.random() - 0.5) * 0.2,
      z: z + Math.random() * 0.2,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed * 0.8 + 1.2,
      vz: (1 + Math.random() * 3) * power,
      life: 0,
      maxLife: 0.5 + Math.random() * 0.7,
    })
  }
  return parts
}

/**
 * Advance debris one step; returns only the survivors.
 */
export const stepDebris = (parts, dt, { gravity = 9.5, floorY = null } = {}) => {
  const clampedDt = Math.min(0.05, Math.max(0, dt))
  const alive = []
  for (const p of parts) {
    p.vy -= gravity * clampedDt
    p.x += p.vx * clampedDt
    p.y += p.vy * clampedDt
    p.z += p.vz * clampedDt
    if (p.z < 0) {
      p.z = 0
      p.vz *= -0.3
    }
    if (floorY != null && p.y < floorY) {
      p.y = floorY
      p.vy *= -0.4
      p.vx *= 0.7
    }
    p.life += clampedDt
    if (p.life < p.maxLife) alive.push(p)
  }
  return alive
}
