# Bluedobie – Shared Nav & Footer Bundle (Jekyll)

This bundle gives you:
- `_includes/nav.html` (canonical nav that mirrors CaptionCraft)
- `_includes/footer.html` (shared footer with Liquid dynamic year)
- `_includes/footer-scripts.html` (global scripts + per-page hook)
- `_layouts/default-shared.html` (safe new layout you can switch pages to)

## Quick Apply (2 minutes)

1) **Download & unzip** into your repo root so the folders match:
```
_includes/
_layouts/
```
If prompted, **replace** existing `_includes/nav.html` and `_includes/footer.html`.

2) **Pick a test page** (e.g., `services.html`) and add this front matter at the very top:
```yaml
---
layout: default-shared
title: Services
permalink: /services.html
---
```

3) **Delete** any duplicated nav/footer/old dropdown scripts inside that page.  
   The layout will inject nav + footer + `/js/mobile-nav.js` automatically.

4) Run locally or push to GH Pages and spot check:
- Desktop & mobile nav opens/closes correctly
- Footer shows © current year
- Products menu shows **DobieCore Captions**
- Dialogues → `/blog-home.html`

5) Once happy, repeat step 2 for the other pages:
```
FAQ.html
business-links.html
blog-home.html
our-portfolio.html
meet-sabre.html
contact.html
privacy.html
sales.html
thank-you.html
```

## Per-page scripts (optional)
If a page needs extra scripts, add in the front matter:
```yaml
---
layout: default-shared
title: Example
extra_scripts: |
  <script src="/captioncraft/captioncraft.js"></script>
---
```

## Roll back easily
If anything feels weird, switch the page back to its previous layout by changing the `layout:` value. No files are deleted by this bundle.
