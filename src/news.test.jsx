import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { parseFeed } from './feed'
import { useNews } from './useNews'

const xml = `<rss xmlns:media="http://search.yahoo.com/mrss/"><channel><item><title>First &amp; latest</title><description>&lt;p&gt;Description&lt;/p&gt;</description><media:content url="https://example.com/photo.jpg" type="image/jpeg"/><link>javascript:alert(1)</link></item><item><title>Second</title></item></channel></rss>`
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals() })

describe('feed parsing', () => {
  it('extracts text and namespaced media while rejecting unsafe links', () => {
    const stories = parseFeed(xml)
    expect(stories).toHaveLength(2)
    expect(stories[0]).toMatchObject({ title: 'First & latest', description: 'Description', image: 'https://example.com/photo.jpg', link: '' })
    expect(stories[1].image).toBe('')
  })
  it('rejects malformed and empty feeds', () => {
    expect(() => parseFeed('<rss>')).toThrow('invalid XML')
    expect(() => parseFeed('<rss/>')).toThrow('no stories')
  })
})

describe('slideshow', () => {
  it('displays each story for 7 seconds then fetches a fresh cycle', async () => {
    vi.useFakeTimers()
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => xml })
    vi.stubGlobal('fetch', fetch)
    const { result } = renderHook(() => useNews())
    await act(async () => {})
    expect(result.current.index).toBe(0)
    await act(async () => { await vi.advanceTimersByTimeAsync(6999) })
    expect(result.current.index).toBe(0)
    await act(async () => { await vi.advanceTimersByTimeAsync(1) })
    expect(result.current.index).toBe(1)
    expect(fetch).toHaveBeenCalledTimes(1)
    await act(async () => { await vi.advanceTimersByTimeAsync(7000) })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(result.current.index).toBe(0)
  })
  it('retries an initial failure and recovers', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ ok: true, text: async () => xml }))
    const { result } = renderHook(() => useNews())
    await act(async () => {})
    expect(result.current.error).toBeTruthy()
    await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
    expect(result.current.stories).toHaveLength(2)
    expect(result.current.error).toBe('')
  })
  it('keeps previous stories when a cycle refresh fails', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, text: async () => xml }).mockRejectedValue(new Error('offline')))
    const { result } = renderHook(() => useNews())
    await act(async () => {})
    await act(async () => { await vi.advanceTimersByTimeAsync(7000) })
    await act(async () => { await vi.advanceTimersByTimeAsync(7000) })
    expect(result.current.stories).toHaveLength(2)
    expect(result.current.index).toBe(0)
    expect(result.current.error).toBeTruthy()
  })
})
