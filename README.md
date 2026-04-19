# oddicons

A free, open-source pack of AI-themed icons. Plain static site — drop SVGs in `icons/`, add a line to `icons.json`, commit, done.

Live at **https://jasperdevs.github.io/oddicons/**

## Add an icon

1. Drop the SVG into `icons/`
2. Append an entry to `icons.json`:
   ```json
   { "name": "Foo", "file": "foo.svg", "category": "AI", "tags": ["bar"], "url": "https://example.com" }
   ```
3. `git push` — GitHub Pages serves it instantly.
