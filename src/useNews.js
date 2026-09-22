import { useEffect, useState } from 'react'
import { fetchStories, STORY_DURATION } from './feed'

// App calls this hook to get the stories, current story index, and playback controls.
// State changes here tell React to render App again with the latest values.
export function useNews() {
  const [state, setState] = useState({ stories: [], index: 0, cycle: 0, loading: true, error: '' })
  const [paused, setPaused] = useState(false)
  const [retry, setRetry] = useState(0)

  // EFFECT 1: FETCH THE WHOLE FEED.
  // Runs after the first render, then whenever cycle or retry changes.
  // fetchStories downloads and parses the XML; we save its array in state.
  // A successful fetch starts at story 0. A failed refresh keeps the previous stories.
  // Cleanup cancels the old request; the timeout cancels requests after 15 seconds.
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

  // EFFECT 2: ADVANCE THROUGH THE STORIES ALREADY DOWNLOADED.
  // When playback is ready, wait 7 seconds and increase index so App shows the next story.
  // After the last story, increase cycle: that triggers Effect 1 to fetch again.
  // With no stories, wait 15 seconds and increase retry to trigger Effect 1 instead.
  // Loading or pausing stops scheduling; cleanup removes the previous timer.
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
