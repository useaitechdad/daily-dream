# v0.2 — The hybrid build

**Status:** Working designer with known issues.
**Git tag:** `v0.2-hybrid`
**Date:** Apr 19, 2026
**Video:** Episode 2 — I let an AI agent code my daughter's game ([link when published])

## What this release is

The Mii designer as built by the AI coding agent from the v0.1 spec. Uses SVG for the body/outfit/accessories and Google's Nano Banana 2 (Gemini 3.1 Flash Image Preview) to generate chibi anime face portraits that are composited onto the SVG body. The "hybrid" approach.

## What works

- Designing a Mii with live SVG preview
- Generating AI portraits via Gemini API (through a local Node proxy for key hiding)
- Saving a gallery of Miis to localStorage
- JSON export/import conforming to the schema

## What's problematic

The AI-generated face and the SVG body speak different visual languages. The face has rendered shading and fine detail; the body is flat-color geometry. A gallery of Miis ends up looking like a costume contest rather than a coherent cast. This release is preserved as-is — warts included — because the next release documents the pivot away from it, and that pivot only makes sense if you can see what we pivoted away from.

## The story

My 13-year-old — the actual target user — tested this and immediately preferred the all-SVG Miis over the hybrid ones. Her reasoning (consistency) turned out to be the right call. The next release is what we built after listening to her.

## How to run it

Requires a Gemini API key. See `apps/mii-designer/README.md` at the root of the v0.2 tag for setup instructions.