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
