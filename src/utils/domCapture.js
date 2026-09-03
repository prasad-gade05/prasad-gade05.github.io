let html2canvasPromise

const loadHtml2Canvas = async () => {
  if (!html2canvasPromise) {
    html2canvasPromise = import('html2canvas').then((module) => module.default)
  }

  return html2canvasPromise
}

export const captureDOM = async (element, opts = {}) => {
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
    return canvas.toDataURL('image/png')
  } catch (err) {
    console.error('DOM capture failed:', err)
    return null
  }
}
