let captureLibPromise

const loadCaptureLib = async () => {
  if (!captureLibPromise) {
    captureLibPromise = import('modern-screenshot')
  }

  return captureLibPromise
}

/**
 * Warm up the capture library dynamic import without capturing anything.
 * Safe to call on hover / idle — the Smash Room click then skips the
 * module-fetch latency. Failures are ignored; the real capture retries.
 */
export const preloadCaptureLibrary = () => {
  try {
    loadCaptureLib().catch(() => {})
  } catch {
    // ignore — captureDOMCanvas will load on demand
  }
}

/**
 * Capture an element to a canvas in a single pass.
 * Returns the raw canvas (null on failure) so callers can crop or
 * encode it however they want without re-running the capture.
 *
 * Uses modern-screenshot (SVG foreignObject rendering): the browser
 * itself paints the clone, so bundled production CSS, webfonts, and
 * modern color functions render exactly like the live page. The
 * previous html2canvas re-painter re-implemented CSS in JS and
 * diverged from the live layout (torn/sliced captures in Firefox
 * production builds while dev looked fine).
 */
export const captureDOMCanvas = async (element, opts = {}) => {
  if (!element) return null

  try {
    const { domToCanvas } = await loadCaptureLib()
    const canvas = await domToCanvas(element, {
      scale: opts.scale ?? 1,
      backgroundColor: null,
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
