/**
 * Damage-canvas helpers for the Smash Room.
 *
 * The site screenshot is drawn cover-fit into an offscreen 2D canvas.
 * Each ball impact punches a jagged hole (destination-out) plus visible
 * crack lines around it. Geometry builders are pure (testable without a
 * real canvas); paintImpact is a thin renderer over a 2D context.
 */

const TAU = Math.PI * 2

const rand = (min, max) => min + Math.random() * (max - min)

/**
 * Jagged polygon around (cx, cy) approximating a fracture hole.
 * Returns [{x, y}] with `points` vertices, radii within [0.55r, 1.25r].
 */
export const buildImpactPolygon = (cx, cy, radius, points = 11) => {
  const n = Math.max(5, Math.round(points))
  const verts = []
  const offset = rand(0, TAU)
  for (let i = 0; i < n; i++) {
    const a = offset + (i / n) * TAU
    const r = radius * rand(0.55, 1.25)
    verts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
  }
  return verts
}

/**
 * Crack polylines radiating from the impact.
 * Returns { radials: [[{x,y}...]], rings: [[{x,y}...]] }.
 * Glass gets long radials + concentric rings; wood gets short
 * radials + parallel splinter strokes.
 */
export const buildCrackLines = (cx, cy, radius, material = 'glass') => {
  const isWood = material === 'wood'
  const radialCount = isWood ? 5 : 9
  const radials = []
  const baseAngle = rand(0, TAU)
  for (let i = 0; i < radialCount; i++) {
    const a = baseAngle + (i / radialCount) * TAU + rand(-0.2, 0.2)
    const length = radius * (isWood ? rand(1.2, 2) : rand(2.2, 4.6))
    const segments = isWood ? 2 : 4
    const pts = [{ x: cx, y: cy }]
    let px = cx
    let py = cy
    for (let s = 1; s <= segments; s++) {
      const jitter = (s / segments) * radius * 0.45
      px = cx + Math.cos(a) * (length * (s / segments)) + rand(-jitter, jitter)
      py = cy + Math.sin(a) * (length * (s / segments)) + rand(-jitter, jitter)
      pts.push({ x: px, y: py })
    }
    radials.push(pts)
  }

  const rings = []
  if (!isWood) {
    for (const ringR of [radius * 1.5, radius * 2.4]) {
      const pts = []
      const steps = 26
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * TAU
        const r = ringR + rand(-ringR * 0.12, ringR * 0.12)
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
      }
      rings.push(pts)
    }
  } else {
    // Splinter strokes: short parallel gashes near the hole
    for (let i = 0; i < 6; i++) {
      const a = baseAngle + rand(0, TAU)
      const dist = rand(radius * 0.8, radius * 2)
      const sx = cx + Math.cos(a) * dist
      const sy = cy + Math.sin(a) * dist
      const len = rand(radius * 0.4, radius * 1.1)
      const perp = a + Math.PI / 2 + rand(-0.3, 0.3)
      rings.push([
        { x: sx, y: sy },
        { x: sx + Math.cos(perp) * len, y: sy + Math.sin(perp) * len },
      ])
    }
  }
  return { radials, rings }
}

const tracePath = (ctx, pts) => {
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
}

/**
 * Punch a fracture hole + cracks into a 2D context.
 * Coordinates are canvas pixels with origin at the top-left.
 * When `isLight` is true (dark backdrop/arena), cracks and the hole rim
 * are painted white so bullet holes stay visible on dark screenshots.
 */
export const paintImpact = (ctx, cx, cy, radius, material = 'glass', isLight = false) => {
  if (!ctx || !(radius > 0)) return

  // 1. Knock out the hole
  const hole = buildImpactPolygon(cx, cy, radius)
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  tracePath(ctx, hole)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // 2. Draw cracks on the surviving surface
  const { radials, rings } = buildCrackLines(cx, cy, radius, material)
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  if (isLight) {
    // White rim around the punched hole so the hole itself reads on dark
    tracePath(ctx, hole)
    ctx.closePath()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineWidth = Math.max(1.5, radius * 0.08)
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  } else {
    ctx.strokeStyle = material === 'wood' ? 'rgba(40, 22, 8, 0.85)' : 'rgba(20, 30, 40, 0.75)'
  }
  ctx.lineWidth = Math.max(1, radius * 0.06)
  ctx.lineCap = 'round'
  for (const line of radials) {
    tracePath(ctx, line)
    ctx.stroke()
  }
  ctx.lineWidth = Math.max(0.75, radius * 0.035)
  ctx.globalAlpha = material === 'wood' ? 0.9 : 0.6
  for (const ring of rings) {
    tracePath(ctx, ring)
    ctx.stroke()
  }
  ctx.restore()
}

/**
 * HP stage of a card: 0 = pristine (frac > 2/3), 1 = cracked
 * (1/3 < frac <= 2/3), 2 = critical (frac <= 1/3). Pure so the scene
 * can detect threshold crossings without repainting every hit.
 */
export const damageStage = (hp, maxHp) => {
  if (!(maxHp > 0)) return 0
  const frac = hp / maxHp
  if (frac <= 1 / 3) return 2
  if (frac <= 2 / 3) return 1
  return 0
}

/**
 * Paint HP-stage cracks across a whole card canvas — the "this thing is
 * about to go" read. Unlike impact holes these live on the CARD ONLY:
 * the card wobbles on its spring while the wall stays put, so wall-side
 * stage cracks would visibly ghost. Rebuild repaints pristine over them.
 * When `isLight` is true (dark backdrop/arena), cracks are white.
 */
export const paintDamageStage = (ctx, cw, ch, stage, material = 'glass', isLight = false) => {
  if (!ctx || !(cw > 0) || !(ch > 0) || !(stage >= 1)) return
  const seeds =
    stage >= 2
      ? [
          { x: cw * 0.2, y: ch * 0.25 },
          { x: cw * 0.8, y: ch * 0.3 },
          { x: cw * 0.3, y: ch * 0.75 },
          { x: cw * 0.75, y: ch * 0.8 },
        ]
      : [
          { x: cw * 0.25, y: ch * 0.3 },
          { x: cw * 0.75, y: ch * 0.7 },
        ]
  const baseR = Math.min(cw, ch) * (stage >= 2 ? 0.16 : 0.12)
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = isLight
    ? 'rgba(255, 255, 255, 0.9)'
    : material === 'wood'
      ? 'rgba(40, 22, 8, 0.85)'
      : 'rgba(20, 30, 40, 0.75)'
  ctx.lineWidth = Math.max(1, baseR * 0.06)
  ctx.lineCap = 'round'
  ctx.globalAlpha = stage >= 2 ? 0.85 : 0.6
  for (const seed of seeds) {
    const { radials } = buildCrackLines(seed.x, seed.y, baseR, material)
    for (const line of radials) {
      tracePath(ctx, line)
      ctx.stroke()
    }
  }
  ctx.restore()
}

/**
 * Jagged polygon tracing a rectangle perimeter (for clearing a whole
 * detached card off the backdrop). Origin top-left, jitter relative.
 */
export const buildRectPolygon = (x, y, w, h) => {
  const pts = []
  const step = 16
  const push = (px, py) => pts.push({
    x: px + (Math.random() - 0.5) * w * 0.05,
    y: py + (Math.random() - 0.5) * h * 0.08,
  })
  const nx = Math.max(2, Math.round(w / step))
  const ny = Math.max(2, Math.round(h / step))
  for (let i = 0; i <= nx; i++) push(x + (i / nx) * w, y)
  for (let i = 1; i <= ny; i++) push(x + w, y + (i / ny) * h)
  for (let i = 1; i <= nx; i++) push(x + w - (i / nx) * w, y + h)
  for (let i = 1; i < ny; i++) push(x, y + h - (i / ny) * h)
  return pts
}

/**
 * Knock a card-shaped hole out of a 2D context.
 */
export const paintRectHole = (ctx, x, y, w, h) => {
  if (!ctx || !(w > 0) || !(h > 0)) return
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  tracePath(ctx, buildRectPolygon(x, y, w, h))
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/**
 * Convert a pane-local hit (origin at pane center, y up, pane units)
 * to damage-canvas pixels (origin top-left, y down).
 */
export const paneToCanvas = (x, y, paneW, paneH, canvasW, canvasH) => {
  const u = (x + paneW / 2) / paneW
  const v = (y + paneH / 2) / paneH
  return { px: u * canvasW, py: (1 - v) * canvasH }
}

/**
 * Convert a pane-local radius to canvas pixels (uniform scale assumed).
 */
export const radiusToCanvas = (radius, paneW, canvasW) => (radius / paneW) * canvasW
