# Breaking News

Standalone React + Vite + Tailwind CSS page. This project is independent of the immortale game.

```sh
cd /Users/nico/Desktop/apps/breaking-news
npm install
npm run dev
```

`npm run build` produces static HTML, JavaScript and CSS in `dist/`. Serve that directory on your hosting platform or load its hosted URL in X2O. No PHP or database is used. `npm run preview` serves a local production preview; `npm test` checks feed parsing and slideshow behavior.

The browser fetches https://feeds.foxnews.com/foxnews/latest over HTTPS, parses RSS `item` titles, descriptions and namespaced media images, and shows each story for 7 seconds. After the final story it fetches again and starts at the first item. The final story stays visible while refreshing. If refreshing fails, previous stories keep cycling; an initial failure retries every 15 seconds. Requests time out after 15 seconds. Missing or failed images get a neutral placeholder. Pause stops rotation; resume starts a full seven-second interval.

The feed currently supplies CORS headers allowing browser access, including on its redirect to moxie.foxnews.com. If Fox changes that policy, the hosting/X2O environment will need an approved same-origin feed relay. Do not use `no-cors`: it prevents JavaScript from reading XML. You can configure another browser-readable feed with `VITE_FEED_URL` at build time. Fox may cache its feed, so a refresh does not necessarily return different stories.

Designed for a full-screen landscape display with a responsive mobile layout. Browser background-tab throttling can delay rotation; keep the signage page foregrounded. Confirm X2O's browser version, display resolution, and network access with Wes before deployment.

Vite 6 is used for compatibility with the workspace's Node 20.18 installation. Tailwind is integrated with its official Vite plugin: https://tailwindcss.com/docs/installation/using-vite.
