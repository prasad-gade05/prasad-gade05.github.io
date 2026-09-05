/**
 * Per-element capture for the Smash Room.
 *
 * Captures the full page as a backdrop plus each breakable card/panel/
 * button as its own screenshot, so the arena looks exactly like the site
 * while every element breaks independently.
 */

import { captureDOMCanvas, preloadCaptureLibrary } from '../../utils/domCapture'

/** Card/panel/button roots that become individual breakables. */
export const BREAKABLE_SELECTORS = [
  '.tabs-header',
  '.pane-header',
  '.info-section',
  '.code-card',
  '.social-card-fun',
  '.project-card',
  '.hobby-card',
  '.about-card',
  '.skill-group',
  '.exp-card',
  '.edu-item',
  '.achieve-item',
  '.cert-item',
  '.volunteer-item',
  '.blog-card',
]

export const MAX_ITEMS = 40
const MIN_SIDE_PX = 8

const rectOf = (el) => {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, w: r.width, h: r.height }
}

const isVisible = (rect, vw, vh) =>
  rect.w >= MIN_SIDE_PX &&
  rect.h >= MIN_SIDE_PX &&
  rect.x < vw &&
  rect.y < vh &&
  rect.x + rect.w > 0 &&
  rect.y + rect.h > 0

const contains = (outer, inner) =>
  outer.x <= inner.x &&
  outer.y <= inner.y &&
  outer.x + outer.w >= inner.x + inner.w &&
  outer.y + outer.h >= inner.y + inner.h

/**
 * Collect breakable elements under root: visible, non-nested (outermost
 * wins so captures never overlap), in DOM order, capped.
 * Returns [{ el, rect }].
 */
export const collectBreakables = (root) => {
  if (!root || typeof root.querySelectorAll !== 'function') return []
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0

  const found = []
  for (const selector of BREAKABLE_SELECTORS) {
    let nodes = []
    try {
      nodes = root.querySelectorAll(selector)
    } catch {
      continue
    }
    for (const el of nodes) {
      const rect = rectOf(el)
      if (!isVisible(rect, vw, vh)) continue
      found.push({ el, rect })
    }
  }

  // Dedupe (one element can match several selectors), then drop
  // elements nested inside another match — outermost wins.
  const seen = new Set()
  const unique = found.filter(({ el }) => {
    if (seen.has(el)) return false
    seen.add(el)
    return true
  })
  const topLevel = unique.filter(
    (candidate) =>
      !unique.some(
        (other) =>
          other.el !== candidate.el &&
          contains(other.rect, candidate.rect) &&
          other.el.contains(candidate.el),
      ),
  )

  // DOM order, capped
  topLevel.sort((a, b) => {
    const pos = a.el.compareDocumentPosition(b.el)
    if (pos & 2) return 1 // b precedes a
    if (pos & 4) return -1 // a precedes b
    return 0
  })
  return topLevel.slice(0, MAX_ITEMS)
}

/**
 * Capture the smash scene with ONE capture pass, then slice each
 * breakable out of that same bitmap with synchronous canvas crops.
 *
  * The old approach ran one capture once per card (up to 40 passes over
 * the DOM plus 40 PNG encodes, in batches of 4) — that was the entire
 * "Capturing the site for the arena…" wait. Crops are pixel-perfect by
 * construction (same source bitmap as the backdrop) and cost ~ms each.
 *
 * Returns { backdrop, items } where items are [{ id, rect, image }].
 * Individual crop failures are skipped so one bad card never blocks
 * the room. Without a backdrop the room cannot align anything, so a
 * failed backdrop means an empty scene.
 *
 * Motion freeze: framer-motion / tilt transforms on the live page would
 * otherwise bake into element rects but not their screenshots, producing
 * doubled, offset ghosts. Transforms, transitions, animations, and
 * filters are neutralized for the duration of the capture, then restored.
 */
export const CAPTURE_BATCH_SIZE = 4 // kept for compat; captures are no longer batched

/** Backdrop is downscaled to this max width — the 3D wall is 1024px
 *  wide anyway, so full-res captures only burn raster + encode time. */
export const MAX_CAPTURE_WIDTH = 1280
const ITEM_MIME = 'image/jpeg'
const ITEM_QUALITY = 0.85

/**
  * Warm up everything the click needs while the user is still hovering:
  * the capture-library chunk and the SmashOverlay lazy chunk. Both are
 * cached, so the real click only pays for the single screenshot.
 */
export const prefetchSmashRoom = () => {
  try {
    preloadCaptureLibrary()
  } catch {
    // ignore — the real capture loads on demand
  }
  try {
    import('./SmashOverlay').catch(() => {})
  } catch {
    // ignore — React.lazy will fetch on render
  }
}

/** Crop one item bitmap out of the shared capture. Null on any failure. */
const cropToDataURL = (source, sx, sy, sw, sh) => {
  try {
    if (!source || sw < 2 || sh < 2) return null
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL(ITEM_MIME, ITEM_QUALITY)
  } catch {
    return null
  }
}

const freezeMotion = () => {
  if (typeof document === 'undefined') return () => {}
  const style = document.createElement('style')
  style.setAttribute('data-smash-freeze', 'true')
  style.textContent =
    '#app-content *, #app-content { transform: none !important; transition: none !important; ' +
    'animation: none !important; filter: none !important; backdrop-filter: none !important; }'
  document.head.appendChild(style)
  // Force reflow so the freeze applies before the first screenshot
  void document.body?.offsetHeight
  return () => style.remove()
}

export const captureSmashScene = async (rootEl) => {
  if (!rootEl) return { backdrop: null, items: [] }
  const unfreeze = freezeMotion()
  try {
    const breakables = collectBreakables(rootEl)
    const rootRect = typeof rootEl.getBoundingClientRect === 'function'
      ? rootEl.getBoundingClientRect()
      : { x: 0, y: 0, width: 0, height: 0 }
    const rootW = rootRect.width ?? rootRect.w ?? 0
    const rootH = rootRect.height ?? rootRect.h ?? 0
    if (!(rootW > 0) || !(rootH > 0)) return { backdrop: null, items: [] }

    // One screenshot for the whole room; smaller bitmap = faster raster.
    const scale = Math.min(1, MAX_CAPTURE_WIDTH / rootW)
    const source = await captureDOMCanvas(rootEl, { scale }).catch(() => null)
    if (!source?.width || !source?.height) return { backdrop: null, items: [] }

    let backdrop = null
    try {
      backdrop = source.toDataURL(ITEM_MIME, ITEM_QUALITY)
    } catch {
      return { backdrop: null, items: [] }
    }
    if (!backdrop) return { backdrop: null, items: [] }

    // Map viewport CSS px to bitmap px with the measured (not requested)
    // ratio, so capture rounding can't drift the crops.
    const kx = source.width / rootW
    const ky = source.height / rootH
    const items = []
    for (const { rect } of breakables) {
      const rw = rect.w ?? rect.width ?? 0
      const rh = rect.h ?? rect.height ?? 0
      if (!(rw > 0) || !(rh > 0)) continue
      const sx = Math.round(((rect.x ?? 0) - (rootRect.x ?? 0)) * kx)
      const sy = Math.round(((rect.y ?? 0) - (rootRect.y ?? 0)) * ky)
      const sw = Math.round(rw * kx)
      const sh = Math.round(rh * ky)
      // Clamp to the bitmap — partly offscreen cards still slice cleanly.
      const cx = Math.max(0, Math.min(source.width - 1, sx))
      const cy = Math.max(0, Math.min(source.height - 1, sy))
      const cw = Math.max(0, Math.min(sw - (cx - sx), source.width - cx))
      const ch = Math.max(0, Math.min(sh - (cy - sy), source.height - cy))
      const image = cropToDataURL(source, cx, cy, cw, ch)
      // DOM order is preserved — ids follow it
      if (image) items.push({ id: `target-${items.length}`, rect, image })
    }
    return { backdrop, items }
  } finally {
    unfreeze()
  }
}
