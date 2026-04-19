# Project rules

These rules apply to every task in this repository. Antigravity loads them automatically.

## Stack and tooling

- Pure vanilla web: HTML + CSS + ES2022 JavaScript (ES modules via `<script type="module">`). No framework. No bundler. No TypeScript.
- A small Node.js proxy server is allowed for hiding API keys in dev (Node 20+, only `http` / `https` stdlib modules plus `dotenv`). Do not add Express, Fastify, or any web framework.
- No package managers other than `npm`. Only add a dependency if strictly required and flag it in an artifact first. Prefer zero dependencies.
- No TypeScript, no JSX, no Babel, no Webpack, no Vite, no Parcel.

## Code style

- Use `const` by default, `let` when reassignment is needed, never `var`.
- Name files in `camelCase.js` (e.g. `faceGenerator.js`), except `index.html` and `main.js`.
- Functions: small, pure where possible, and top-level where they don't close over state.
- Comments: only for non-obvious *why*. Never narrate *what* the code does.
- No `any`-style escape hatches. If a value's shape is unclear, write a JSDoc `@typedef` for it.
- Prefer explicit over clever. A 13-year-old's father should be able to read the code with no prior context and understand it.

## File and module conventions

- Each `.js` module has one clear responsibility named by its filename.
- Modules export named functions/constants only. No default exports.
- Every module that reads/writes localStorage or calls an external API goes under `apps/mii-designer/lib/`, never in `main.js`.
- Shared contracts (the Mii schema, shared assets) live in `/shared/`. Phase 2 will import from there — keep it stable.

## State management

- One central `state` object in `main.js`. Never mutate it from outside. Expose `getState()`, `setState(patch)`, and `subscribe(fn)`.
- Subscribers get called on every `setState`. Re-renders are subscriber-driven.
- Never store secrets in `state`. API keys live in `sessionStorage` or are handled by the proxy.

## Security

- The Gemini API key must never be hardcoded, committed, logged, or sent to any service other than `generativelanguage.googleapis.com`.
- `.env` must be in `.gitignore` from the first commit. Verify this before writing any key-handling code.
- When the user supplies a key in the fallback path, store in `sessionStorage` only, never `localStorage`.
- Do not add analytics, telemetry, or any network call beyond the Gemini API and local dev proxy.

## External APIs

- Only one external API is permitted in this phase: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent`.
- Any other network call (web fonts, CDN scripts, third-party images) must be flagged as an artifact question first.
- Rate-limit self-testing: during development, make at most 2 real API calls total. Use checked-in mock response fixtures for the rest.

## Testing

- No heavy test framework. Use plain Node's built-in `node:test` runner (`node --test`).
- Test files live alongside the module as `moduleName.test.js`.
- Required tests: schema validation, localStorage round-trip, prompt-builder output for a fixed input. Face rendering composition tests can use a mock base64 image.
- UI tests are not required. Screenshots in artifacts satisfy visual verification.

## Working with skills

- The Mii schema is defined in `.agents/skills/mii-schema.md`. Load this skill before writing anything that creates, reads, or validates a Mii record. Do not re-derive the schema from memory.
- When adding a new shape of data that phase 2 will consume, propose adding a new skill file rather than baking assumptions into code.

## Artifact expectations

- Before starting a task, produce a short plan artifact listing the files you will create or modify.
- Before declaring done, produce a verification artifact with screenshots and (where applicable) sample exported JSON.
- When you hit an ambiguity in the PRD, produce a single artifact listing all questions — don't drip them one at a time.

## Guardrails on scope

- If a task asks for phase 1 work, do not touch phase 2 ideas (simulation, dialogue, concert hall, dreams).
- Do not add login, accounts, multiplayer, or cloud sync in any phase without an explicit PRD for it.
- Do not replace existing well-working code to match a personal preference. Refactor only when fixing a bug or enabling a new feature in the PRD.

## Mentioned to the user

- Any time you would need to ask the user to set up an API key, paste a token, or change an environment variable, put this in the artifact summary explicitly with the exact command or file edit needed — don't bury it in code comments.
