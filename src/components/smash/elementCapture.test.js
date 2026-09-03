import { describe, expect, it, vi } from 'vitest'
import { BREAKABLE_SELECTORS, collectBreakables, captureSmashScene } from './elementCapture'

const { captureDOMMock } = vi.hoisted(() => ({ captureDOMMock: vi.fn() }))

vi.mock('../../utils/domCapture', () => ({
  captureDOM: captureDOMMock,
}))

const DOCUMENT_POSITION_FOLLOWING = 4
const DOCUMENT_POSITION_PRECEDING = 2

/** Minimal fake element with stubbed rect + DOM-order comparison. */
const makeEl = ({ rect, order = 0, children = [], matches = true }) => {
  const el = {
    _rect: rect,
    _order: order,
    _children: children,
    // DOMRect shape, like the real getBoundingClientRect
    getBoundingClientRect: () => ({
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      right: rect.x + rect.w,
      bottom: rect.y + rect.h,
      x: rect.x,
      y: rect.y,
    }),
    contains: (other) => other === el || el._children.some((c) => c === other || c.contains?.(other)),
    compareDocumentPosition: (other) => {
      if (other === el) return 0
      return other._order < order ? DOCUMENT_POSITION_PRECEDING : DOCUMENT_POSITION_FOLLOWING
    },
    querySelectorAll: () => (matches ? [el] : []),
  }
  return el
}

const makeRoot = (elsBySelector) => ({
  querySelectorAll: (selector) => elsBySelector[selector] || [],
})

describe('collectBreakables', () => {
  it('collects visible matches in DOM order', () => {
    const a = makeEl({ rect: { x: 0, y: 0, w: 100, h: 100 }, order: 2 })
    const b = makeEl({ rect: { x: 0, y: 120, w: 100, h: 100 }, order: 1 })
    const root = makeRoot({ '.info-section': [b, a] })

    const out = collectBreakables(root)
    expect(out).toHaveLength(2)
    expect(out[0].el).toBe(b)
    expect(out[1].el).toBe(a)
    expect(out[0].rect).toEqual({ x: 0, y: 120, w: 100, h: 100 })
  })

  it('drops tiny, offscreen, and nested matches, keeping the outermost', () => {
    const outer = makeEl({ rect: { x: 0, y: 0, w: 200, h: 200 }, order: 1 })
    const inner = makeEl({ rect: { x: 10, y: 10, w: 50, h: 50 }, order: 2 })
    outer._children = [inner]
    const tiny = makeEl({ rect: { x: 300, y: 0, w: 5, h: 50 }, order: 3 })
    const offscreen = makeEl({ rect: { x: -500, y: 0, w: 100, h: 100 }, order: 4 })
    const root = makeRoot({
      '.code-card': [outer],
      '.social-card-fun': [inner, tiny, offscreen],
    })

    const out = collectBreakables(root)
    expect(out).toHaveLength(1)
    expect(out[0].el).toBe(outer)
  })

  it('dedupes elements matching several selectors', () => {
    const el = makeEl({ rect: { x: 0, y: 0, w: 100, h: 100 }, order: 1 })
    const root = makeRoot({ '.code-card': [el], '.info-section': [el] })

    expect(collectBreakables(root)).toHaveLength(1)
  })

  it('exposes the real site selectors', () => {
    for (const sel of ['.info-section', '.code-card', '.social-card-fun', '.project-card', '.hobby-card']) {
      expect(BREAKABLE_SELECTORS).toContain(sel)
    }
  })

  it('handles missing roots gracefully', () => {
    expect(collectBreakables(null)).toEqual([])
    expect(collectBreakables({})).toEqual([])
  })
})

describe('captureSmashScene', () => {
  it('captures backdrop plus one image per breakable, skipping failures', async () => {
    const a = makeEl({ rect: { x: 0, y: 0, w: 100, h: 100 }, order: 1 })
    const b = makeEl({ rect: { x: 0, y: 120, w: 100, h: 100 }, order: 2 })
    const root = makeRoot({ '.info-section': [a, b] })

    captureDOMMock.mockReset()
    captureDOMMock.mockResolvedValueOnce('backdrop.png')
    captureDOMMock.mockResolvedValueOnce('a.png')
    captureDOMMock.mockRejectedValueOnce(new Error('bad card'))

    const scene = await captureSmashScene(root)
    expect(scene.backdrop).toBe('backdrop.png')
    expect(scene.items).toHaveLength(1)
    expect(scene.items[0]).toMatchObject({ id: 'target-0', image: 'a.png' })
    expect(captureDOMMock).toHaveBeenCalledTimes(3)
    // Motion-freeze style is always cleaned up
    expect(document.querySelector('[data-smash-freeze]')).toBeNull()
  })

  it('returns empty scene for missing roots', async () => {
    await expect(captureSmashScene(null)).resolves.toEqual({ backdrop: null, items: [] })
  })
})
