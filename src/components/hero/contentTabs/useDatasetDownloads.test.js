import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  extractHfRepoId,
  extractKaggleRef,
  formatDownloadCount,
  useDatasetDownloads,
  useKaggleDownloads,
} from './useDatasetDownloads'

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body,
})

describe('extractHfRepoId', () => {
  it('extracts the repo id from Hugging Face dataset urls', () => {
    expect(
      extractHfRepoId('https://huggingface.co/datasets/prasad-gade05/ipl-enriched-dataset'),
    ).toBe('prasad-gade05/ipl-enriched-dataset')
  })

  it('ignores query strings, fragments, and casing of the host', () => {
    expect(
      extractHfRepoId('https://huggingface.co/datasets/org/name?expand[]=downloads'),
    ).toBe('org/name')
    expect(extractHfRepoId('https://huggingface.co/datasets/org/name#files')).toBe('org/name')
    expect(extractHfRepoId('HTTPS://HUGGINGFACE.CO/datasets/org/name')).toBe('org/name')
  })

  it('returns null for non Hugging Face or invalid input', () => {
    expect(
      extractHfRepoId('https://www.kaggle.com/datasets/prasadgade/ipl-2008-2025-enriched-dataset'),
    ).toBeNull()
    expect(extractHfRepoId('https://huggingface.co/models/org/name')).toBeNull()
    expect(extractHfRepoId('not a url')).toBeNull()
    expect(extractHfRepoId(null)).toBeNull()
    expect(extractHfRepoId(42)).toBeNull()
  })
})

describe('formatDownloadCount', () => {
  it('formats counts with thousands separators', () => {
    expect(formatDownloadCount(2027)).toBe('2,027')
    expect(formatDownloadCount(0)).toBe('0')
  })
})

describe('extractKaggleRef', () => {
  it('extracts the owner/slug ref from Kaggle dataset urls', () => {
    expect(
      extractKaggleRef('https://www.kaggle.com/datasets/prasadgade/ipl-2008-2025-enriched-dataset'),
    ).toBe('prasadgade/ipl-2008-2025-enriched-dataset')
    expect(extractKaggleRef('https://kaggle.com/datasets/user-a/ds-1')).toBe('user-a/ds-1')
  })

  it('ignores query strings and fragments', () => {
    expect(
      extractKaggleRef('https://www.kaggle.com/datasets/user-a/ds-1?sort=votes'),
    ).toBe('user-a/ds-1')
    expect(extractKaggleRef('https://www.kaggle.com/datasets/user-a/ds-1#data')).toBe('user-a/ds-1')
  })

  it('returns null for non Kaggle or invalid input', () => {
    expect(
      extractKaggleRef('https://huggingface.co/datasets/prasad-gade05/ipl-enriched-dataset'),
    ).toBeNull()
    expect(extractKaggleRef('not a url')).toBeNull()
    expect(extractKaggleRef(null)).toBeNull()
    expect(extractKaggleRef(42)).toBeNull()
  })
})

describe('useDatasetDownloads', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches all-time downloads for each dataset url', async () => {
    const fetchMock = vi.fn((input) => {
      const url = String(input)
      if (url.includes('ipl-enriched-dataset')) {
        return Promise.resolve(jsonResponse({ downloadsAllTime: 2027 }))
      }
      return Promise.resolve(jsonResponse({ downloadsAllTime: 2511 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useDatasetDownloads([
        'https://huggingface.co/datasets/prasad-gade05/ipl-enriched-dataset',
        'https://huggingface.co/datasets/prasad-gade05/india-upi-ecosystem-2018-2025',
      ]),
    )

    await waitFor(() => {
      expect(result.current['prasad-gade05/ipl-enriched-dataset']).toBe(2027)
      expect(result.current['prasad-gade05/india-upi-ecosystem-2018-2025']).toBe(2511)
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[0][0])).toContain('expand%5B%5D=downloadsAllTime')
  })

  it('requests each dataset only once across hook instances', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({ downloadsAllTime: 47 })))
    vi.stubGlobal('fetch', fetchMock)
    const url = 'https://huggingface.co/datasets/prasad-gade05/cache-check-dataset'

    const first = renderHook(() => useDatasetDownloads(url))
    const second = renderHook(() => useDatasetDownloads(url))

    await waitFor(() => {
      expect(first.result.current['prasad-gade05/cache-check-dataset']).toBe(47)
    })
    expect(second.result.current['prasad-gade05/cache-check-dataset']).toBe(47)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('resolves to null when the api responds with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse({}, { ok: false, status: 404 }))),
    )
    const { result } = renderHook(() =>
      useDatasetDownloads('https://huggingface.co/datasets/prasad-gade05/missing-dataset'),
    )

    await waitFor(() => {
      expect(result.current['prasad-gade05/missing-dataset']).toBeNull()
    })
  })

  it('resolves to null when the payload is malformed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse({ unexpected: true }))),
    )
    const { result } = renderHook(() =>
      useDatasetDownloads('https://huggingface.co/datasets/prasad-gade05/weird-payload-dataset'),
    )

    await waitFor(() => {
      expect(result.current['prasad-gade05/weird-payload-dataset']).toBeNull()
    })
  })

  it('resolves to null when fetch rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network down'))),
    )
    const { result } = renderHook(() =>
      useDatasetDownloads('https://huggingface.co/datasets/prasad-gade05/offline-dataset'),
    )

    await waitFor(() => {
      expect(result.current['prasad-gade05/offline-dataset']).toBeNull()
    })
  })

  it('does not fetch for urls without a hugging face dataset', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() =>
      useDatasetDownloads([
        'https://www.kaggle.com/datasets/prasadgade/ipl-2008-2025-enriched-dataset',
        null,
        undefined,
      ]),
    )

    expect(result.current).toEqual({})
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('useKaggleDownloads', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps dataset refs to download counts from a single owner listing', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        jsonResponse([
          { ref: 'user-k/ds-1', downloadCount: 32 },
          { ref: 'user-k/ds-2', downloadCount: 2 },
          { ref: 'user-k/ds-missing-count' },
        ]),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useKaggleDownloads([
        'https://www.kaggle.com/datasets/user-k/ds-1',
        'https://kaggle.com/datasets/user-k/ds-2',
      ]),
    )

    await waitFor(() => {
      expect(result.current['user-k/ds-1']).toBe(32)
    })
    expect(result.current['user-k/ds-2']).toBe(2)
    expect(result.current['user-k/ds-missing-count']).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toContain('user=user-k')
  })

  it('resolves to an empty map when the api fails or is malformed', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse({}, { ok: false, status: 401 })))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() =>
      useKaggleDownloads('https://www.kaggle.com/datasets/user-fail/ds-1'),
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
    })
    expect(result.current).toEqual({})
  })

  it('does not fetch for urls without a kaggle dataset', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() =>
      useKaggleDownloads([
        'https://huggingface.co/datasets/prasad-gade05/ipl-enriched-dataset',
        null,
      ]),
    )

    expect(result.current).toEqual({})
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
