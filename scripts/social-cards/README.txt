Bluedobie social cards

_data/social_cards.json is the single source for social titles, descriptions,
image text, alt text, paths and dimensions. Each participating page sets only
social_card in its front matter. Existing title/description/image/og_image fields
continue to feed search metadata, article bodies and structured data unchanged.

Render from the repository root:
  python3 scripts/social-cards/render.py
Render selected keys only:
  python3 scripts/social-cards/render.py home digital-foundation too-good-maids
Dependencies: Pillow, fontTools, Brotli. The renderer reads the repository's
Instrument Serif and Inter fonts and existing local brand/client images.
No browser, image-generation service or network is used by the renderer.

Build normally with bundle exec jekyll build, then validate:
  python3 scripts/social-cards/verify.py _site
An optional second argument supplies an unchanged baseline build. It verifies
search titles/descriptions, canonical URLs, robots, OG type/URL, JSON-LD and body
preservation, allowing only the existing build timestamps to vary.

The shared head falls back to the default branded card when neither a mapped
card nor a legacy page image exists. Unmapped pages retain their existing titles
and descriptions. Legacy image overrides remain supported; specify
og_image_width, og_image_height, og_image_type and og_image_alt for those when known.
Keep new PNGs at 1200 by 630; never reuse these dimensions for unknown legacy art.

The scripts directory is excluded from the published Jekyll output. Review
contact sheets, comparison builds and copy mappings are outside the repository.
