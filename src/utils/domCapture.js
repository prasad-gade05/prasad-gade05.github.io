let html2canvasPromise

const loadHtml2Canvas = async () => {
  if (!html2canvasPromise) {
    html2canvasPromise = import('html2canvas').then((module) => module.default)
  }

  return html2canvasPromise
}

/**
 * Warm up the html2canvas dynamic import without capturing anything.
 * Safe to call on hover / idle — the Smash Room click then skips the
 * module-fetch latency. Failures are ignored; the real capture retries.
 */
export const preloadCaptureLibrary = () => {
  try {
    loadHtml2Canvas().catch(() => {})
  } catch {
    // ignore — captureDOMCanvas will load on demand
  }
}

/**
 * Capture an element to a canvas in a single html2canvas pass.
 * Returns the raw canvas (null on failure) so callers can crop or
 * encode it however they want without re-running html2canvas.
 */
export const captureDOMCanvas = async (element, opts = {}) => {
  if (!element) return null

  try {
    const html2canvas = await loadHtml2Canvas()
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: opts.scale ?? 1,
      backgroundColor: null,
      logging: false,
      allowTaint: true,
    })
    return canvas ?? null
  } catch (err) {
    console.error('DOM capture failed:', err)
    return null
  }
}

export const captureDOM = async (element, opts = {}) => {
  const canvas = await captureDOMCanvas(element, opts)
  if (!canvas) return null

  try {
    return canvas.toDataURL('image/png')
  } catch (err) {
    console.error('DOM capture failed:', err)
    return null
  }
}
