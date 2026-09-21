import { useEffect, useState } from 'react'
import { useNews } from './useNews'
import foxLogo from './public/100X100_LOGO_FNC_KEYABLE.png'

// Display local time and date. This component updates its own state every second,
// independently of the seven-second news slideshow.
function Clock() {
  const [now, setNow] = useState(new Date())
  // Start the clock interval on mount and clear it when this component is removed.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <div className="text-right">
    <div className="clock">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
    <div className="date">{now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
  </div>
}

// Display the current story image, or a placeholder if it is missing or fails.
// The article key changes for each story, resetting this component's failed state.
function StoryImage({ story }) {
  const [failed, setFailed] = useState(false)
  return <div className="visual">
    {story.image && !failed
      ? <img src={story.image} alt="" onError={() => setFailed(true)} />
      : <div className="image-fallback"><span>FOX NEWS</span><p>Latest headlines</p></div>}
  </div>
}

// main.jsx renders this page. Ask useNews for data and select stories[index].
// React renders again when the hook updates state, revealing the selected story.
// This component builds the layout; useNews handles fetching and story timing.
export default function App() {
  const { stories, index, cycle, loading, error, paused, togglePause } = useNews()
  const story = stories[index]
  const running = !loading && !paused && Boolean(story)
  const playbackKey = `${cycle}-${index}-${loading}-${paused}`

  return <div className="news-shell">
    <header className="headline-frame">
      <div className="headline-banner">
        <a className="fox-logo" href="https://www.foxnews.com/" target="_blank" rel="noopener noreferrer" aria-label="Fox News">
          <img src={foxLogo} alt="Fox News" />
        </a>
        <h1>{story?.title || 'Latest & Breaking News'}</h1>
      </div>
    </header>

    <main className="content-frame">
      <div className="content-panel">
        {story ? <article className="story" key={`${cycle}-${index}`}>
          <StoryImage story={story} />
          <p className="description">{story.description}</p>
        </article> : <div className="empty-state" role="status">
          <h2>{error ? 'Waiting for the latest.' : 'Connecting you to the latest.'}</h2>
          <p>{error || 'Loading headlines from Fox News…'}</p>
        </div>}

        <div className="playback flex items-center justify-between gap-4">
          <div className="feed-status"><span className="status-dot" />
            <span role="status">{error ? (story ? 'Showing previous headlines · Reconnecting' : error) : loading ? 'Refreshing headlines…' : 'FOX NEWS · LATEST HEADLINES'}</span>
          </div>
          <div className="playback-controls flex items-center gap-5">
            <span className="story-count">{String(story ? index + 1 : 0).padStart(2, '0')} / {String(stories.length).padStart(2, '0')}</span>
            <button onClick={togglePause} aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'} className="timer-button">
              <svg key={playbackKey} className={`timer-dial ${running ? 'running' : ''}`} viewBox="0 0 40 40" aria-hidden="true"><circle className="dial-track" cx="20" cy="20" r="17" /><circle className="dial-progress" cx="20" cy="20" r="17" pathLength="100" /></svg>
              <span>{paused ? '▶' : 'Ⅱ'}</span>
            </button>
            <Clock />
          </div>
        </div>
        <div className="progress-track" aria-hidden="true"><div key={playbackKey} className={`progress-fill ${running ? 'running' : ''}`} /></div>
      </div>
    </main>
  </div>
}
