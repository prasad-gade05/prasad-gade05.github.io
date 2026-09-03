/**
 * Per-element capture for the Smash Room.
 *
 * Captures the full page as a backdrop plus each breakable card/panel/
 * button as its own screenshot, so the arena looks exactly like the site
 * while every element breaks independently.
 */

import { captureDOM } from '../../utils/domCapture'

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
 * Capture the smash scene: full-page backdrop + one screenshot per
 * breakable element. Failures are skipped individually so one bad card
 * never blocks the room. Returns { backdrop, items } where items are
 * [{ id, rect, image }].
 *
 * Motion freeze: framer-motion / tilt transforms on the live page would
 * otherwise bake into element rects but not their screenshots, producing
 * doubled, offset ghosts. Transforms, transitions, animations, and
 * filters are neutralized for the duration of the capture, then restored.
 *
 * Speed: element captures run in parallel batches instead of one by one.
 */
export const CAPTURE_BATCH_SIZE = 4

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
    const backdrop = await captureDOM(rootEl).catch(() => null)
    const breakables = collectBreakables(rootEl)
    const results = []
    for (let i = 0; i < breakables.length; i += CAPTURE_BATCH_SIZE) {
      const batch = breakables.slice(i, i + CAPTURE_BATCH_SIZE)
      const images = await Promise.all(
        batch.map(({ el }) => captureDOM(el).then(
          (image) => image,
          () => null,
        )),
      )
      images.forEach((image, j) => {
        if (image) results.push({ el: batch[j].el, rect: batch[j].rect, image })
      })
    }
    // DOM order is preserved by sequential batches — ids follow it
    const items = results.map(({ rect, image }, n) => ({ id: `target-${n}`, rect, image }))
    return { backdrop, items }
  } finally {
    unfreeze()
  }
}
