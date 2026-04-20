# Mii schema

This is the canonical data shape for a Mii across all phases of the project. Phase 1 (designer) writes it. Phase 2 (simulation) reads it and extends runtime state around it. Do not alter the stored fields without updating this skill file.

## Storage key

Each Mii is stored in localStorage under the key `miis:{id}`, where `{id}` is a UUID v4 generated at creation time.

## JSON shape

```json
{
  "id": "string (UUID v4)",
  "schemaVersion": 2,
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
    "accessory": "none | glasses | hat | bow | headphones",
    "face": {
      "hairStyle": "bob | long | pigtails | spiky | curly | buzz | ponytail | afro",
      "hairColor": "#RRGGBB",
      "eyeShape": "round | almond | sleepy | wide | angry | sparkle",
      "eyeColor": "#RRGGBB",
      "mouthShape": "smile | smirk | grin | pout | flat | open",
      "eyebrows": "none | arched | flat | angry",
      "blush": true | false,
      "freckles": true | false
    }
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

Integer. Currently `2`. Any import of a file with version `1` must go through `migrateV1ToV2()` before being stored.

### `name`

Trim whitespace on save. Reject empty strings or names over 20 chars. Emoji are displayed fine in the UI but the stored name should not contain emoji — strip them with a regex before save.

### `personality`

Three integer values, each `0` to `100`. Default `50` each at creation. `0` = fully left side of the slider (introvert / calm / serious), `100` = fully right side (extrovert / intense / silly).

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

Enumerated. `none` renders nothing. Others are SVG fragments rendered on top of the head (z-ordered above the face).

### `appearance.face`

All face features are procedural SVG, rendered by `lib/miiRenderer.js`.

- `hairStyle`: one of 8 enumerated styles. Each is a set of SVG paths anchored to the head ellipse.
- `hairColor`: hex color for hair fill.
- `eyeShape`: one of 6 enumerated shapes. Rendered as a symmetric pair with white glint circles.
- `eyeColor`: hex color for eye fill.
- `mouthShape`: one of 6 enumerated shapes. Rendered as stroke/fill paths.
- `eyebrows`: one of 4 styles (`none` renders nothing). Color derived from `hairColor`, darkened ~15%.
- `blush`: boolean. Two soft pink ellipses on cheeks.
- `freckles`: boolean. Six small circles in darkened skin tone at hand-written coordinates.

### `meta.notes`

User's free-text notes. Not shown on preview but saved with the record. Phase 2 may feed these into prompts for dialogue. Keep under 500 chars; truncate on save with a UI warning if exceeded.

## Validation

Write a `validateMii(obj)` function in `shared/schema/miiSchema.js` that returns `{ valid: boolean, errors: string[] }`. Every save and every import must pass validation. On import, surface the error list to the user — do not silently drop fields.

## Migration: v1 → v2

Write a `migrateV1ToV2(mii)` function in `shared/schema/miiSchema.js` that:

1. Takes a v1 record (with top-level `face` object containing `prompt`, `vibe`, `imageDataUrl`, `generatedAt`, `modelId`)
2. Returns a new v2 record:
   - Drops the top-level `face` object entirely
   - Adds `appearance.face` with defaults: `hairStyle: "bob"`, `hairColor: "#3B2416"`, `eyeShape: "round"`, `eyeColor: "#2D1810"`, `mouthShape: "smile"`, `eyebrows: "arched"`, `blush: true`, `freckles: false`
   - Bumps `schemaVersion` to `2`
3. Pure function — does not mutate the input

On storage load, if a record has `schemaVersion: 1`, run it through `migrateV1ToV2`, rewrite to localStorage, and show a toast: "Updated {name} to new face system".

On import, if the record is v1, auto-migrate and import the v2 result.

## Example record

Used as the default "Example" Mii on first load:

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "schemaVersion": 2,
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
    "accessory": "glasses",
    "face": {
      "hairStyle": "bob",
      "hairColor": "#3B2416",
      "eyeShape": "round",
      "eyeColor": "#2D1810",
      "mouthShape": "smile",
      "eyebrows": "arched",
      "blush": true,
      "freckles": false
    }
  },
  "meta": {
    "notes": ""
  }
}
```
