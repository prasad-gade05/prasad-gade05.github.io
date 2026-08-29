import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useGoatCounterViews } from './useGoatCounterViews'

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body,
})

describe('useGoatCounterViews', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches the view count for page paths with encoded urls', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ count: '69' })))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useGoatCounterViews(['/blogs/agent-readiness-on-websites/']),
    )

    await waitFor(() => {
      expect(result.current['/blogs/agent-readiness-on-websites/']).toBe('69')
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'https://prasadgade05.goatcounter.com/counter/%2Fblogs%2Fagent-readiness-on-websites%2F.json',
    )
  })

  it('fetches site totals through the special TOTAL path', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ count: '649' })))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useGoatCounterViews('TOTAL'))

    await waitFor(() => {
      expect(result.current.TOTAL).toBe('649')
    })

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'https://prasadgade05.goatcounter.com/counter/TOTAL.json',
    )
  })

  it('coerces numeric counts to strings', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse({ count: 12 }))),
    )
    const { result } = renderHook(() => useGoatCounterViews('/numeric-count/'))

    await waitFor(() => {
      expect(result.current['/numeric-count/']).toBe('12')
    })
  })

  it('resolves to null when the api fails or the payload is malformed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse({ nope: true }, { ok: false, status: 403 }))),
    )
    const { result } = renderHook(() => useGoatCounterViews('/failing-path/'))

    await waitFor(() => {
      expect(result.current['/failing-path/']).toBeNull()
    })
  })

  it('requests each path only once across hook instances', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ count: '7' })))
    vi.stubGlobal('fetch', fetchMock)

    const first = renderHook(() => useGoatCounterViews('/cached-path/'))
    const second = renderHook(() => useGoatCounterViews('/cached-path/'))

    await waitFor(() => {
      expect(first.result.current['/cached-path/']).toBe('7')
    })
    expect(second.result.current['/cached-path/']).toBe('7')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not fetch when no paths are given', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useGoatCounterViews([]))

    expect(result.current).toEqual({})
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
