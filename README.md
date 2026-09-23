# jeme.app

A small, static personal website. Plain HTML, CSS, and JavaScript; no build step or runtime dependencies.

## Preview

Run `python3 -m http.server 4173` from this directory and open <http://localhost:4173>.

## Deploy

Serve this directory at the root of `https://jeme.app` with HTTPS. Keep `.well-known/discord` available for domain verification. Serve `site.webmanifest` as `application/manifest+json` and `sw.js` as JavaScript (standard static hosts do this automatically).

The site includes automatic light/dark themes, a web app manifest, app icons, and a service worker that caches the page for offline visits. External profile links still need an internet connection. Installation is offered by supporting browsers; there is no custom install prompt.

Use revalidation (`Cache-Control: no-cache`) for HTML and `sw.js`. When changing cached site files, increment `CACHE` in `sw.js` so a new worker refreshes the offline shell. The updated worker activates after existing site tabs close. Avoid immutable caching for the unversioned CSS, JS, and image filenames.

## Assets

The supplied `assets/miumau-*.png` files are the avatar originals. The page uses 256px WebP derivatives. PNG app icons use the blue avatar on the site's light blue background; the maskable icon adds safe padding. `assets/social.png` is the 1200 × 630 social preview. Update the canonical, social URLs, sitemap, and manifest if the domain changes.

## Easter eggs

Click the avatar (or focus it and press Enter/Space) to pet em; every third pet shows “mrrp.” Em gets a small “z” after 60 seconds without activity and wakes on interaction. Blue is the default on ordinary days. Type `miumau` outside a text field to toggle between blue and the neutral/seasonal palette for the current visit. Type `jeme` for “that’s me.” The developer console has a small greeting. All effects are silent, respect reduced motion, and work offline after the first visit.

The Discord row copies `thejeme` through the browser clipboard API. If clipboard access fails, or JavaScript is unavailable, it provides a selectable username. No third-party profile or clipboard service is used.

More discoveries: `pspsps` wakes em with “?”, `hello` gets “hi.”, and `bye` gets “bye.” Between midnight and 5 a.m. in the visitor’s local time, each pet has a 25% chance of getting “still awake?”. Double-click the name’s dot (or focus it and press Enter/Space) for a brief paw print. Printing reveals “you put the cat on paper.” beneath em.

Type `fetch` to let em borrow the dot (“mine.”), `purr` for “prrr.”, `rain` for a tiny cloud and “…”, `sit` for “no.”, or `?` for “?”. `uemaim` (or `uamuim`, the actual reverse of `miumau`) briefly mirrors em. Hover with a mouse for four seconds without petting for “yes?”. Returning after the tab has been hidden for at least five minutes gets “oh. you.” Temporary visual effects reset after 2.4 seconds without changing layout.

## Not-found page

`404.html` shares the home page’s styles and avatars, works without JavaScript, and is excluded from search indexing. Netlify automatically serves this root-level file for missing paths with HTTP status 404; no redirect rule is needed. On other hosts, configure the error document to `/404.html` while preserving the 404 status. Python’s simple preview server does not route missing paths to custom error pages; open `/404.html` to preview the design.

## Seasonal discoveries

Seasonal colors, an ornament beside em, and a small date label follow the visitor’s local calendar. The normal layout stays unchanged. Every third pet uses a seasonal reply; nighttime and other secret replies still work.

- Christmas: December 24–26 (Christmas Eve on the 24th).
- Birthday: March 17.
- Easter: Good Friday through Easter Monday, using Gregorian Easter calculated each year with the US Naval Observatory’s published algorithm: <https://aa.usno.navy.mil/faq/easter>.
- Halloween: October 31.
- New Year: January 1.

Preview with `/?season=christmas`, `/?season=birthday`, `/?season=easter`, `/?season=halloween`, or `/?season=newyear`. Use `/?season=none` for the ordinary design. Preview overrides last only for that URL. Both color schemes and the 404 page support the seasonal colors. Blue mode temporarily takes priority, then restores the seasonal palette. Dates refresh at local midnight and when returning to the tab. The calendar runs locally, works offline, and makes no external requests.

On the homepage, the birthday ornament is a candle you can blow out (“wish made.”), and the Christmas ornament opens into a fish (“for me?”). During Easter, find the patterned egg hidden in the name’s dot (“found it.”). All three work with pointer or keyboard activation. Discoveries persist for the current browser tab’s session, separately for each year; if storage is unavailable, they last until reload. The 404 page keeps decorative ornaments.

Type `help` to open a compact command guide or `seasons` to open the seasonal picker. Native dialogs support keyboard focus, a close button, and Escape. Choosing a season updates the preview URL without reloading. “Today’s theme” removes the override and follows the local date again; “Everyday” explicitly turns seasonal styling off. Selecting a season restores its neutral avatar and seasonal colors. “Today’s theme” and “Everyday” restore blue on ordinary days.
