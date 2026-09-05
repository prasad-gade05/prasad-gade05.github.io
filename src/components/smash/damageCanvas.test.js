import { describe, expect, it, vi } from 'vitest'
import {
  buildCrackLines,
  buildImpactPolygon,
  buildRectPolygon,
  damageStage,
  paintDamageStage,
  paintImpact,
  paintRectHole,
  paneToCanvas,
  radiusToCanvas,
} from './damageCanvas'

const makeCtx = () => ({
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  globalCompositeOperation: 'source-over',
  globalAlpha: 1,
  strokeStyle: '',
  lineWidth: 1,
  lineCap: '',
})

describe('buildImpactPolygon', () => {
  it('produces a jagged ring around the impact center', () => {
    const verts = buildImpactPolygon(100, 80, 40)

    expect(verts.length).toBeGreaterThanOrEqual(5)
    for (const v of verts) {
      const dist = Math.hypot(v.x - 100, v.y - 80)
      expect(dist).toBeGreaterThanOrEqual(40 * 0.55 - 1e-6)
      expect(dist).toBeLessThanOrEqual(40 * 1.25 + 1e-6)
    }
  })
})

describe('buildCrackLines', () => {
  it('builds long radials plus rings for glass', () => {
    const { radials, rings } = buildCrackLines(0, 0, 30, 'glass')

    expect(radials).toHaveLength(9)
    expect(rings).toHaveLength(2)
    for (const line of radials) {
      expect(line.length).toBeGreaterThanOrEqual(3)
      const tip = line[line.length - 1]
      // Length >= 2.2r along the spoke minus <= 0.45r√2 jitter drift
      expect(Math.hypot(tip.x, tip.y)).toBeGreaterThan(30 * 1.5)
    }
  })

  it('builds short radials plus splinter strokes for wood', () => {
    const { radials, rings } = buildCrackLines(0, 0, 30, 'wood')

    expect(radials).toHaveLength(5)
    expect(rings).toHaveLength(6)
    for (const stroke of rings) {
      expect(stroke).toHaveLength(2)
    }
  })
})

describe('rect holes', () => {
  it('traces a jittered perimeter around the rectangle', () => {
    const pts = buildRectPolygon(10, 20, 100, 60)

    expect(pts.length).toBeGreaterThanOrEqual(8)
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(10 - 100 * 0.05)
      expect(p.x).toBeLessThanOrEqual(110 + 100 * 0.05)
      expect(p.y).toBeGreaterThanOrEqual(20 - 60 * 0.08)
      expect(p.y).toBeLessThanOrEqual(80 + 60 * 0.08)
    }
  })

  it('knocks out a card-shaped hole and ignores invalid input', () => {
    const ctx = makeCtx()
    paintRectHole(ctx, 10, 20, 100, 60)
    expect(ctx.fill).toHaveBeenCalledTimes(1)

    const bad = makeCtx()
    paintRectHole(null, 0, 0, 10, 10)
    paintRectHole(bad, 0, 0, 0, 10)
    expect(bad.fill).not.toHaveBeenCalled()
  })
})

describe('paintImpact', () => {  it('knocks out a hole then strokes cracks', () => {
    const ctx = makeCtx()
    paintImpact(ctx, 100, 80, 40, 'glass')

    expect(ctx.fill).toHaveBeenCalledTimes(1)
    // 9 radials + 2 rings
    expect(ctx.stroke.mock.calls.length).toBe(11)
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
  })

  it('ignores invalid input without touching the context', () => {
    const ctx = makeCtx()
    paintImpact(null, 0, 0, 10)
    paintImpact(ctx, 0, 0, 0)
    expect(ctx.fill).not.toHaveBeenCalled()
    expect(ctx.stroke).not.toHaveBeenCalled()
  })
})

describe('damageStage', () => {
  it('maps HP fractions to pristine / cracked / critical', () => {
    expect(damageStage(100, 100)).toBe(0)
    expect(damageStage(67, 100)).toBe(0)
    expect(damageStage(66, 100)).toBe(1)
    expect(damageStage(34, 100)).toBe(1)
    expect(damageStage(33, 100)).toBe(2)
    expect(damageStage(1, 100)).toBe(2)
    expect(damageStage(0, 100)).toBe(2)
  })

  it('treats invalid max HP as pristine', () => {
    expect(damageStage(10, 0)).toBe(0)
    expect(damageStage(10, -5)).toBe(0)
    expect(damageStage(10, null)).toBe(0)
  })
})

describe('paintDamageStage', () => {
  it('cracks lightly at stage 1 and heavily at stage 2', () => {
    const mild = makeCtx()
    paintDamageStage(mild, 200, 150, 1)
    // 2 seeds x 9 glass radials
    expect(mild.stroke.mock.calls.length).toBe(18)

    const severe = makeCtx()
    paintDamageStage(severe, 200, 150, 2)
    // 4 seeds x 9 glass radials
    expect(severe.stroke.mock.calls.length).toBe(36)
    expect(severe.save).toHaveBeenCalled()
    expect(severe.restore).toHaveBeenCalled()
  })

  it('ignores pristine stages and invalid input without touching the context', () => {
    const ctx = makeCtx()
    paintDamageStage(ctx, 200, 150, 0)
    paintDamageStage(null, 200, 150, 1)
    paintDamageStage(ctx, 0, 150, 1)
    paintDamageStage(ctx, 200, 150, -1)
    expect(ctx.stroke).not.toHaveBeenCalled()
  })
})

describe('coordinate helpers', () => {
  it('maps pane center to canvas center and flips y', () => {
    expect(paneToCanvas(0, 0, 10, 8, 1000, 800)).toEqual({ px: 500, py: 400 })
    const top = paneToCanvas(0, 4, 10, 8, 1000, 800)
    expect(top.py).toBe(0)
    const right = paneToCanvas(5, 0, 10, 8, 1000, 800)
    expect(right.px).toBe(1000)
  })

  it('scales radii uniformly', () => {
    expect(radiusToCanvas(1, 10, 1000)).toBe(100)
  })
})
