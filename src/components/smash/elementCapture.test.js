import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BREAKABLE_SELECTORS, collectBreakables, captureSmashScene } from './elementCapture'

const { captureDOMCanvasMock, preloadCaptureLibraryMock } = vi.hoisted(() => ({
  captureDOMCanvasMock: vi.fn(),
  preloadCaptureLibraryMock: vi.fn(),
}))

vi.mock('../../utils/domCapture', () => ({
  captureDOMCanvas: captureDOMCanvasMock,
  preloadCaptureLibrary: preloadCaptureLibraryMock,
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

const makeRoot = (elsBySelector, rect = { x: 0, y: 0, width: 800, height: 600 }) => ({
  querySelectorAll: (selector) => elsBySelector[selector] || [],
  getBoundingClientRect: () => ({
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height,
    x: rect.x,
    y: rect.y,
  }),
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
    for (const sel of ['.tabs-header', '.pane-header', '.info-section', '.code-card', '.social-card-fun', '.project-card', '.hobby-card']) {
      expect(BREAKABLE_SELECTORS).toContain(sel)
    }
  })

  it('handles missing roots gracefully', () => {
    expect(collectBreakables(null)).toEqual([])
    expect(collectBreakables({})).toEqual([])
  })
})

describe('captureSmashScene', () => {
  const realCreateElement = document.createElement.bind(document)
  let createElementSpy
  let drawImageSpy
  let itemCounter
  let failOnItem

  const sourceCanvas = () => ({
    width: 800,
    height: 600,
    toDataURL: vi.fn(() => 'backdrop.jpg'),
  })

  beforeEach(() => {
    captureDOMCanvasMock.mockReset()
    preloadCaptureLibraryMock.mockReset()
    drawImageSpy = vi.fn()
    itemCounter = 0
    failOnItem = -1
    // jsdom has no 2d context — fake item canvases, delegate the rest
    // (notably the <style> freeze tag) to the real implementation.
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag, ...rest) => {
      if (tag !== 'canvas') return realCreateElement(tag, ...rest)
      const n = itemCounter++
      return {
        width: 0,
        height: 0,
        getContext: () => ({ drawImage: drawImageSpy }),
        toDataURL: () => {
          if (n === failOnItem) throw new Error('encode failed')
          return `item-${n}.jpg`
        },
      }
    })
  })

  afterEach(() => {
    createElementSpy.mockRestore()
  })

  it('runs one screenshot then slices one image per breakable in DOM order', async () => {
    const a = makeEl({ rect: { x: 0, y: 0, w: 100, h: 100 }, order: 1 })
    const b = makeEl({ rect: { x: 0, y: 120, w: 100, h: 100 }, order: 2 })
    const root = makeRoot({ '.info-section': [a, b] })
    const source = sourceCanvas()
    captureDOMCanvasMock.mockResolvedValueOnce(source)

    const scene = await captureSmashScene(root)

    expect(captureDOMCanvasMock).toHaveBeenCalledTimes(1)
    expect(captureDOMCanvasMock).toHaveBeenCalledWith(root, { scale: 1 })
    expect(source.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.85)
    expect(scene.backdrop).toBe('backdrop.jpg')
    expect(scene.items).toHaveLength(2)
    expect(scene.items[0]).toMatchObject({ id: 'target-0', image: 'item-0.jpg' })
    expect(scene.items[0].rect).toEqual({ x: 0, y: 0, w: 100, h: 100 })
    expect(scene.items[1]).toMatchObject({ id: 'target-1', image: 'item-1.jpg' })
    expect(drawImageSpy).toHaveBeenCalledTimes(2)
    expect(drawImageSpy.mock.calls[0][0]).toBe(source)
    // Motion-freeze style is always cleaned up
    expect(document.querySelector('[data-smash-freeze]')).toBeNull()
  })

  it('downscales wide viewports so the single screenshot stays cheap', async () => {
    const a = makeEl({ rect: { x: 0, y: 0, w: 100, h: 100 }, order: 1 })
    const root = makeRoot({ '.info-section': [a] }, { x: 0, y: 0, width: 2560, height: 1080 })
    captureDOMCanvasMock.mockResolvedValueOnce(sourceCanvas())

    await captureSmashScene(root)

    expect(captureDOMCanvasMock).toHaveBeenCalledWith(root, { scale: 0.5 })
  })

  it('skips cards whose crop fails, keeping DOM-order ids', async () => {
    const a = makeEl({ rect: { x: 0, y: 0, w: 100, h: 100 }, order: 1 })
    const b = makeEl({ rect: { x: 0, y: 120, w: 100, h: 100 }, order: 2 })
    const root = makeRoot({ '.info-section': [a, b] })
    failOnItem = 0
    captureDOMCanvasMock.mockResolvedValueOnce(sourceCanvas())

    const scene = await captureSmashScene(root)

    expect(scene.backdrop).toBe('backdrop.jpg')
    expect(scene.items).toHaveLength(1)
    expect(scene.items[0]).toMatchObject({ id: 'target-0', image: 'item-1.jpg' })
    expect(document.querySelector('[data-smash-freeze]')).toBeNull()
  })

  it('returns an empty scene when the single capture fails', async () => {
    const a = makeEl({ rect: { x: 0, y: 0, w: 100, h: 100 }, order: 1 })
    const root = makeRoot({ '.info-section': [a] })
    captureDOMCanvasMock.mockResolvedValueOnce(null)

    await expect(captureSmashScene(root)).resolves.toEqual({ backdrop: null, items: [] })
    expect(drawImageSpy).not.toHaveBeenCalled()
    expect(document.querySelector('[data-smash-freeze]')).toBeNull()
  })

  it('returns empty scene for missing roots', async () => {
    await expect(captureSmashScene(null)).resolves.toEqual({ backdrop: null, items: [] })
    expect(captureDOMCanvasMock).not.toHaveBeenCalled()
  })
})
