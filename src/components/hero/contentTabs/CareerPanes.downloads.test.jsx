import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AchievementsPane } from './CareerPanes'

vi.mock('framer-motion', async () => {
  const React = await vi.importActual('react')
  const makeComponent = (tag) =>
    React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(tag, { ref, ...props }, children),
    )
  return {
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
    motion: new Proxy({}, { get: (_, tag) => makeComponent(tag) }),
  }
})

const jsonResponse = (body) => ({
  ok: true,
  status: 200,
  json: async () => body,
})

describe('AchievementsPane download counts', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders per-link counts and the combined total once data arrives', async () => {
    const fetchMock = vi.fn((input) => {
      const url = String(input)
      if (url.includes('huggingface.co/api/datasets')) {
        if (url.includes('ipl-enriched-dataset')) {
          return Promise.resolve(jsonResponse({ downloadsAllTime: 2027 }))
        }
        if (url.includes('india-upi-ecosystem')) {
          return Promise.resolve(jsonResponse({ downloadsAllTime: 2511 }))
        }
        return Promise.resolve(jsonResponse({ downloadsAllTime: 47 }))
      }
      return Promise.resolve(
        jsonResponse([
          { ref: 'prasadgade/ipl-2008-2025-enriched-dataset', downloadCount: 32 },
          { ref: 'prasadgade/india-upi-ecosystem-2018-2025', downloadCount: 18 },
          { ref: 'prasadgade/satellite-traffic-conjunction-risk', downloadCount: 2 },
        ]),
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<AchievementsPane />)

    const hfLinks = await screen.findAllByRole('link', { name: /hugging face/i })
    expect(hfLinks).toHaveLength(3)
    const kaggleLinks = await screen.findAllByRole('link', { name: /kaggle/i })
    expect(kaggleLinks).toHaveLength(3)

    expect(await screen.findByText('2,027')).toBeInTheDocument()
    expect(screen.getByText('2,511')).toBeInTheDocument()
    expect(screen.getByText('47')).toBeInTheDocument()
    expect(await screen.findByText('32')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('4,637 all-time downloads')).toBeInTheDocument()
    expect(String(fetchMock.mock.calls.at(-1)[0])).toContain('user=prasadgade')
  })
})
