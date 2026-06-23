# sabrebluedobie.github.io

Personal website and GitHub Pages host for **Melanie Brown** — web designer and developer based in Kentucky, operating as [Bluedobie Developing](https://www.bluedobiedev.com).

**Live site:** [www.bluedobiedev.com](https://www.bluedobiedev.com)

## What's Here

### Bluedobie Developing Website
The main professional site for Bluedobie Developing. Showcases web design and development services, portfolio work, and contact information.

### Bluedobie Dialogues Blog
A collection of articles on web design, development tips, and digital strategy. Posts live in `_posts/` and cover topics like responsive design, SEO, micro-interactions, and building an effective online presence.

### Kid Games
`KidGames/August/` hosts a browser-based game built for and hosted for Melanie's grandson. It lives here so he can access it anytime at a stable URL.

### Project Pages
- `DobieCoreSuite.html` — landing/info page for the DobieCore app suite
- `SabreBeats_visual.html` — visual page for the SabreBeats project

## Stack

- [Jekyll](https://jekyllrb.com/) — static site generator
- [GitHub Pages](https://pages.github.com/) — hosting and deployment
- Custom domain via CNAME (`www.bluedobiedev.com`)
- Vanilla HTML, CSS, and JavaScript for custom pages and games

## Structure

```
sabrebluedobie.github.io/
├── _posts/           # Bluedobie Dialogues blog posts
├── _layouts/         # Jekyll page layouts
├── _includes/        # Reusable HTML partials (nav, footer, etc.)
├── KidGames/
│   └── August/       # Browser game hosted for grandson
├── DobieCoreSuite.html
├── SabreBeats_visual.html
├── _config.yml       # Jekyll config
└── CNAME             # Custom domain: www.bluedobiedev.com
```

## Local Development

```bash
bundle install
bundle exec jekyll serve
```

Site will be available at `http://localhost:4000`.

## Author

**Melanie Brown** — [Bluedobie Developing](https://www.bluedobiedev.com)  
GitHub: [@sabrebluedobie](https://github.com/sabrebluedobie)
