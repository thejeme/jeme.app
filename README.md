# jeme.app

A small, static personal website. Plain HTML, CSS, and JavaScript; no build step or runtime dependencies.

## Preview

Run `python3 -m http.server 4173` from this directory and open <http://localhost:4173>.

## Deploy

Serve this directory at the root of `https://jeme.app` with HTTPS. Keep `.well-known/discord` available for domain verification. Serve `site.webmanifest` as `application/manifest+json` and `sw.js` as JavaScript (standard static hosts do this automatically).

The site includes automatic light/dark themes, a web app manifest, app icons, and a service worker that caches the page for offline visits. External profile links still need an internet connection. Installation is offered by supporting browsers; there is no custom install prompt.

Use revalidation (`Cache-Control: no-cache`) for HTML and `sw.js`. When changing cached site files, increment `CACHE` in `sw.js` so a new worker refreshes the offline shell. The updated worker activates after existing site tabs close. Avoid immutable caching for the unversioned CSS, JS, and image filenames.

## Assets

The supplied `assets/miumau-*.png` files are the avatar originals. The page uses 256px WebP derivatives. PNG app icons use the black avatar on the site's light background; the maskable icon adds safe padding. `assets/social.png` is the 1200 × 630 social preview. Update the canonical, social URLs, sitemap, and manifest if the domain changes.

## Easter eggs

Click the avatar (or focus it and press Enter/Space) to pet em; every third pet shows “mrrp.” Em gets a small “z” after 60 seconds without activity and wakes on interaction. Type `miumau` outside a text field to toggle the blue avatar and palette for the current visit. The developer console has a small greeting. All effects are silent, respect reduced motion, and work offline after the first visit.

The Discord row copies `thejeme` through the browser clipboard API. If clipboard access fails, or JavaScript is unavailable, it provides a selectable username. No third-party profile or clipboard service is used.

More discoveries: `pspsps` wakes em with “?”, `hello` gets “hi.”, and `bye` gets “bye.” Between midnight and 5 a.m. in the visitor’s local time, each pet has a 25% chance of getting “still awake?”. Double-click the name’s dot (or focus it and press Enter/Space) for a brief paw print. Printing reveals “you put the cat on paper.” beneath em.

Type `fetch` to let em borrow the dot (“mine.”), `purr` for “prrr.”, `rain` for a tiny cloud and “…”, `sit` for “no.”, or `?` for “?”. `uemaim` (or `uamuim`, the actual reverse of `miumau`) briefly mirrors em. Hover with a mouse for four seconds without petting for “yes?”. Returning after the tab has been hidden for at least five minutes gets “oh. you.” Temporary visual effects reset after 2.4 seconds without changing layout.

## Not-found page

`404.html` shares the home page’s styles and avatars, works without JavaScript, and is excluded from search indexing. Netlify automatically serves this root-level file for missing paths with HTTP status 404; no redirect rule is needed. On other hosts, configure the error document to `/404.html` while preserving the 404 status. Python’s simple preview server does not route missing paths to custom error pages; open `/404.html` to preview the design.
