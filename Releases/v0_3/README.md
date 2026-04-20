# v0.3 — The pivot to full SVG

**Status:** Current recommended version of phase 1.
**Git tag:** `v0.3-full-svg`
**Date:** Apr 19, 2026
**Video:** Episode 3 — My daughter was right and I was wrong ([link when published])

## What this release is

The Mii designer rebuilt without AI face generation. Every visual element — hair, eyes, mouth, eyebrows, blush, freckles, body, outfit, accessories — is procedural SVG. All Miis share the same visual language. No external APIs, no API keys, no proxy server, no rate limits, instant previews, works offline.

## What changed from v0.2

Removed:
- AI face generation (`faceGenerator.js`, `apiClient.js`)
- Dev proxy server (`dev-server.js`, `package.json`, `node_modules/`)
- API key handling and session storage
- Face prompt template and cache

Added:
- Expanded procedural SVG face: 10 hair styles, 8 eye shapes, 6 mouth shapes, 4 eyebrow styles, blush toggle, freckles toggle, free hair and eye color pickers
- 🎲 Randomize face button
- Schema v1 → v2 migration for existing saved Miis

## The story

v0.2 worked but looked incoherent when you saw multiple Miis together. My daughter spotted it immediately — the AI faces didn't belong on the flat SVG bodies. We tested her intuition by imagining 12 Miis in a gallery: hybrid faces would look like a crowd of mismatched characters; SVG faces look like a cast. She was right. We tore out the AI plumbing and expanded the SVG system instead.

The procedural approach turns out to be better on nearly every dimension for this use case: free, instant, offline, infinitely varied within one consistent style. The AI image model isn't "wrong" — it's just wrong for character portraits in a game where consistency matters more than individual-face uniqueness.

Nano Banana 2 will likely return in phase 3 for dream sequences, where the point is for things to look *different* from the waking world. Different job, different tool.

## How to run it

Open `apps/mii-designer/index.html` in a browser. No setup, no API key, no server.