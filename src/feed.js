export const FEED_URL = import.meta.env.VITE_FEED_URL || 'https://feeds.foxnews.com/foxnews/latest'
export const STORY_DURATION = 7000

// Validate an image or article URL. Upgrade HTTP to HTTPS and return an empty
// string for invalid URLs or unsupported protocols. This does not download anything.
function safeUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol === 'http:') url.protocol = 'https:'
    return url.protocol === 'https:' ? url.href : ''
  } catch { return '' }
}

// Turn feed text containing HTML into plain text for React to display.
// Remove script/style contents and trim whitespace.
function plainText(value) {
  const doc = new DOMParser().parseFromString(value, 'text/html')
  doc.querySelectorAll('script, style').forEach(node => node.remove())
  return doc.body.textContent.trim()
}

// Convert downloaded XML into an array of story objects.
// Read each item, extract its text and media image, and discard items without titles.
// Invalid XML or an empty story list throws an error for useNews to handle.
export function parseFeed(xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('The news feed returned invalid XML.')
  const stories = [...doc.querySelectorAll('item')].map((item, index) => {
    // Read a named field from this item; missing fields become an empty string.
    const field = name => item.getElementsByTagName(name)[0]?.textContent?.trim() || ''
    const media = [...item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')]
    const picture = media.find(node => node.getAttribute('type')?.startsWith('image/') || node.getAttribute('medium') === 'image')
      || media.find(node => !node.getAttribute('type') && node.getAttribute('medium') !== 'video')
      || item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0]
    return {
      id: field('guid') || field('link') || String(index),
      title: plainText(field('title')),
      description: plainText(field('description')),
      image: safeUrl(picture?.getAttribute('url')),
      link: safeUrl(field('link')),
      category: plainText(field('category')) || 'Latest news',
    }
  }).filter(story => story.title)
  if (!stories.length) throw new Error('The news feed has no stories yet.')
  return stories
}
//fetchStories 
// Called by the first effect in useNews: download the complete feed, check the
// HTTP response, and pass the XML text to parseFeed. Return its array of stories.
// The signal lets useNews cancel this request during cleanup or after a timeout.
export async function fetchStories(signal) {
  const response = await fetch(FEED_URL, { signal, cache: 'no-store' })
  if (!response.ok) throw new Error(`News feed unavailable (${response.status}).`)
  return parseFeed(await response.text())
}
