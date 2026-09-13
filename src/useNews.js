import { useEffect, useState } from 'react'
import { fetchStories, STORY_DURATION } from './feed'

export function useNews() {
  const [state, setState] = useState({ stories: [], index: 0, cycle: 0, loading: true, error: '' })
  const [paused, setPaused] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const timeout = setTimeout(() => controller.abort(), 15000)
    fetchStories(controller.signal).then(stories => {
      if (active) setState(previous => ({ ...previous, stories, index: 0, loading: false, error: '' }))
    }).catch(() => {
      if (active) setState(previous => ({ ...previous, index: 0, loading: false, error: 'Feed unavailable. Retrying automatically.' }))
    }).finally(() => clearTimeout(timeout))
    return () => { active = false; clearTimeout(timeout); controller.abort() }
  }, [state.cycle, retry])

  useEffect(() => {
    if (state.loading || paused) return
    const timer = setTimeout(() => {
      if (!state.stories.length) { setRetry(value => value + 1); return }
      setState(previous => previous.index + 1 < previous.stories.length
        ? { ...previous, index: previous.index + 1 }
        : { ...previous, loading: true, cycle: previous.cycle + 1 })
    }, state.stories.length ? STORY_DURATION : 15000)
    return () => clearTimeout(timer)
  }, [state.index, state.cycle, state.loading, state.stories.length, retry, paused])

  return { ...state, paused, togglePause: () => setPaused(value => !value) }
}
