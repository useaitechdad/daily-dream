# Mii Designer — Product Requirements (Phase 1)

## Context

This is **phase 1 of 4** of a Tomodachi Life-inspired browser game, built as a hobby project with a 13-year-old co-designer. Later phases will add a simulation loop, dialogue generation, concert hall, dream sequences, etc. **Do not build those now.** Build only what this document describes.

This phase delivers one thing: a web-based Mii designer where the user builds chibi characters by combining an SVG body/outfit with an AI-generated face portrait (the "hybrid" approach). Designed Miis are saved to localStorage and can be exported as JSON. Phase 2 will consume that JSON.

## Users

- Primary: a 13-year-old designing characters
- Secondary: her father, loading her JSON into the phase 2 game simulation

Design for the 13-year-old. She should be able to open the page and make her first recognizable Mii within 2 minutes with zero documentation.

## Success criteria

The designer is done when all of the following are true:

- [ ] Opens by double-clicking `apps/mii-designer/index.html` (no dev server required for basic operation, though a dev server may be used for API proxying — see Technical constraints)
- [ ] Live SVG preview updates in real time as controls change (no "apply" button needed)
- [ ] User can customize: name, skin tone, body shape, outfit style, outfit color, accessory
- [ ] User can generate an AI face via "Generate face" button, which calls Nano Banana 2
- [ ] Generated face composites cleanly onto the SVG body (face fits the head region, does not overflow)
- [ ] Three personality sliders are present: Introvert–Extrovert, Calm–Intense, Serious–Silly (each 0–100, default 50)
- [ ] Save button persists the Mii to localStorage with a unique ID
- [ ] Gallery view shows all saved Miis as a grid; clicking one loads it for editing
- [ ] Export button downloads a JSON file matching the Mii schema (see `.agents/skills/mii-schema.md`)
- [ ] Import button accepts a JSON file and loads it into the editor
- [ ] User can design and save at least 10 distinct Miis without the UI breaking or feeling slow
- [ ] Works in the latest Chrome, Firefox, and Safari without console errors
- [ ] Mobile-friendly at 768px+ width (sliders and buttons are touch-sized, no horizontal scroll)

## Out of scope (do not build)

- Any simulation, relationships, happiness, or "apartment" logic (phase 2)
- Dialogue generation (phase 2)
- Voice synthesis (phase 2)
- Multi-angle or animated sprites — faces are static front-facing portraits only
- User accounts, cloud sync, multi-device sync
- Image editing of generated faces beyond regeneration
- Photo-to-Mii (selfie input) — this is a later-phase idea
- Any build tooling, bundler, or TypeScript (keep it ES2022 vanilla JS modules)

## Feature detail

### The Mii composition model

A Mii is rendered as **three visual layers** stacked bottom to top:

1. **Body** (SVG, procedurally drawn) — a chibi torso + arms, sized about 1/3 the height of the sprite, colored by the selected outfit.
2. **Head** (SVG circle/ellipse, procedurally drawn) — a rounded head shape in the selected skin tone, sized about 2/3 the height, sitting on top of the body.
3. **Face** (AI-generated PNG, composited into the head region) — only the face features (eyes, nose, mouth, hair), masked/positioned so it fits inside the head SVG with a small margin.

The face is the only layer that involves the image API. Body and head are pure SVG — no image generation for those. This keeps iteration fast: tweaking skin tone or outfit is instant; only pressing "Generate face" costs an API call.

### Controls (left panel)

Group related controls under collapsible sections. Use native HTML controls (`<input type="range">`, `<input type="color">`, `<select>`) — no component libraries.

**Identity**
- Name (text, max 20 chars, required, no emoji in stored name)
- 3 personality sliders (Introvert–Extrovert, Calm–Intense, Serious–Silly)

**Body**
- Skin tone (5–6 preset swatches: pale, light, tan, olive, brown, deep — pick from a fixed palette so colors stay harmonious)
- Body shape (3 presets: narrow, regular, stocky — affects torso width only)

**Outfit**
- Style (4–6 presets: t-shirt, hoodie, dress, striped top, jacket, overalls)
- Primary color (color picker, defaults to a pleasant mid-saturation)
- Secondary color (only shown if the selected style uses one)

**Accessory**
- None / Glasses / Hat / Bow / Headphones (at least 4 options, each a small SVG layered on or above the head)

**Face**
- Big "Generate face" button
- Optional free-text "Vibe" prompt (e.g. "grumpy wizard with purple hair") that gets folded into the Nano Banana 2 prompt
- Last generated face shown as a small preview thumbnail
- "Regenerate" re-rolls with the same prompt; "New vibe" clears the field

### Face generation

When the user clicks "Generate face", the app:

1. Reads current state: skin tone, the three personality slider values, and the free-text Vibe.
2. Converts the slider values into descriptive words using the mapping in `.agents/skills/mii-schema.md` (e.g. Introvert–Extrovert slider at 85 → "outgoing, social"). This keeps the prompt stable and avoids the LLM inventing traits.
3. Builds a prompt following the template in `lib/faceGenerator.js` (agent writes this file) that specifies: flat chibi anime style, front-facing portrait, transparent or solid pastel background, no text in image, face only (no body), and the composed descriptors.
4. Calls `gemini-3.1-flash-image-preview` with aspect ratio `1:1` at 1K resolution.
5. Shows a loading state on the button (disabled, spinner) during the call.
6. On success, base64-decodes the result, stores it as a data URL in Mii state, and updates the preview.
7. On failure, shows an error toast and keeps the previous face (never wipes state).

Cache generated faces: same prompt → same face. Store the prompt hash as a key in localStorage alongside the image data URL. Re-clicking "Generate face" with an unchanged prompt should use the cache, not re-spend an API call.

### Saving, loading, exporting

- **Save**: writes the current Mii to localStorage under `miis:{uuid}`. If the current Mii was loaded from an existing record, it updates that record. Otherwise it creates a new UUID.
- **Gallery**: reads all `miis:*` keys from localStorage and shows a 4-column grid of thumbnails (name + composited preview). Clicking loads that Mii into the editor. Each gallery tile has a small "×" delete button.
- **Export all**: downloads a single `miis.json` file containing an array of all Mii records.
- **Export one**: downloads `{mii.name}.mii.json` for the currently loaded Mii.
- **Import**: file picker accepts `.json`; validates against the schema; merges into localStorage (skips duplicates by ID, or adds with new ID if the user confirms).

### Layout

Two-column desktop layout:

```
┌───────────────────────┬────────────────────────────┐
│ Controls (scrollable) │ Preview (sticky)           │
│                       │                            │
│ [Identity]            │  ┌──────────────┐          │
│ [Body]                │  │   Big Mii    │          │
│ [Outfit]              │  │   preview    │          │
│ [Accessory]           │  └──────────────┘          │
│ [Face]                │                            │
│                       │  [Save] [Export] [New]     │
│                       │                            │
│                       │  Gallery (horizontal scroll)│
│                       │  [thumb] [thumb] [thumb]   │
└───────────────────────┴────────────────────────────┘
```

Below 768px: controls on top, preview stacks below, gallery at the bottom.

### Default state

On first load (no saved Miis), show a pre-made example Mii in the editor so the user has something to play with. Name it "Example". This Mii must be one of the saved-state test fixtures in `tests/fixtures.json` so we always know what it looks like.

## Technical constraints

- **Stack**: vanilla HTML, CSS, ES2022 JS with ES modules (`<script type="module">`). No bundler, no framework. If a feature genuinely requires a library, propose it first in an artifact before adding.
- **File layout**: must match the repo structure defined in the kickoff prompt. Do not reorganize.
- **No global variables**: all state lives in a `state` object managed by `main.js`. Use a simple pub/sub or event-emitter pattern for re-renders.
- **No inline event handlers in HTML** (no `onclick="..."`). Attach all listeners in JS.
- **Secrets**: the Gemini API key must NEVER be committed. Support two modes:
  1. **Dev mode**: a local `.env` file read by a tiny Node proxy server (in `apps/mii-designer/dev-server.js`) that injects the key server-side. The browser never sees it.
  2. **Fallback mode**: if no proxy is running, prompt the user for their API key on first "Generate face" click, store it only in `sessionStorage` (never localStorage), and call the API directly. Show a clear warning that this is dev-only.
- **Performance**: re-render of the SVG preview must complete in under 16ms on a modest laptop. No re-rendering the face data URL on every slider tick — only re-render SVG layers.
- **Accessibility**: all controls have labels, all buttons have discernible text or aria-label, the page is navigable by keyboard.

## What an "artifact-worthy" demo looks like

When the agent reports back, the proof-of-done artifact should include:

1. Screenshot of the designer with the "Example" Mii loaded
2. Screenshot of the designer after generating a face (before and after)
3. Screenshot of the gallery with 3+ saved Miis
4. A saved `example.mii.json` file that conforms to the schema
5. A short walkthrough (plain text or screen recording) showing: name a Mii → adjust sliders → pick outfit → generate face → save → create a second Mii → open gallery → export

## Anti-goals (explicit reminders)

- Do not introduce React, Vue, Svelte, or any frontend framework.
- Do not build a user-accounts or backend system. The Node proxy is for API key hiding only — it has no database and no business logic.
- Do not invent new fields on the Mii schema. If a field is missing that you think is essential, flag it in an artifact and ask — do not add silently.
- Do not spend more than 2 API calls of your own testing during development. Use mock/stub face images in automated tests.
- Do not animate anything beyond the loading spinner and simple CSS hover states. The real game will have animation; the designer does not need it.
