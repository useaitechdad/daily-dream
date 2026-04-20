# Kickoff prompt for Antigravity

Copy the contents between the lines below and paste as your first message to Antigravity after opening the project folder.

---

I'd like you to build **phase 1** of a Tomodachi Life-inspired hobby project: a web-based Mii designer.

Before writing any code, read these three files in full and produce a short **plan artifact** listing the files you'll create or modify and any open questions:

1. `PRD.md` — the product requirements
2. `.agents/rules/project-rules.md` — always-on code rules
3. `.agents/skills/mii-schema.md` — the canonical Mii data schema

After I approve the plan, implement the designer under `apps/mii-designer/` and the shared schema assets under `shared/schema/`. Use the Artifacts system to show progress — at minimum:

- Plan artifact (before coding)
- Progress artifact after the SVG body/head/outfit rendering is working (screenshot)
- Progress artifact after face generation and compositing works (screenshot before + after)
- Progress artifact after save/gallery/export works (screenshot + sample exported JSON)
- Final verification artifact matching the "artifact-worthy demo" checklist in PRD.md

**Environment setup I will handle myself** (do not try to do these for me — just tell me what to do and when):

- Creating `.env` with my `GEMINI_API_KEY`
- Running the dev proxy server
- Real API test runs

**Use Plan mode** — I want to review your approach before you write code. Default to conservative choices that match the rules file; when in doubt, ask in an artifact rather than deciding silently.

One more thing: my 13-year-old daughter is the primary user. The UI should feel inviting and simple, not engineer-y. Think "character creator in a game" not "admin panel". Rounded corners, friendly colors, big click targets, playful (but not childish) copy.

Start by reading the three docs and producing the plan.

---

## What to do before pasting

1. Create a new folder, e.g. `~/projects/daily-dream`.
2. Copy the four files (`PRD.md`, `.agents/rules/project-rules.md`, `.agents/skills/mii-schema.md`, and this `KICKOFF.md`) into that folder, preserving the subfolder structure.
3. Add a `.gitignore` with at minimum:
   ```
   .env
   node_modules/
   .DS_Store
   ```
4. Open Antigravity. `File → Open Folder` → pick the project folder.
5. In the agent panel, switch to **Plan mode** (not Fast mode).
6. In settings, verify the model is set to Gemini 3 Pro (Gemini 3 Flash works too but Pro handles multi-file planning better).
7. Paste the prompt above into the chat.
8. Review the plan artifact when it appears. Comment on anything you want changed. Then approve.

## While the agent works

- The first time face generation is wired up, the agent will tell you to create `.env`. At that point, add:
  ```
  GEMINI_API_KEY=your_actual_key_here
  ```
  Get a key from https://aistudio.google.com/ if you don't have one. Free tier is plenty for this project.

- When the agent finishes a phase, it will post a verification artifact. Run through the demo yourself before approving. If something's off, leave a comment directly on the artifact (Antigravity supports Google Docs-style comments) — the agent will incorporate feedback without restarting.

## After the designer is done

Save the whole folder. Next weekend, phase 2 (the island simulation) will live under `apps/island/` and will import from `shared/schema/` — the designer keeps working standalone. I'll draft the phase 2 PRD when you're ready.

## If the agent does something you didn't want

Two common failure modes to watch for:

1. **Adds React / a framework**: the rules file forbids this. Reject the plan and point to `.agents/rules/project-rules.md`.
2. **Hardcodes the API key**: also forbidden. Reject and point to the same file.

Both are worth a thumbs-down / rollback rather than a patch, because they'll leak into everything else.
