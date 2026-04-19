# Mii schema

This is the canonical data shape for a Mii across all phases of the project. Phase 1 (designer) writes it. Phase 2 (simulation) reads it and extends runtime state around it. Do not alter the stored fields without updating this skill file.

## Storage key

Each Mii is stored in localStorage under the key `miis:{id}`, where `{id}` is a UUID v4 generated at creation time.

## JSON shape

```json
{
  "id": "string (UUID v4)",
  "schemaVersion": 1,
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp",

  "name": "string, 1-20 chars, no leading/trailing whitespace",

  "personality": {
    "introvertExtrovert": 0-100,
    "calmIntense": 0-100,
    "seriousSilly": 0-100
  },

  "appearance": {
    "skinTone": "pale | light | tan | olive | brown | deep",
    "bodyShape": "narrow | regular | stocky",
    "outfit": {
      "style": "tshirt | hoodie | dress | stripes | jacket | overalls",
      "primaryColor": "#RRGGBB",
      "secondaryColor": "#RRGGBB | null"
    },
    "accessory": "none | glasses | hat | bow | headphones"
  },

  "face": {
    "prompt": "string — the full prompt sent to Nano Banana 2",
    "vibe": "string — the user's free-text descriptor, may be empty",
    "imageDataUrl": "data:image/png;base64,... | null",
    "generatedAt": "ISO 8601 timestamp | null",
    "modelId": "gemini-3.1-flash-image-preview"
  },

  "meta": {
    "notes": "string — user's free-text notes about this Mii, may be empty"
  }
}
```

## Field notes

### `id`

UUID v4, generated client-side. Use `crypto.randomUUID()` — do not invent your own ID generator.

### `schemaVersion`

Integer. Currently `1`. Any import of a file with a different version must go through a migration path (not needed yet, but check the field so phase 2 can add migrations without breaking phase 1 files).

### `name`

Trim whitespace on save. Reject empty strings or names over 20 chars. Emoji are displayed fine in the UI but the stored name should not contain emoji — strip them with a regex before save.

### `personality`

Three integer values, each `0` to `100`. Default `50` each at creation. `0` = fully left side of the slider (introvert / calm / serious), `100` = fully right side (extrovert / intense / silly).

#### Mapping personality to prompt descriptors

When building the face generation prompt, convert slider values to descriptors using this mapping. Do NOT let the LLM freestyle — use these exact words so the cache works and results stay consistent.

| Slider | 0-20 | 21-40 | 41-60 | 61-80 | 81-100 |
|---|---|---|---|---|---|
| introvertExtrovert | "shy, reserved" | "quiet, thoughtful" | "balanced" | "friendly, open" | "outgoing, animated" |
| calmIntense | "serene, relaxed" | "easygoing" | "steady" | "spirited, alert" | "fiery, energetic" |
| seriousSilly | "solemn, composed" | "measured, dry" | "even-tempered" | "playful" | "goofy, mischievous" |

The face prompt template uses these as a comma-separated list.

### `appearance.skinTone`

Enumerated string. Each value maps to a fixed hex color in `lib/palette.js`:

- `pale`: `#F5D4B8`
- `light`: `#E8B591`
- `tan`: `#C98E6F`
- `olive`: `#A97054`
- `brown`: `#7D4E38`
- `deep`: `#4A2D1E`

### `appearance.bodyShape`

Enumerated. Controls torso width only in the SVG. `narrow` = 40px, `regular` = 56px, `stocky` = 72px (at the default sprite size of 240×320).

### `appearance.outfit.style`

Enumerated. Each style is a function in `lib/miiRenderer.js` that returns an SVG fragment given the primary (and optionally secondary) color.

- `tshirt`: single-color, crew neck
- `hoodie`: primary body, secondary hood/drawstring
- `dress`: single-color A-line
- `stripes`: primary base, secondary horizontal stripes
- `jacket`: primary outer, secondary inner shirt triangle at neck
- `overalls`: primary straps over secondary shirt

Styles without a secondary color ignore `secondaryColor` and store it as `null`.

### `appearance.outfit.primaryColor` / `secondaryColor`

Hex strings, uppercase, with leading `#`. Validator: `/^#[0-9A-F]{6}$/`.

### `appearance.accessory`

Enumerated. `none` renders nothing. Others are single-color SVG fragments rendered on top of the head SVG (z-ordered above the face image).

### `face.prompt`

The full prompt string sent to the image API. Stored so we can:
- Regenerate an identical face later (cache key)
- Debug prompt-vs-output mismatches
- Edit the prompt template and see what old Miis used

### `face.vibe`

The user's free-text input. Optional, may be empty string. Never `null` — use `""`.

### `face.imageDataUrl`

A full data URL: `data:image/png;base64,....`. May be `null` if the user has not generated a face yet. UI should show a placeholder (e.g. a simple smiley SVG) when null.

Size concern: a 1024×1024 PNG data URL is ~500KB-1.5MB. With 100 Miis you could blow past localStorage quotas (typically 5-10MB). Phase 1 acceptable cap: 50 saved Miis before the UI warns the user. Phase 2 will migrate face storage to IndexedDB.

### `face.generatedAt`

ISO timestamp of when the image was generated. `null` if no face yet.

### `face.modelId`

Always `"gemini-3.1-flash-image-preview"` in phase 1. Stored so that when phase 3 maybe upgrades to Nano Banana Pro, we can differentiate.

### `meta.notes`

User's free-text notes. Not shown on preview but saved with the record. Phase 2 may feed these into Claude/Gemini prompts for dialogue. Keep under 500 chars; truncate on save with a UI warning if exceeded.

## Validation

Write a `validateMii(obj)` function in `lib/miiSchema.js` that returns `{ valid: boolean, errors: string[] }`. Every save and every import must pass validation. On import, surface the error list to the user — do not silently drop fields.

## Prompt template for face generation

Use this exact template in `lib/faceGenerator.js`. Do not ad-lib.

```
Chibi anime portrait, head and shoulders only, front-facing, flat illustration style, clean lines, pastel colors, solid soft-pastel background (no gradient, no scene).

Character: {name}, {personalityDescriptors}. Skin tone: {skinToneDescriptor}.
{vibeLine}

Style requirements: cute chibi proportions, large expressive eyes, simple clean line art, NO text in image, NO watermark, NO body below the shoulders, NO hands.
```

Where:
- `{name}` is the Mii's name
- `{personalityDescriptors}` is the comma-separated output of the slider mapping above
- `{skinToneDescriptor}` is a human-readable skin tone phrase: `pale → "pale fair skin"`, `light → "light skin"`, `tan → "tan skin"`, `olive → "olive skin"`, `brown → "medium brown skin"`, `deep → "deep brown skin"`
- `{vibeLine}` is `"Extra vibe: {vibe}."` if vibe is non-empty, else `""`

Example output for a Mii named "Mika", all sliders at 85, skinTone `light`, vibe "grumpy wizard":

```
Chibi anime portrait, head and shoulders only, front-facing, flat illustration style, clean lines, pastel colors, solid soft-pastel background (no gradient, no scene).

Character: Mika, outgoing animated, fiery energetic, goofy mischievous. Skin tone: light skin.
Extra vibe: grumpy wizard.

Style requirements: cute chibi proportions, large expressive eyes, simple clean line art, NO text in image, NO watermark, NO body below the shoulders, NO hands.
```

## Caching

Cache key: SHA-256 hash of the prompt string, first 16 hex chars. Stored in localStorage under `faceCache:{hash}` → `{ imageDataUrl, generatedAt }`. Before calling the API, check the cache. Return cached result if present.

## Example record

Used as the default "Example" Mii on first load. Add this exact record to `shared/schema/example.mii.json`:

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "schemaVersion": 1,
  "createdAt": "2026-04-19T00:00:00.000Z",
  "updatedAt": "2026-04-19T00:00:00.000Z",
  "name": "Example",
  "personality": {
    "introvertExtrovert": 70,
    "calmIntense": 40,
    "seriousSilly": 75
  },
  "appearance": {
    "skinTone": "light",
    "bodyShape": "regular",
    "outfit": {
      "style": "hoodie",
      "primaryColor": "#7F77DD",
      "secondaryColor": "#534AB7"
    },
    "accessory": "glasses"
  },
  "face": {
    "prompt": "",
    "vibe": "",
    "imageDataUrl": null,
    "generatedAt": null,
    "modelId": "gemini-3.1-flash-image-preview"
  },
  "meta": {
    "notes": ""
  }
}
```
