# oddicons

A free, open-source pack of AI-generated icons. Browse, copy, download.

**Live at [jasperdevs.github.io/oddicons](https://jasperdevs.github.io/oddicons/)**

## Stack

- Next.js 16 (static export, App Router)
- React 19, TypeScript, Tailwind v4
- sharp for thumbnail generation
- Deploys to GitHub Pages

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000/oddicons/

## Add an icon

1. Drop the PNG into `public/icons/`
2. Append an entry to `src/data/icons.json`:
   ```json
   { "name": "Foo", "file": "foo.png", "category": "Interface" }
   ```
3. Run `npm run thumbs` to generate the `thumbs/` and `mini/` WebP variants
4. Commit and push

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production static export into `out/`
- `npm run thumbs` — regenerate icon thumbs and minis from `public/icons/*.png`
- `npm run trim` — scan and trim stray white pixels around icon edges

## License

Icons and source are released under the terms in `LICENSE`.
