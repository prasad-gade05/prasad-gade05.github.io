import { beforeEach, describe, expect, it, vi } from 'vitest'
import { captureDOM, captureDOMCanvas, preloadCaptureLibrary } from './domCapture'

const domToCanvasMock = vi.fn()

vi.mock('modern-screenshot', () => ({
  domToCanvas: domToCanvasMock,
}))

describe('captureDOM', () => {
  beforeEach(() => {
    domToCanvasMock.mockReset()
  })

  it('returns null when no element is provided', async () => {
    await expect(captureDOM(null)).resolves.toBeNull()
  })

  it('returns a png data url when capture succeeds', async () => {
    const element = document.createElement('div')
    const canvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,captured'),
    }
    domToCanvasMock.mockResolvedValueOnce(canvas)

    await expect(captureDOM(element)).resolves.toBe('data:image/png;base64,captured')
    expect(domToCanvasMock).toHaveBeenCalledWith(
      element,
      expect.objectContaining({
        scale: 1,
        backgroundColor: null,
      }),
    )
  })

  it('returns null when the capture library throws', async () => {
    const element = document.createElement('div')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    domToCanvasMock.mockRejectedValueOnce(new Error('capture failed'))

    await expect(captureDOM(element)).resolves.toBeNull()
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })

  it('captureDOMCanvas returns the raw canvas and forwards scale', async () => {
    const element = document.createElement('div')
    const canvas = { toDataURL: vi.fn(() => 'data:image/png;base64,captured') }
    domToCanvasMock.mockResolvedValueOnce(canvas)

    await expect(captureDOMCanvas(element, { scale: 0.5 })).resolves.toBe(canvas)
    expect(domToCanvasMock).toHaveBeenCalledWith(
      element,
      expect.objectContaining({ scale: 0.5 }),
    )
  })

  it('captureDOMCanvas returns null when no element is provided', async () => {
    await expect(captureDOMCanvas(null)).resolves.toBeNull()
    expect(domToCanvasMock).not.toHaveBeenCalled()
  })

  it('preloadCaptureLibrary warms the import without throwing', () => {
    expect(() => preloadCaptureLibrary()).not.toThrow()
    expect(() => preloadCaptureLibrary()).not.toThrow()
  })
})
