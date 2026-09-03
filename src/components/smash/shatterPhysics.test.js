import { describe, expect, it, beforeEach } from 'vitest'
import {
  createDebris,
  createShards,
  distanceToRay,
  impactFromSpeed,
  integrityLossForRadius,
  rayFromPoint,
  resetShardIds,
  shardOpacity,
  solveBallisticVelocity,
  stepDebris,
  stepShards,
  steerToRay,
  targetMaxHp,
  translateShards,
} from './shatterPhysics'

beforeEach(() => {
  resetShardIds()
})

describe('createShards', () => {
  it('returns the requested number of finite glass triangles with mapped UVs', () => {
    const shards = createShards({ x: 0, y: 0, count: 18, material: 'glass', paneW: 10, paneH: 8 })

    expect(shards).toHaveLength(18)
    for (const s of shards) {
      for (const v of [s.ax, s.ay, s.bx, s.by, s.cx, s.cy, s.vx, s.vy, s.vz]) {
        expect(Number.isFinite(v)).toBe(true)
      }
      for (const uv of [s.u1, s.v1, s.u2, s.v2, s.u3, s.v3]) {
        expect(uv).toBeGreaterThanOrEqual(0)
        expect(uv).toBeLessThanOrEqual(1)
      }
      expect(s.vz).toBeGreaterThan(0) // pops toward the camera
      expect(s.maxLife).toBeGreaterThan(s.life)
    }
    expect(new Set(shards.map((s) => s.id)).size).toBe(18)
  })

  it('builds elongated splinters for wood', () => {
    const shards = createShards({ x: 1, y: -1, count: 12, material: 'wood', paneW: 10, paneH: 8 })

    expect(shards).toHaveLength(12)
    for (const s of shards) {
      const edges = [
        Math.hypot(s.ax - s.bx, s.ay - s.by),
        Math.hypot(s.bx - s.cx, s.by - s.cy),
        Math.hypot(s.cx - s.ax, s.cy - s.ay),
      ]
      const longest = Math.max(...edges)
      const shortest = Math.min(...edges)
      expect(longest / Math.max(shortest, 1e-6)).toBeGreaterThan(2.5)
    }
  })

  it('clamps degenerate input to at least one shard', () => {
    expect(createShards({ x: 0, y: 0, count: 0, paneW: 10, paneH: 8 })).toHaveLength(1)
  })
})

describe('stepShards', () => {
  it('applies gravity, integrates motion, and retires dead shards', () => {
    let shards = createShards({ x: 0, y: 2, count: 4, paneW: 10, paneH: 8 })
    const vyBefore = shards.map((s) => s.vy)

    shards = stepShards(shards, 0.016)
    shards.forEach((s, i) => {
      expect(s.vy).toBeLessThan(vyBefore[i])
      expect(s.life).toBeCloseTo(0.016, 5)
    })

    // Fast-forward past every maxLife — nothing survives
    for (let i = 0; i < 200 && shards.length > 0; i++) {
      shards = stepShards(shards, 0.05)
    }
    expect(shards).toHaveLength(0)
  })

  it('bounces off the floor instead of sinking', () => {
    const shards = createShards({ x: 0, y: 0, count: 2, paneW: 10, paneH: 8 })
    for (const s of shards) {
      s.py = -4.9
      s.vy = -5
    }
    const alive = stepShards(shards, 0.05, { floorY: -5 })
    for (const s of alive) {
      expect(s.py).toBeGreaterThanOrEqual(-5)
      expect(s.vy).toBeGreaterThan(0)
    }
  })
})

describe('shardOpacity', () => {
  it('stays opaque then fades to zero at end of life', () => {
    const [s] = createShards({ x: 0, y: 0, count: 1, paneW: 10, paneH: 8 })
    expect(shardOpacity(s)).toBe(1)
    s.life = s.maxLife * 0.9
    expect(shardOpacity(s)).toBeGreaterThan(0)
    expect(shardOpacity(s)).toBeLessThan(1)
    s.life = s.maxLife
    expect(shardOpacity(s)).toBe(0)
  })
})

describe('integrityLossForRadius', () => {
  it('scales with hole size and stays within sane bounds', () => {
    const small = integrityLossForRadius(0.3, 12, 8)
    const big = integrityLossForRadius(1.2, 12, 8)
    expect(small).toBeGreaterThanOrEqual(1.5)
    expect(big).toBeLessThanOrEqual(7)
    expect(big).toBeGreaterThan(small)
  })

  it('rejects invalid input', () => {
    expect(integrityLossForRadius(0, 12, 8)).toBe(0)
    expect(integrityLossForRadius(-1, 12, 8)).toBe(0)
  })
})

describe('impactFromSpeed', () => {
  it('maps faster balls to bigger fractures', () => {
    const slow = impactFromSpeed(4)
    const fast = impactFromSpeed(20)
    expect(fast.power).toBeGreaterThan(slow.power)
    expect(fast.radius).toBeGreaterThan(slow.radius)
  })
})

describe('targetMaxHp', () => {
  it('scales with area within sane bounds', () => {
    const big = targetMaxHp({ w: 4.8, h: 2.6 })
    const small = targetMaxHp({ w: 1.25, h: 1.0 })
    expect(big).toBe(110)
    expect(small).toBeLessThan(big)
    expect(small).toBeGreaterThanOrEqual(30)
  })

  it('rejects invalid input', () => {
    expect(targetMaxHp(null)).toBe(60)
    expect(targetMaxHp({ w: 0, h: 1 })).toBe(60)
  })
})

describe('solveBallisticVelocity', () => {
  it('lands on high and far targets under gravity', () => {
    const gravity = 6.5
    const cases = [
      { from: { x: 0, y: -3, z: 3 }, to: { x: 2, y: 3.5, z: 0 } }, // top of screen
      { from: { x: 0, y: -3, z: 3 }, to: { x: -5, y: 0, z: 0 } }, // far side
    ]
    for (const { from, to } of cases) {
      const vel = solveBallisticVelocity(from, to, 16, gravity)
      expect(vel).not.toBeNull()

      // Simulate the scene's integration and check the crossing point
      let x = from.x
      let y = from.y
      let z = from.z
      let vx = vel.x
      let vy = vel.y
      let vz = vel.z
      const dt = 1 / 60
      let hit = null
      for (let i = 0; i < 600; i++) {
        vy -= gravity * dt
        const pz = z
        x += vx * dt
        y += vy * dt
        z += vz * dt
        if (pz > to.z && z <= to.z) {
          const a = (pz - to.z) / (pz - z)
          hit = { x: x - vx * dt * (1 - a), y: y - vy * dt * (1 - a) }
          break
        }
      }
      expect(hit).not.toBeNull()
      expect(Math.abs(hit.x - to.x)).toBeLessThan(0.2)
      expect(Math.abs(hit.y - to.y)).toBeLessThan(0.2)
    }
  })

  it('returns null when out of range or given bad input', () => {
    expect(solveBallisticVelocity({ x: 0, y: 0, z: 3 }, { x: 50, y: 10, z: 0 }, 10, 6.5)).toBeNull()
    expect(solveBallisticVelocity(null, { x: 0, y: 0, z: 0 }, 10, 6.5)).toBeNull()
    expect(solveBallisticVelocity({ x: 0, y: 0, z: 3 }, { x: 0, y: 5, z: 3 }, 10, 6.5)).toBeNull()
  })
})

describe('steerToRay', () => {
  it('bends an off-axis projectile onto the cursor ray', () => {
    // Clicked top-of-screen point; projectile starts at the bottom mount
    // aimed roughly right but perturbed (muzzle offset, gravity, dt slop).
    const ray = rayFromPoint({ x: 2, y: 3.5, z: 0 })
    const p = {
      ...ray,
      x: 0, y: -3, z: 3.5,
      vx: 8.9 + 3, vy: 29, vz: -15.6,
    }
    expect(distanceToRay(p)).toBeGreaterThan(0.1)

    const dt = 1 / 60
    for (let i = 0; i < 90; i++) {
      steerToRay(p, 25, dt)
      const speed = Math.hypot(p.vx, p.vy, p.vz)
      p.x += (p.vx / speed) * 34 * dt
      p.y += (p.vy / speed) * 34 * dt
      p.z += (p.vz / speed) * 34 * dt
      if (p.z <= 0.2) break
    }
    // Rides the cursor ray into the hit plane — same pixel as the cursor.
    // (Measured against the ray itself: comparing against the z=0 cursor
    // point would conflate inter-plane parallax with tracking error.)
    expect(p.z).toBeLessThanOrEqual(0.2 + 34 * dt)
    expect(distanceToRay(p)).toBeLessThan(0.05)
  })

  it('ignores invalid input without crashing', () => {
    expect(() => steerToRay(null, 25, 0.016)).not.toThrow()
    const p = { ...rayFromPoint({ x: 0, y: 0, z: 0 }), x: 0, y: 0, z: 5, vx: 0, vy: 0, vz: 0 }
    expect(() => steerToRay(p, 25, 0.016)).not.toThrow()
    expect(() => steerToRay(p, 0, 0.016)).not.toThrow()
  })
})

describe('translateShards', () => {
  it('shifts every corner and centroid by the offset', () => {
    const shards = createShards({ x: 0, y: 0, count: 3, paneW: 4, paneH: 2 })
    const before = shards.map((s) => ({ ...s }))
    translateShards(shards, 5, -2)
    shards.forEach((s, i) => {
      expect(s.ax).toBeCloseTo(before[i].ax + 5, 6)
      expect(s.cy).toBeCloseTo(before[i].cy - 2, 6)
      expect(s.px).toBeCloseTo(before[i].px + 5, 6)
      expect(s.py).toBeCloseTo(before[i].py - 2, 6)
      // UVs stay put — they index the card texture, not world space
      expect(s.u1).toBe(before[i].u1)
    })
  })
})

describe('debris', () => {
  it('bursts outward with upward bias and retires the dead', () => {
    let parts = createDebris({ x: 1, y: 2, count: 10, power: 1 })
    expect(parts).toHaveLength(10)
    const vyBefore = parts.map((p) => p.vy)

    parts = stepDebris(parts, 0.016)
    parts.forEach((p, i) => {
      expect(p.vy).toBeLessThan(vyBefore[i])
      expect(p.life).toBeCloseTo(0.016, 5)
    })

    for (let i = 0; i < 100 && parts.length > 0; i++) {
      parts = stepDebris(parts, 0.05)
    }
    expect(parts).toHaveLength(0)
  })

  it('bounces off the floor instead of sinking', () => {
    const parts = createDebris({ x: 0, y: 0, count: 2 })
    for (const p of parts) {
      p.y = -4.9
      p.vy = -5
    }
    const alive = stepDebris(parts, 0.05, { floorY: -5 })
    for (const p of alive) {
      expect(p.y).toBeGreaterThanOrEqual(-5)
      expect(p.vy).toBeGreaterThan(0)
    }
  })
})
