# Public journey reliability review — 8 October 2026

Frontend release approved after local review. Repository: `sabrebluedobie/sabrebluedobie.github.io`. Branch: `codex/public-journey-reliability`, based on main `9b2b22d3a9201e45a875d1c86e640bf1b05a3644`. Approval covers push, pull request, merge and production deployment of these frontend fixes; backend and credential changes remain excluded. The earlier Sabre feed change (PR 11) is already merged and live; it is unchanged here.

## Prioritized findings and bounded fixes

| Priority | Finding | Local result |
| --- | --- | --- |
| High | Browser validation could stop contact submission before revealing an invalid field in a hidden step. Optional invalid URLs were skipped by step validation. | Explicit validation reveals/focuses the failing field; validates optional populated fields and whitespace-only required values. Required website label follows the selected audit service. |
| High | Contact completion lacked an in-flight guard/timeout; failures encouraged ambiguous retries. | One in-flight request, busy/disabled controls, 15-second timeout, focused visible status, preserved inputs on failure and wording that warns the request may already have arrived. No automatic retries. |
| High | Guide request treated HTTP errors as success and hid the failure message with the form. | Checks response status; visible accepted/unconfirmed result, bounded timeout and repeated-submit guard. PDF fallback remains available and receives focus. |
| Medium | Closed mobile navigation remained keyboard reachable; disclosure links used ARIA menu roles without menu keyboard behavior. | Closed navigation/disclosures are inert; conventional buttons/links with expanded state, Tab/Enter/Escape and focus return. Skip link, main landmarks, current-page cues, strong focus. JavaScript-unavailable navigation remains ordinary visible links. |
| Medium | Logo Sprint CTAs used unrecognized service values. | Basic/Pro/general links select Logo Design; tier carries into an editable inquiry summary. |
| Medium | Forms could appear usable without their JavaScript; contact embed caused an extra viewport-sized mobile gap. | Initially disabled fields with visible email/phone fallback; enable only after initialization. Retain direct booking link and remove the excessive gap. |
| Medium | Open Graph type rendered layout names; sitemap advertised duplicate noncanonical and noindex URLs. | Valid website/article type, escaped metadata attributes, canonical sitemap entries and exclusions for existing noindex pages. |
| Low | Service-area details required searching About/FAQ. | Existing Princeton/Western Kentucky/remote-service facts appear beside the services introduction, with a readable FAQ link. |

## Important remaining work

The existing public contact JavaScript contains a webhook credential. Treat it as exposed: server-side transport/protection and credential rotation need a separately authorized backend/security task. This review does not reproduce the credential or endpoint, change credentials/settings, or test that endpoint. The guide and inquiry also use different existing request headers; real backend acceptance and delivery are unverified. Client guards cannot guarantee exactly-once delivery across refreshes, tabs, or uncertain server responses. Backend validation, abuse prevention and idempotency remain outside this public-site pass.

## Evidence and checks

Evidence folder: `../evidence/public-journeys/` (outside the deployable repository).

- Production Jekyll build passed (`build.log`). JavaScript syntax checks and `git diff --check` passed. No TypeScript or configured standalone lint suite exists for this static Jekyll project.
- All 23 Node tests passed: 13 existing Sabre regression tests and 10 public-journey tests (`tests.log`). New tests use jsdom with mocked requests, including HTTP failure, offline, timeout, duplicate submission, hidden/optional invalid fields, required whitespace, deep-link service selection, success/failure focus, no-JavaScript fallback, guide PDF fallback, responsive navigation state, landmarks, metadata/schema parsing and canonical sitemap resolution.
- Chrome Melanie local keyboard QA: required-field error focus; Enter through each inquiry step; heading focus after Next; one mocked request; focused success and failure results; failure keeps typed data. Guide HTTP failure leaves an honest message and focused PDF link. Mobile drawer Tab loop, Enter disclosure, Escape closure/focus return; desktop skip link focuses main.
- Responsive QA: home, services, contact, free audit, AI review and Logo Sprint have no horizontal document overflow at 320 px (`narrow-widths.json`). Contact and guide forms visually inspected at 375 px. No-JavaScript contact at 320 px exposes ordinary navigation and contact alternatives and disables the form. Desktop services inspected at 1333 px.
- Read-only production checks: 11 public routes/resources returned HTTP 200 (`live-routes.json`). Robots and both sitemaps saved. No access challenge occurred in those checks; this is not a guarantee for every crawler/IP. Existing robots/training preferences and Cloudflare settings were not modified.
- Screenshots: `contact-success.jpg`, `contact-failure.jpg`, `guide-failure.jpg`, `mobile-navigation.jpg`, `nojs-navigation.jpg`, `services-desktop.jpg`.
- Live booking, email delivery, third-party widget internals, authenticated Sentrya/DobieCore, other browsers, and assistive-technology sessions were not tested. This is not screen-reader certification.

## Safe local preview

`http://127.0.0.1:8769/services` and `/contact` are served by `../evidence/public-journeys/preview-server.py`. All form fetches are mocked; a visible control selects success, HTTP error, offline or timeout. CSP blocks outbound connections, external frames, and actual form submissions. `?qa-nojs=1` disables page scripts. Only synthetic `.invalid` email test data was used; no real inquiries or bookings were sent. External booking embeds are deliberately blocked in this preview; their ordinary destination links remain present.

Build:

```sh
BUNDLE_PATH=vendor/bundle BUNDLE_USER_HOME=/tmp/sabre-bundler JEKYLL_ENV=production /usr/local/opt/ruby/bin/bundle exec jekyll build
NODE_PATH=/tmp/arlo-a11y-tests/node_modules node --test tests/*.test.cjs
node --check assets/js/formjs.js
node --check js/mobile-nav.js
git diff --check
```

The jsdom path is an existing local test dependency outside the repository; install jsdom in a separate test environment if reproducing elsewhere. To restart the safe preview, run `python3 ../evidence/public-journeys/preview-server.py` from this checkout. Do not use real personal data in local preview URLs or fields.

Review evidence for the approved frontend release is recorded above. No redesign, new service claims, AI discovery files, API/MCP/WebMCP, authenticated-app features, or hosting/security settings were added.
