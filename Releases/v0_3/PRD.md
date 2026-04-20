# Mii Designer — Product Requirements (Phase 1)

## Context

This is **phase 1 of 4** of a Tomodachi Life-inspired browser game, built as a hobby project with a 13-year-old co-designer. Later phases will add a simulation loop, dialogue generation, concert hall, dream sequences, etc. **Do not build those now.** Build only what this document describes.

This phase delivers one thing: a web-based Mii designer where the user builds chibi characters using a fully procedural SVG rendering system. Designed Miis are saved to localStorage and can be exported as JSON. Phase 2 will consume that JSON.

## Users

- Primary: a 13-year-old designing characters
- Secondary: her father, loading her JSON into the phase 2 game simulation

Design for the 13-year-old. She should be able to open the page and make her first recognizable Mii within 2 minutes with zero documentation.

## Success criteria

The designer is done when all of the following are true:

- [ ] Opens by double-clicking `apps/mii-designer/index.html` (no dev server required)
- [ ] Live SVG preview updates in real time as controls change (no "apply" button needed)
- [ ] User can customize: name, skin tone, body shape, outfit style, outfit color, accessory
- [ ] User can customize face: hair style, hair color, eye shape, eye color, mouth shape, eyebrows, blush, freckles
- [ ] 🎲 Randomize Face button generates a random face with one click
- [ ] Three personality sliders are present: Introvert–Extrovert, Calm–Intense, Serious–Silly (each 0–100, default 50)
- [ ] Save button persists the Mii to localStorage with a unique ID
- [ ] Gallery view shows all saved Miis as a grid; clicking one loads it for editing
- [ ] Export button downloads a JSON file matching the Mii schema (see `.agents/skills/mii-schema.md`)
- [ ] Import button accepts a JSON file, validates it, and loads it (with v1→v2 auto-migration)
- [ ] User can design and save at least 10 distinct Miis without the UI breaking or feeling slow
- [ ] Works in the latest Chrome, Firefox, and Safari without console errors
- [ ] Mobile-friendly at 768px+ width (sliders and buttons are touch-sized, no horizontal scroll)
- [ ] All Miis share a visually consistent art style: flat colors, clean rounded shapes, no shading

## Out of scope (do not build)

- Any simulation, relationships, happiness, or "apartment" logic (phase 2)
- Dialogue generation (phase 2)
- Voice synthesis (phase 2)
- Multi-angle or animated sprites — faces are static front-facing only
- User accounts, cloud sync, multi-device sync
- AI-generated faces (dropped in v0.3 — may return in phase 3 for dream sequences)
- Photo-to-Mii (selfie input) — this is a later-phase idea
- Any build tooling, bundler, or TypeScript (keep it ES2022 vanilla JS modules)

## Feature detail

### The Mii composition model

A Mii is rendered as **procedural SVG**, stacked bottom to top:

1. **Body** — chibi torso + arms, colored by outfit
2. **Head** — skin-toned ellipse
3. **Face features** — blush → freckles → eyebrows → eyes → mouth → hair (hair last so it overlaps the forehead)
4. **Accessory** — glasses, hat, bow, or headphones layered on top

All layers are pure SVG. No image generation, no external API calls. Iteration is instant.

### Controls (left panel)

Group related controls under collapsible sections. Use native HTML controls — no component libraries.

**Identity**
- Name (text, max 20 chars, required, no emoji in stored name)
- 3 personality sliders (Introvert–Extrovert, Calm–Intense, Serious–Silly)

**Body**
- Skin tone (6 preset swatches: pale, light, tan, olive, brown, deep)
- Body shape (3 presets: narrow, regular, stocky)

**Outfit**
- Style (6 presets: t-shirt, hoodie, dress, striped top, jacket, overalls)
- Primary color (color picker)
- Secondary color (only shown for two-color styles)

**Accessory**
- None / Glasses / Hat / Bow / Headphones (small SVG buttons)

**Face**
- 🎲 **Randomize Face** button — the most important button in the app. Picks random values for all face parameters. Make it prominent.
- Hair style: row of small SVG thumbnail buttons (8 styles)
- Hair color: color picker
- Eye shape: row of small SVG thumbnail buttons (6 shapes)
- Eye color: color picker
- Mouth shape: row of small SVG thumbnail buttons (6 shapes)
- Eyebrows: dropdown (none, arched, flat, angry)
- Blush: toggle checkbox
- Freckles: toggle checkbox

### Saving, loading, exporting

- **Save**: writes the current Mii to localStorage under `miis:{uuid}`
- **Gallery**: reads all `miis:*` keys and shows a grid of thumbnails. Clicking loads that Mii. Each tile has a small "×" delete button.
- **Export all**: downloads `miis.json` with all Mii records
- **Export one**: downloads `{name}.mii.json` for the current Mii
- **Import**: file picker accepts `.json`; validates against schema; auto-migrates v1→v2; merges into localStorage

### Layout

Two-column desktop layout: controls (scrollable) on left, preview (sticky) on right with action buttons and gallery below. Below 768px: single-column stacked.

### Default state

On first load, show a pre-made "Example" Mii with Luna's defaults (bob hair, round eyes, smile, arched eyebrows, blush on).

## Technical constraints

- **Stack**: vanilla HTML, CSS, ES2022 JS. No bundler, no framework.
- **File layout**: must match the repo structure defined in the kickoff prompt
- **No global variables**: all state in a `state` object managed by `main.js`
- **No inline event handlers** — attach all listeners in JS
- **Performance**: re-render must complete in under 16ms on a modest laptop
- **Accessibility**: all controls have labels, all buttons have aria-labels, keyboard-navigable
- **Bundling**: `app.js` is a generated IIFE bundle from `main.js` + `lib/*.js` + `shared/schema/miiSchema.js` for `file://` support. `main.js` and `lib/*.js` are the canonical source.

## Anti-goals

- Do not introduce React, Vue, Svelte, or any frontend framework
- Do not add any external API calls (no Gemini, no external services)
- Do not invent new schema fields without flagging them first
- Do not animate anything beyond simple CSS hover states
