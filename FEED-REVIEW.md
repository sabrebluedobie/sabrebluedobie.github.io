# Sabre social feed — local review

Prepared and reviewed locally October 8, 2026. Melanie subsequently approved merging and making this replacement live. SociableKIT settings remain unchanged.

## Scope and provenance

Repository: `sabrebluedobie/sabrebluedobie.github.io`. Isolated checkout on
`codex/sabre-native-feed-review`, based on `8e4e943` (PR #10 accessibility-audit merge).
The older checkout in `~/Documents/sabrebluedobie.github.io` was only inspected;
its local changes were not copied, reset, or edited. No AGENTS.md or .agents skills
were present in the isolated repository. README and build guidance were read.

Adapted the native Jekyll feed from `Petfluencers/Arlo-Dobermann`, whose local
history confirms merged PR #3 at `d1b12b1`. Sabre's live page was verified to use
SociableKIT Instagram Reels widget `25661024`. Read-only inspection in Chrome's
Melanie profile confirmed the widget name, domain, account `sabrethebluedobie`, and
its **JSON Data** link: `https://data.accentapi.com/feed/25661024.json`.
This is the provider-exposed public feed, not a guessed endpoint or a secret.
The snapshot retains only public post identifiers, links, captions, dates, and
thumbnail URLs. Captions and dates are copied from the provider without rewriting.
Provider ordering, including pinned posts, is retained; dates are not sorted.

## Changes

- Replace only the social-feed iframe and its obsolete Instagram embed script.
- Preserve the iframe's accessible title, "Sabre on Instagram", as the native
  section heading/name. Existing YouTube iframe and direct social links remain.
- Render twelve saved posts through Jekyll, with full visible captions, dates,
  contextual Instagram link names, native keyboard activation, and strong focus.
- Use three, two, or one columns depending on viewport, matching navy/cream tokens.
- Use empty thumbnail alternatives deliberately: these are supplementary previews;
  the adjacent caption/link identifies each post. No invented image descriptions.
- Fetch public JSON once per page visit, omitting credentials, with an 8-second
  timeout. Validate records and destination/image origins, bound input, reject
  impossible dates, render text safely, and deduplicate records.
- Cache the last valid response when storage permits. If updates fail, keep the
  browser snapshot or the committed October 8 snapshot. Broken thumbnails are
  removed while captions and destination links remain.
- Coalesce overlapping refresh requests and avoid replacing feed content while
  focus is inside it. Successful deferred data is cached for the next visit.
- Exclude tests and this review document from generated site output.

## Validation passed

- Locked dependencies installed locally, with Gemfile and lockfile unchanged.
- Production Jekyll build: `JEKYLL_ENV=production bundle exec jekyll build`.
- 13 Node/jsdom tests: normalization, unsafe URLs, malformed/missing fields,
  empty feeds, duplicates, impossible dates, network/HTTP/JSON/timeout failures,
  corrupt cache, blocked storage, quota failures, missing/broken thumbnails,
  overlapping and subsequent refreshes, focus before/during a pending response,
  and incomplete optional feed markup.
- `node --check js/sabre-reels.js` and `git diff --check`.
- Generated HTML contains twelve complete static cards and no provider iframe;
  test files are absent from generated production output.
- Chrome Melanie profile: live feed successful with loaded thumbnails; Tab
  reached a named reel with visible focus; Enter navigated to its actual Instagram
  post. No local modal is involved.
- Chrome at 375px and 320px: one-column feed, no overflowing cards, document width
  equal to viewport width. Temporary viewport override reset afterward.
- Separate local QA fixture in Chrome: network failure + blocked storage and
  empty feed each retained twelve cards/links. All twelve forced-failure images
  were removed; all twelve captions and links remained. Delayed response retained
  the same focused link and showed the deferred-update status.

No configured lint or TypeScript task exists for this plain-JavaScript Jekyll
site; syntax and whitespace checks are the applicable checks. No screen-reader
certification is claimed. Instagram playback accessibility, captions/audio
interpretation, other browser engines, and long-term provider availability were
not tested. Provider thumbnails may expire, and automatic updates depend on its
public feed remaining available; the saved text and links remain useful.

## Repeat locally

On this Mac, Ruby is available through `/usr/local/opt/ruby/bin`:

```sh
BUNDLE_PATH=vendor/bundle BUNDLE_USER_HOME=/tmp/sabre-bundler JEKYLL_ENV=production /usr/local/opt/ruby/bin/bundle exec jekyll build
NODE_PATH=/tmp/arlo-a11y-tests/node_modules node --test tests/*.test.cjs
node --check js/sabre-reels.js
git diff --check
python3 -m http.server 8768 --bind 127.0.0.1 --directory _site
```

The test-only jsdom dependency is external to this repository. On a fresh
machine install it in a temporary test directory and set NODE_PATH accordingly.
Preview: `http://127.0.0.1:8768/meet-sabre.html#sabre-reels-heading`.
Screenshots, test/build logs, and the local-only failure fixture are in the sibling
`../evidence/` directory. The QA HTML temporarily copied to `_site/__feed-qa.html` was removed after
testing; the harness remains in the evidence directory for reproduction.

To refresh the committed snapshot later, retrieve the verified public feed,
validate using `normalize`, retain the first twelve valid records, and map
`code/link/pic_text_raw/image_url/date_time_posted` to
`id/url/caption/image/date`. Update written date labels and saved_at/saved_label
consistently. This maintenance is separate from automatic per-visit updates.

Melanie approved publication on October 8, 2026: "looks good please merge and make live".
GitHub Pages publishes from the repository's main branch.
