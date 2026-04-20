# Releases/

**This folder is NOT a source of truth.** It's a documentation artifact for the YouTube video series on building this project.

## What it is

Frozen snapshots of the project at each video milestone. Each subfolder (`v0_1/`, `v0_2/`, etc.) contains:
- Copies of the spec files (PRD, rules, schema) as they were at that release
- A `WHAT-CHANGED.md` explaining what's different from the previous release, in plain English

## What it isn't

- NOT where Antigravity or any agent should read current project state
- NOT where specs are edited — always edit the canonical files at the repo root
- NOT authoritative if it conflicts with git tags — `git checkout v0.2-hybrid` is the real truth

## Where the canonical files live

- `/PRD.md` — current product requirements
- `/.agents/rules/project-rules.md` — current coding rules
- `/.agents/skills/mii-schema.md` — current data schema

These evolve with every phase. `Releases/vN/` folders freeze them at release time, nothing more.

## How snapshots get made

After each release is tagged:
1. Finish work on the phase
2. Update root-level canonical files to match final state
3. `git commit && git tag vN-name`
4. Copy the tagged canonical files into `Releases/vN/`
5. Write `Releases/vN/WHAT-CHANGED.md`
6. Commit those additions on top of the tag
