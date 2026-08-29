import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Default network guard: component tests must never hit real endpoints.
// Individual tests can override via vi.stubGlobal('fetch', ...).
window.fetch = vi.fn(() =>
  Promise.resolve({ ok: false, status: 0, json: async () => ({}) }),
)

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverMock
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (!document.startViewTransition) {
  document.startViewTransition = (callback) => {
    callback()
    return {
      ready: Promise.resolve(),
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(),
    }
  }
}
