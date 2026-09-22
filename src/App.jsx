import { useEffect, useState } from 'react'
import { useNews } from './useNews'
import foxLogo from './public/100X100_LOGO_FNC_KEYABLE.png'




// Display the current story image, or a placeholder if it is missing or fails.
// The article key changes for each story, resetting this component's failed state.
function StoryImage({ story }) {
  const [failed, setFailed] = useState(false)
  return <div className="visual">
    {story.image && !failed
      ? <img src={story.image} alt="" onError={() => setFailed(true)} />
      : <div className="image-fallback"><img src={foxLogo} alt="Fox News" /></div>}
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
      
            <span role="status">{error ? (story ? 'Showing previous headlines · Reconnecting' : error) : loading ? 'Refreshing headlines…' : ''}</span>
         
          <div className="playback-controls flex items-center gap-5">

          
          </div>
        </div>

      </div>
    </main>
  </div>
}
