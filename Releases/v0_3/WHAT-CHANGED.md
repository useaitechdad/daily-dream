# v0.3 — SVG Face System

## Why

User testing with our target user (13-year-old) revealed that AI-generated faces pasted onto SVG bodies look like "a head on a doll" — the rendering style, line weight, and level of photographic detail simply don't match the flat-color chibi body. When she loaded a saved Mii and the face was missing (no cached image), the Mii looked broken. For a game that will eventually display 6–12 characters side by side, visual consistency matters more than individual-face expressiveness. v0.3 replaces the AI face with a procedural SVG face renderer that uses the exact same flat-color, rounded-shape aesthetic as the body — so every Mii looks like it belongs to the same world, whether it's the first one she made or the twentieth.

## Removed

| What | Why |
|------|-----|
| `lib/faceGenerator.js` | Built AI prompts from Mii state — no longer needed |
| `lib/apiClient.js` | Sent prompts to the Gemini proxy and cached responses — no longer needed |
| `dev-server.js` | Node.js proxy server for the Gemini API — no external API calls |
| `package.json` / `package-lock.json` / `node_modules/` | Only existed for the proxy. Zero dependencies now. |
| Face generation UI | "Generate Face" button, vibe text input, proxy warning — removed |
| "Nano Banana 2" / Gemini references | All model ID strings and API keys removed |
| `PERSONALITY_DESCRIPTORS` in `palette.js` | Only used for AI prompt building |
| Top-level `face` object in schema | `face.prompt`, `face.vibe`, `face.imageDataUrl`, `face.generatedAt`, `face.modelId` |

## Added

**SVG face controls:**
- **8 hair styles**: bob, long, pigtails, spiky, curly, buzz, ponytail, afro
- **Hair color picker** (full hex)
- **6 eye shapes**: round, almond, sleepy, wide, angry, sparkle
- **Eye color picker**
- **6 mouth shapes**: smile, smirk, grin, pout, flat, open
- **4 eyebrow styles**: none, arched, flat, angry
- **Blush toggle** (soft pink cheek ellipses)
- **Freckles toggle** (6 hand-positioned dots in darkened skin tone)
- **🎲 Randomize Face button** — the centrepiece control

**Schema v2:**
- `appearance.face` sub-object with all 8 fields
- `migrateV1ToV2()` — pure migration function, auto-runs on localStorage load
- v1 imports auto-migrate silently; show a "Updated to new face system" toast

**Visual consistency:**
- Head ellipse always renders in skin tone (no conditional skip)
- Z-order: head → blush → freckles → eyebrows → eyes → mouth → hair → accessory
- All layers use the same flat color, no shading, no gradients, same stroke weight

**Dev experience:**
- `app.js` now has a clear "GENERATED BUNDLE" header listing its canonical sources
- `main.js` + `lib/*.js` are unambiguously the canonical ES module source
- 37 schema tests covering v2 validation, migration, and edge cases
